const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  title: String,
  message: String,
  type: { type: String, enum: ['success', 'error', 'warning', 'info'] },
  status: { type: String, enum: ['active', 'read', 'unread'], default: 'unread' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);


