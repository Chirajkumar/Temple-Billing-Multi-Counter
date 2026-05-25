const express = require('express');
const router = express.Router();
const Devotee = require('../models/Devotee');

// GET all devotees
router.get('/', async (req, res) => {
  try {
    const devotees = await Devotee.find().sort({ createdAt: -1 }).limit(100);
    res.json(devotees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create devotee
router.post('/', async (req, res) => {
  const devotee = new Devotee(req.body);
  try {
    const newDevotee = await devotee.save();
    res.status(201).json(newDevotee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

