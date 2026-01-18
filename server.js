const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');



const app = express();
const PORT = 3000;

/* ---------------- Middleware ---------------- */
app.use(bodyParser.json());

/* ---------------- MongoDB Connection ---------------- */
mongoose.connect('mongodb+srv://task_system:Choudhury1000@cluster0.wxr8ov7.mongodb.net/task_system?retryWrites=true&w=majority&appName=Cluster0');

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

/* ---------------- Routes ---------------- */
app.use('/tasks', tasksRouter);
app.use('/auth', authRouter);

/* ---------------- Health Check ---------------- */
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

/* ---------------- Failover / Timeout Job ---------------- */
const Task = require('./models/Task');

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
}, 60 * 1000); // every 1 minute

/* ---------------- Start Server ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Task Server running on http://localhost:${PORT}`);
});
