const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

const AuditLog = require('../models/AuditLog');


// Middleware to log actions
const logAction = async (req, action, module, details) => {
  try {
    await AuditLog.create({
      user: req.user.id,
      action,
      module,
      details,
      ipAddress: req.ip || req.connection.remoteAddress
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

// GET all audit logs
router.get('/', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { startDate, endDate, user, module } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (user) filter.user = user;
    if (module) filter.module = module;

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(1000);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export logAction for use in other routes
router.logAction = logAction;

module.exports = router;
