const mongoose = require('mongoose');

const sevaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Daily Seva' },
  price: { type: Number, required: true },
  duration: { type: Number, default: 30 }, // minutes
  maxDevotees: { type: Number, default: 1 },
  availableDays: [String],
  description: String,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  counter: {
    type: String,
    required: true
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Seva', sevaSchema);

