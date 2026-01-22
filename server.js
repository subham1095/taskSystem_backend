require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const connectDB = require('./config/db');

// Routers
const taskRouter = require('./routes/task1');   // contains nodes + tasks
const authRouter = require('./routes/auth');    // node login

// Models
const Models = require('./models');
const Task = Models.Task;

const app = express();
const PORT = process.env.PORT || 3000;

/* ============================
   MIDDLEWARE
============================ */
app.use(bodyParser.json());

/* ============================
   DATABASE
============================ */
connectDB();

/* ============================
   ROUTES
============================ */

// Node authentication
app.use('/auth', authRouter);

// Nodes + Tasks APIs
app.use('/', taskRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

/* ============================
   FAILOVER / TIMEOUT JOB
============================ */
/**
 * Marks tasks as failed if:
 * - status = in_progress
 * - lock_expires_at is expired
 */
setInterval(async () => {
  try {
    const result = await Task.updateMany(
      {
        status: 'in_progress',
        lock_expires_at: { $lt: Date.now() }
      },
      {
        $set: { status: 'failed' }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `⚠️ Marked ${result.modifiedCount} task(s) as failed due to timeout`
      );
    }
  } catch (err) {
    console.error('❌ Failover job error:', err.message);
  }
}, 60 * 1000);

/* ============================
   START SERVER
============================ */
app.listen(PORT, () => {
  console.log(`🚀 Task Server running on http://localhost:${PORT}`);
});
