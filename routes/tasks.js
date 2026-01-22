const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');
const { randomUUID } = require('crypto');

const router = express.Router();

/* Create Task (Admin/System) */
router.post('/', async (req, res) => {
  const task = await Task.create({
    task_id: randomUUID(),
    ...req.body,
    lock_expires_at: Date.now() + 5 * 60 * 1000
  });
  res.json(task);
});


/* Fetch Tasks for Node */
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find({
    assigned_node_id: req.node_id,
    status: { $in: ['pending', 'in_progress'] }
  });
  res.json(tasks);
});

/* Update Task Status */
router.patch('/:id/status', auth, async (req, res) => {
  const task = await Task.findOne({ task_id: req.params.id });

  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.assigned_node_id !== req.node_id)
    return res.status(403).json({ error: 'Unauthorized' });

  // ✅ IDENTITY CHECK (IDEMPOTENCY CORE)
  if (task.status === req.body.status) {
    return res.json(task); // NO-OP, SAFE RETRY
  }

  const allowed = {
    pending: ['in_progress'],
    in_progress: ['completed', 'failed']
  };
console.log(allowed[task.status], req.body.status,task.status,allowed[task.status]?.includes(req.body.status),"<<<");

  if (!allowed[task.status]?.includes(req.body.status)) {
    return res.status(400).json({ error: 'Invalid status transition' });
  }

  task.status = req.body.status;
  await task.save();
  res.json(task);
});


/* ✅ THIS LINE IS CRITICAL */
module.exports = router;
