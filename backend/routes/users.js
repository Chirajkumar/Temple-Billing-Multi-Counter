const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Seva = require('../models/Seva');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET all users
router.get('/', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create user
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, email, password, role, counter, permissions } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      counter,
      permissions
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name, email, role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      counter: req.user.counter,
      permissions: req.user.permissions || [],
      createdAt: req.user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update current user's profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    const updateData = {
      name,
      email,
    };

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update user (admin)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const { name, email, role, counter, permissions, active } = req.body;
    const updateData = { name, email, role, counter, permissions, active };

    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST change password (current user)
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords required' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my reports (user-specific data)
router.get('/my-reports', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userCounter = req.user.counter;
    
    const donations = await Donation.countDocuments({ 
      createdBy: userId, 
      counter: userCounter 
    });
    const sevas = await Seva.countDocuments({ 
      createdBy: userId,
      counter: userCounter 
    });
    
    const revenueResult = await Donation.aggregate([
      { $match: { 
        createdBy: userId,
        counter: userCounter 
      } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Recent transactions (last 10)
    const recentDonations = await Donation.find({ 
      createdBy: userId, 
      counter: userCounter 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount type description createdAt');
    
    const recentSevas = await Seva.find({ 
      createdBy: userId,
      counter: userCounter 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price createdAt');
    
    // Combine recent transactions
    const recentTransactions = [
      ...recentDonations.map(d => ({
        id: d._id,
        type: `Donation - ${d.type}`,
        amount: d.amount,
        date: d.createdAt,
        counter: userCounter
      })),
      ...recentSevas.map(s => ({
        id: s._id,
        type: `Seva Booking - ${s.name}`,
        amount: s.price,
        date: s.createdAt,
        counter: userCounter
      }))
    ].slice(0, 10); // Top 10 total
    
    res.json({
      donations,
      sevas,
      totalRevenue: revenueResult[0]?.total || 0,
      recentTransactions,
      lastLogin: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE user
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

