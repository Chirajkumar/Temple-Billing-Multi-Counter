const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: false, unique: true },
  location: String,
  assignedUser: String,
  openingTime: String,
  closingTime: String,
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Counter', counterSchema);
