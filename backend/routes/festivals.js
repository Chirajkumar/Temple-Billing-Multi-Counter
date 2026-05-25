const express = require('express');
const router = express.Router();
const Festival = require('../models/Festival');

// GET all festivals
router.get('/', async (req, res) => {
  try {
    const festivals = await Festival.find().sort({ startDate: -1 });
    res.json(festivals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create festival
router.post('/', async (req, res) => {
  const festival = new Festival(req.body);
  try {
    const newFestival = await festival.save();
    res.status(201).json(newFestival);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update festival
router.put('/:id', async (req, res) => {
  try {
    const festival = await Festival.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(festival);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE festival
router.delete('/:id', async (req, res) => {
  try {
    await Festival.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
