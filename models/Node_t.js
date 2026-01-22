const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  node_id: { type: String, unique: true, required: true },
  name: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  last_heartbeat_at: Date
}, { timestamps: true });

module.exports = mongoose.model('Node', NodeSchema);
