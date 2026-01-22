const express = require('express');
const Models = require('../models');
const auth = require('../middleware/authMiddleware');
const { randomUUID } = require('crypto');

const router = express.Router();

const Node = Models.Node;
const Task = Models.Task;

/* ============================
   NODE APIs (Admin/System)
============================ */

/* Create a Node */
router.post('/nodes', async (req, res) => {
  const { node_id, name } = req.body;

  const existing = await Node.findOne({ node_id });
  if (existing) {
    return res.status(400).json({ error: 'Node already exists' });
  }

  const node = await Node.create({
    node_id,
    name,
    status: 'active'
  });

  res.json(node);
});

/* Get All Nodes */
router.get('/nodes', async (req, res) => {
  const nodes = await Node.find({});
  res.json(nodes);
});

/* ============================
   TASK APIs (Admin/System)
============================ */

/* Create Task and Assign to Node */
router.post('/tasks', async (req, res) => {
  const { assigned_node_id } = req.body;

  // ✅ Validate node exists & active
  const node = await Node.findOne({
    node_id: assigned_node_id,
    status: 'active'
  });

  if (!node) {
    return res.status(400).json({ error: 'Invalid or inactive node' });
  }

  const task = await Task.create({
    task_id: randomUUID(),
    ...req.body,
    status: 'pending',
    lock_expires_at: Date.now() + 5 * 60 * 1000
  });

  res.json(task);
});

/* ============================
   WORKER NODE APIs
============================ */

/* Fetch Tasks for Node (Multiple tasks allowed per node) */
router.get('/tasks', auth, async (req, res) => {
  const tasks = await Task.find({
    assigned_node_id: req.node_id,
    status: { $in: ['pending', 'in_progress'] }
  });

  res.json(tasks);
});

/* Update Task Status (Idempotent) */
router.patch('/tasks/:id/status', auth, async (req, res) => {
  const task = await Task.findOne({ task_id: req.params.id });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.assigned_node_id !== req.node_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  /* ✅ IDEMPOTENCY CHECK */
  if (task.status === req.body.status) {
    return res.json(task); // NO-OP
  }

  const allowedTransitions = {
    pending: ['in_progress'],
    in_progress: ['completed', 'failed']
  };

  if (!allowedTransitions[task.status]?.includes(req.body.status)) {
    return res.status(400).json({ error: 'Invalid status transition' });
  }

  task.status = req.body.status;
  await task.save();

  res.json(task);
});

/* ============================
   EXPORT ROUTER
============================ */

module.exports = router;
