// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task_id: String,
  task_type: String,
  task_details: Object,
  assigned_node_id: String,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  lock_expires_at: Date
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
