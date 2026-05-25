const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  devoteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Devotee' },
  devoteeName: String,
  mobile: String,
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Cash', 'Online', 'Cheque', 'General Donation', 'Annadanam (Food Donation)', 'Vastra Donation (Clothes)', 'Nitya Seva', 'Special Occasion'], default: 'General Donation' },
  description: String,
  status: { type: String, default: 'completed' },
  receiptNo: String,
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'DD'], default: 'Cash' },
  donationDate: { type: Date, default: Date.now },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  counter: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);

