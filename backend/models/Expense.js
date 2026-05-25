const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['Utilities', 'Maintenance', 'Salaries', 'Supplies', 'Events', 'Other']
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  paymentMode: { 
    type: String, 
    enum: ['Cash', 'Online', 'Cheque'], 
    default: 'Cash' 
  },
  receiptNo: String,
  date: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
