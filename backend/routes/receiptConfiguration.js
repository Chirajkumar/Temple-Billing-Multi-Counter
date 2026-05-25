const express = require('express');
const { protect } = require('../middleware/auth');
const ReceiptConfiguration = require('../models/ReceiptConfiguration');
const router = express.Router();

// GET receipt configuration
router.get('/', protect, async (req, res) => {
  try {
    let config = await ReceiptConfiguration.findOne()
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!config) {
      // Return default configuration if none exists
      config = new ReceiptConfiguration({
        templeName: 'Temple Name',
        address: 'Temple Address',
        phone: '000-0000000',
        gstin: '',
        receiptFooter: 'Thank you for your contribution',
        receiptPrefix: 'REC'
      });
    }
    
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET receipt configuration by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const config = await ReceiptConfiguration.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!config) {
      return res.status(404).json({ message: 'Receipt configuration not found' });
    }
    
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create receipt configuration
router.post('/', protect, async (req, res) => {
  try {
    // Check if configuration already exists
    let config = await ReceiptConfiguration.findOne();
    
    if (config) {
      return res.status(400).json({ message: 'Receipt configuration already exists. Use PUT to update.' });
    }
    
    config = new ReceiptConfiguration({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    
    await config.save();
    res.status(201).json({ message: 'Receipt configuration created successfully', config });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update receipt configuration
router.put('/', protect, async (req, res) => {
  try {
    let config = await ReceiptConfiguration.findOne();
    
    if (!config) {
      // Create new configuration if it doesn't exist
      config = new ReceiptConfiguration({
        ...req.body,
        createdBy: req.user._id,
        updatedBy: req.user._id
      });
    } else {
      // Update existing configuration
      Object.assign(config, req.body);
      config.updatedBy = req.user._id;
    }
    
    await config.save();
    res.json({ message: 'Receipt configuration updated successfully', config });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update receipt configuration by ID
router.put('/:id', protect, async (req, res) => {
  try {
    const config = await ReceiptConfiguration.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!config) {
      return res.status(404).json({ message: 'Receipt configuration not found' });
    }
    
    res.json({ message: 'Receipt configuration updated successfully', config });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE receipt configuration
router.delete('/:id', protect, async (req, res) => {
  try {
    const config = await ReceiptConfiguration.findByIdAndDelete(req.params.id);
    
    if (!config) {
      return res.status(404).json({ message: 'Receipt configuration not found' });
    }
    
    res.json({ message: 'Receipt configuration deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
