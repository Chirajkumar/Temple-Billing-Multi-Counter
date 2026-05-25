const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

// Helper to validate MongoDB ID
const isValidMongoId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET all alerts for current user
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ accountId: req.user._id })
      .populate('accountId', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single alert by ID
router.get('/:id', protect, async (req, res) => {
  try {
    if (!isValidMongoId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid alert ID format' });
    }
    const alert = await Alert.findById(req.params.id).populate('accountId', 'name email');
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    // Verify alert belongs to current user
    if (alert.accountId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this alert' });
    }
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create alert
router.post('/', protect, async (req, res) => {
  const alertData = {
    ...req.body,
    accountId: req.user._id
  };
  const alert = new Alert(alertData);
  try {
    const newAlert = await alert.save();
    await newAlert.populate('accountId', 'name email');
    res.status(201).json(newAlert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (!isValidMongoId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid alert ID format' });
    }
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    // Verify alert belongs to current user
    if (alert.accountId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this alert' });
    }
    alert.status = req.body.status;
    const updatedAlert = await alert.save();
    await updatedAlert.populate('accountId', 'name email');
    res.json(updatedAlert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE dismiss alert
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!isValidMongoId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid alert ID format' });
    }
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    // Verify alert belongs to current user
    if (alert.accountId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this alert' });
    }
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert dismissed successfully', success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

