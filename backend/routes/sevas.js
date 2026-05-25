const express = require('express');
const router = express.Router();
const Seva = require('../models/Seva');
const Counter = require('../models/Counter');
const { protect } = require('../middleware/auth');
const { auditLog } = require('../utils/auditLog');

// GET all sevas
router.get('/', async (req, res) => {
  try {
    const sevas = await Seva.find();
    res.json(sevas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new seva
router.post('/', protect, async (req, res) => {
  try {
    // Force required fields based on authenticated user
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }

    if (!req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: user id missing' });
    }

    req.body.createdBy = req.user._id;

    // Handle counter assignment with robust fallback
    try {
      if (req.user.counter) {
        req.body.counter = req.user.counter;
      } else {
        const activeCounter = await Counter.findOne({ status: 'Active' });
        req.body.counter = activeCounter ? (activeCounter.name || activeCounter._id.toString()) : 'Main';
      }
    } catch (counterErr) {
      console.error('Error fetching counter:', counterErr);
      req.body.counter = 'Main'; // Fallback to Main counter
    }

    // Ensure counter is set (required by schema)
    if (!req.body.counter) {
      req.body.counter = 'Main';
    }

    const seva = new Seva(req.body);
    const newSeva = await seva.save();

    await auditLog(
      req,
      'Add Seva',
      'Seva',
      `Seva created. sevaId=${newSeva._id}, name=${newSeva.name}, price=${newSeva.price}, counter=${req.body.counter}`
    );

    res.status(201).json(newSeva);
  } catch (err) {
    try {
      await auditLog(
        req,
        'Add Seva',
        'Seva',
        `Seva creation failed. error=${err.message}`
      );
    } catch (_) {
      // ignore
    }
    res.status(400).json({ message: err.message });
  }
});




// GET slots for specific seva
router.get('/:id/slots', async (req, res) => {
  try {
    const seva = await Seva.findById(req.params.id);
    if (!seva) return res.status(404).json({ message: 'Seva not found' });
    res.json({ availableSlots: seva.slots || 10 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST book seva
router.post('/book', async (req, res) => {
  const { sevaId, devoteeName, date, totalAmount } = req.body;
  // In real app, create booking model, reduce slots
  res.status(201).json({
    id: Date.now(),
    sevaId,
    devoteeName,
    date,
    totalAmount,
    status: 'confirmed',
    bookedAt: new Date().toISOString()
  });
});

module.exports = router;

