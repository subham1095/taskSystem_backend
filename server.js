require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const connectDB = require('./config/db');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- Middleware ---------------- */
app.use(bodyParser.json());

/* ---------------- Database ---------------- */
connectDB();

/* ---------------- Routes ---------------- */
app.use('/tasks', tasksRouter);
app.use('/auth', authRouter);

/* ---------------- Health Check ---------------- */
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

/* ---------------- Failover / Timeout Job ---------------- */
setInterval(async () => {
  const expiredTasks = await Task.updateMany(
    {
      status: 'in_progress',
      lock_expires_at: { $lt: Date.now() }
    },
    { status: 'failed' }
  );

  if (expiredTasks.modifiedCount > 0) {
    console.log(`⚠️ Marked ${expiredTasks.modifiedCount} task(s) as failed due to timeout`);
  }
}, 60 * 1000);

/* ---------------- Start Server ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Task Server running on http://localhost:${PORT}`);
});
