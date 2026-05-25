const mongoose = require('mongoose');

const prasadaItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  openingStock: { type: Number, default: 0 },
  currentStock: { type: Number, required: true },
  minStock: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PrasadaItem', prasadaItemSchema);
