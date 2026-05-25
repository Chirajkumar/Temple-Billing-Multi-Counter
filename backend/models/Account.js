const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    transactionType: {
      type: String,
      required: true,
      enum: [
        'Seva Booking',
        'Donation',
        'Prasada Sale',
        'Room Booking',
        'Expense',
        'Salary'
      ]
    },
    debit: { type: Number, required: true, min: 0, default: 0 },
    credit: { type: Number, required: true, min: 0, default: 0 },
    balance: { type: Number, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true, collection: 'accounts' }
);

module.exports = mongoose.model('Account', accountSchema);
