const mongoose = require('mongoose');

const receiptConfigurationSchema = new mongoose.Schema({
  templeName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  gstin: {
    type: String,
    default: ''
  },
  receiptFooter: {
    type: String,
    default: ''
  },
  receiptPrefix: {
    type: String,
    default: 'REC'
  },
  logo: {
    type: String,
    default: ''
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('ReceiptConfiguration', receiptConfigurationSchema);
