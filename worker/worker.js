const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const TOKEN ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub2RlX2lkIjoibm9kZS10YXNrLWxpdmUiLCJpYXQiOjE3Njg5ODk1NDUsImV4cCI6MTc2ODk5MzE0NX0.8aMg-lkpNBd1iRHgYspZ-nOUu4i5GZxXkLqDdPzNlds';

const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${TOKEN}`
  }
});

async function processTasks() {
  try {
    /* ---------------- Fetch tasks ---------------- */
    const response = await axiosClient.get('/tasks');
    const tasks = response.data;

    if (!tasks.length) {
      console.log('ℹ️ No tasks assigned to this node');
      return;
    }

    for (const task of tasks) {
      try {
        /* -------- Mark IN_PROGRESS -------- */
        await axiosClient.patch(`/tasks/${task.task_id}/status`, {
          status: 'in_progress'
        });

        console.log(`▶️ Executing task: ${task.task_id}`);

        // ---- Simulate task execution ----
        // throw new Error('Execution failed'); // uncomment to test failure

        /* -------- Mark COMPLETED -------- */
        await axiosClient.patch(`/tasks/${task.task_id}/status`, {
          status: 'completed'
        });

        console.log(`✅ Task completed: ${task.task_id}`);
      } catch (taskError) {
        console.error(
          `❌ Task ${task.task_id} failed:`,
          taskError.response?.data || taskError.message
        );

        // Optional: mark task as failed
        try {
          await axiosClient.patch(`/tasks/${task.task_id}/status`, {
            status: 'failed'
          });
        } catch (_) {}
      }
    }
  } catch (error) {
    handleAuthAndNetworkErrors(error);
  }
}

/* ---------------- Central Error Handler ---------------- */
function handleAuthAndNetworkErrors(error) {
  if (!error.response) {
    console.error('🌐 Network error or server unreachable');
    return;
  }

  const { status, data } = error.response;

  switch (status) {
    case 401:
      console.error('🔒 Unauthorized: JWT missing or invalid');
      break;

    case 403:
      console.error(
        '⛔ Forbidden: Node is not authorized to access these tasks'
      );
      break;

    case 404:
      console.error('❓ Resource not found');
      break;

    case 500:
      console.error('💥 Server error:', data);
      break;

    default:
      console.error(`⚠️ Unexpected error (${status}):`, data);
  }
}

/* ---------------- Start Worker ---------------- */
processTasks();
