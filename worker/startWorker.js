const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const NODE_ID = 'node-new';

/* ---------------- LOGIN & TOKEN ---------------- */
async function loginNode() {
  const response = await axios.post(`${API_BASE}/auth/node/login`, {
    node_id: NODE_ID
  });

  return response.data.token;
}

/* ---------------- AXIOS CLIENT ---------------- */
function createClient(token) {
  return axios.create({
    baseURL: API_BASE,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/* ---------------- TASK PROCESSOR ---------------- */
async function processTasks(client) {
  const response = await client.get('/tasks');
  const tasks = response.data;

  if (!tasks.length) {
    console.log('ℹ️ No tasks assigned to this node');
    return;
  }

  for (const task of tasks) {
    await executeTask(client, task);
  }
}

/* ---------------- TASK EXECUTION ---------------- */
async function executeTask(client, task) {
  try {
    /* ---- Mark IN_PROGRESS (Idempotent) ---- */
    await client.patch(`/tasks/${task.task_id}/status`, {
      status: 'in_progress'
    });

    console.log(`▶️ Executing task ${task.task_id}`);

    /* ---- Simulate Business Logic ---- */
    await performBusinessLogic(task);

    /* ---- Mark COMPLETED ---- */
    await client.patch(`/tasks/${task.task_id}/status`, {
      status: 'completed'
    });

    console.log(`✅ Task completed ${task.task_id}`);
  } catch (error) {
    console.error(`❌ Task ${task.task_id} failed`);

    /* ---- Mark FAILED (Best-effort) ---- */
    try {
      await client.patch(`/tasks/${task.task_id}/status`, {
        status: 'failed'
      });
    } catch (_) {}

    logError(error);
  }
}

/* ---------------- BUSINESS LOGIC ---------------- */
async function performBusinessLogic(task) {
  // Simulate async work
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

/* ---------------- ERROR HANDLING ---------------- */
function logError(error) {
  if (!error.response) {
    console.error('🌐 Network error or server unreachable');
    return;
  }

  const { status, data } = error.response;

  const errorMap = {
    401: '🔒 Unauthorized: Token invalid or expired',
    403: '⛔ Forbidden: Task not owned by this node',
    404: '❓ Task not found',
    400: '⚠️ Invalid status transition',
    500: '💥 Server error'
  };

  console.error(errorMap[status] || '⚠️ Unexpected error', data);
}

/* ---------------- WORKER START ---------------- */
async function startWorker() {
  try {
    const token = await loginNode();
    const client = createClient(token);

    await processTasks(client);
  } catch (error) {
    console.error('🚨 Worker startup failed');
    logError(error);
  }
}

startWorker();
