const express = require('express');
const router = express.Router();
const Counter = require('../models/Counter');

// GET all counters
router.get('/', async (req, res) => {
  try {
    const counters = await Counter.find().sort({ createdAt: -1 });
    res.json(counters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create counter
function makeAutoCounterCode(existingCodes = new Set()) {
  // CTR0001 format
  const now = Date.now();
  const rand = Math.floor(Math.random() * 100000);
  const n = (now + rand) % 10000;
  const code = `CTR${String(n).padStart(4, '0')}`;
  return existingCodes.has(code) ? null : code;
}

// POST create counter
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };

    if (!body.code) {
      const existingCodes = new Set((await Counter.find({}, 'code')).map(c => c.code).filter(Boolean));
      let code = null;
      for (let i = 0; i < 10 && !code; i++) {
        code = makeAutoCounterCode(existingCodes);
      }
      if (!code) {
        return res.status(400).json({ message: 'Could not auto-generate unique counter code. Please try again.' });
      }
      body.code = code;
    }

    const counter = new Counter(body);
    const newCounter = await counter.save();
    res.status(201).json(newCounter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update counter
router.put('/:id', async (req, res) => {
  try {
    const counter = await Counter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(counter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE counter
router.delete('/:id', async (req, res) => {
  try {
    await Counter.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
