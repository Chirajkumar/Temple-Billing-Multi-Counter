const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  openingStock: { type: Number, default: 0 },
  currentStock: { type: Number, required: true },
  minStock: { type: Number, default: 0 },
  supplier: String
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
