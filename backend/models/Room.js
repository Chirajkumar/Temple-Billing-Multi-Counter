const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // For setup
  type: String,
  capacity: Number,
  price: Number,
  status: { type: String, enum: ['Active', 'Maintenance', 'Inactive'] },
  facilities: String,
  // For booking
  bookedBy: String,
  checkIn: Date,
  checkOut: Date,
  roomId: String // physical room number like 101
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);

