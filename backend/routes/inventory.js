const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');

// GET all inventory items
router.get('/items', async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create inventory item
router.post('/items', async (req, res) => {
  const item = new InventoryItem(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update inventory item
router.put('/items/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE inventory item
router.delete('/items/:id', async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add stock
router.post('/stock', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    item.currentStock += quantity;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
