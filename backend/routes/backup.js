const express = require('express');
const path = require('path');
const fs = require('fs');

const { protect, authorize } = require('../middleware/auth');

const User = require('../models/User');
const Devotee = require('../models/Devotee');
const Seva = require('../models/Seva');
const Donation = require('../models/Donation');
const Expense = require('../models/Expense');
const InventoryItem = require('../models/InventoryItem');
const PrasadaItem = require('../models/PrasadaItem');
const ReceiptConfiguration = require('../models/ReceiptConfiguration');
const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');
const Staff = require('../models/Staff');
const Counter = require('../models/Counter');
const Alert = require('../models/Alert');
const Festival = require('../models/Festival');
const AuditLog = require('../models/AuditLog');

const {
  listBackupsOnDisk,
  getBackupPathById,
  createBackupSnapshot,
  writeBackupToDisk,
  restoreBackupSnapshot,
  readBackupFromDisk,
  safeBackupId,
  cleanupOldBackups,
  getBackupStats,
} = require('../utils/backup');

const router = express.Router();

const collections = {
  User,
  Devotee,
  Seva,
  Donation,
  Expense,
  InventoryItem,
  PrasadaItem,
  ReceiptConfiguration,
  Room,
  RoomBooking,
  Staff,
  Counter,
  Alert,
  Festival,
  AuditLog,
};

const makeBackupId = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  // Example: 2026-05-16T12-34-56-123Z
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}-${pad(d.getUTCSeconds())}-${String(d.getUTCMilliseconds()).padStart(3, '0')}Z`;
};

// Create backup
router.post('/', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { type = 'full' } = req.body || {};

    const backupId = makeBackupId();
    const snapshot = await createBackupSnapshot({ collections });
    writeBackupToDisk({ backupId, snapshot });
    
    // Auto-cleanup old backups
    cleanupOldBackups();

    res.status(201).json({
      message: 'Backup created successfully',
      backup: {
        id: backupId,
        type,
        createdAt: snapshot.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Backup failed' });
  }
});

// List backups
router.get('/', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const backups = listBackupsOnDisk();
    const stats = getBackupStats();
    res.json({ backups, stats });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list backups' });
  }
});

// Get backup statistics
router.get('/stats', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const stats = getBackupStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to get stats' });
  }
});

// Download backup file
router.get('/download/:backupId', protect, authorize('Admin', 'Manager'), (req, res) => {
  try {
    const backupId = safeBackupId(req.params.backupId);
    const backupPath = getBackupPathById(backupId);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ message: 'Backup not found' });
    }

    res.download(backupPath, `backup-${backupId}.json`);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Download failed' });
  }
});

// Delete backup file
router.delete('/:backupId', protect, authorize('Admin', 'Manager'), (req, res) => {
  try {
    const backupId = safeBackupId(req.params.backupId);
    const backupPath = getBackupPathById(backupId);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ message: 'Backup not found' });
    }

    fs.unlinkSync(backupPath);
    res.json({ message: 'Backup deleted successfully', backupId });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Delete failed' });
  }
});

// Restore backup
router.post('/restore/:backupId', protect, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const backupId = safeBackupId(req.params.backupId);
    const snapshot = readBackupFromDisk({ backupId });

    if (!snapshot) {
      return res.status(404).json({ message: 'Backup not found' });
    }

    await restoreBackupSnapshot({ snapshot, collections });

    res.json({
      message: 'Restore completed successfully',
      backupId,
      restoredAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Restore failed' });
  }
});

module.exports = router;

