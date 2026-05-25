const express = require('express');
const router = express.Router();
const PrasadaItem = require('../models/PrasadaItem');

// GET all prasada items
router.get('/items', async (req, res) => {
  try {
    const items = await PrasadaItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create prasada item
router.post('/items', async (req, res) => {
  const item = new PrasadaItem(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update prasada item
router.put('/items/:id', async (req, res) => {
  try {
    const item = await PrasadaItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE prasada item
router.delete('/items/:id', async (req, res) => {
  try {
    await PrasadaItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
