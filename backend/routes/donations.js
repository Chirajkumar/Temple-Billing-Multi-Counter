const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Counter = require('../models/Counter');
const { protect } = require('../middleware/auth');
const { auditLog } = require('../utils/auditLog');

// GET all donations
router.get('/', async (req, res) => {

  try {
    const { dateRange } = req.query;
    let query = {};
    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0,0,0,0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.createdAt = { $gte: today, $lt: tomorrow };
    }
    const donations = await Donation.find(query).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create donation
router.post('/', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }

    // Populate required fields from authenticated user
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

    const donation = new Donation(req.body);
    const newDonation = await donation.save();

    await auditLog(
      req,
      'Add Donation',
      'Donation',
      `Donation created. donationId=${newDonation._id}, amount=${newDonation.amount}, type=${newDonation.type}, counter=${req.body.counter}`
    );

    res.status(201).json(newDonation);
  } catch (err) {
    try {
      await auditLog(
        req,
        'Add Donation',
        'Donation',
        `Donation creation failed. error=${err.message}`
      );
    } catch (_) {
      // ignore
    }
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;

