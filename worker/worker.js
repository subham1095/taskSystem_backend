// worker/worker.js
const axios = require('axios');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub2RlX2lkIjoibm9kZS0xMjM0NSIsImlhdCI6MTc2ODY2ODg2NiwiZXhwIjoxNzY4NjcyNDY2fQ.LDf49E8pVaACaHu-KIMtR5TJub4DFzlcITBYASQrLjY';

async function processTasks() {
  const tasks = await axios.get('http://localhost:3000/tasks', {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  for (const task of tasks.data) {
    await axios.patch(
      `http://localhost:3000/tasks/${task.task_id}/status`,
      { status: 'in_progress' },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    // execute task
    console.log('Executing:', task.task_id);

    await axios.patch(
      `http://localhost:3000/tasks/${task.task_id}/status`,
      { status: 'completed' },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
  }
}

processTasks();
