const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  task_id: { type: String, unique: true },
  task_type: String,
  task_details: Object,

  assigned_node_id: {
    type: String,
    required: true,
    index: true
  },

  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },

  lock_expires_at: Date
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
