const express = require('express');
const { protect } = require('../middleware/auth');
const AccountLedgerEntry = require('../models/AccountLedgerEntry');
const Account = require('../models/Account');

const router = express.Router();

// GET all ledger entries
router.get('/', protect, async (req, res) => {
  try {
    const entries = await AccountLedgerEntry.find({ createdBy: req.user?.id || req.user?._id })
      .sort({ date: 1, createdAt: 1 })
      .lean();

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create ledger entry
router.post('/', protect, async (req, res) => {
  try {
    const { date, transactionType, debit, credit, description } = req.body;

    const parsedDebit = Number(debit || 0);
    const parsedCredit = Number(credit || 0);

    if (!date) return res.status(422).json({ message: 'date is required' });
    if (!transactionType) return res.status(422).json({ message: 'transactionType is required' });
    if (!description) return res.status(422).json({ message: 'description is required' });
    if ((parsedDebit <= 0 && parsedCredit <= 0) || (parsedDebit > 0 && parsedCredit > 0)) {
      return res.status(422).json({ message: 'Provide either debit or credit (and only one)' });
    }

    const lastEntry = await AccountLedgerEntry.findOne({ createdBy: req.user?.id || req.user?._id })
      .sort({ createdAt: -1 })
      .lean();

    const lastBalance = lastEntry?.balance ?? 0;
    const balance = lastBalance + parsedDebit - parsedCredit;

    const created = await AccountLedgerEntry.create({
      date: new Date(date),
      transactionType,
      debit: parsedDebit,
      credit: parsedCredit,
      balance,
      description,
      createdBy: req.user?.id || req.user?._id
    });

    const createdAccount = await Account.create({
      date: new Date(date),
      transactionType,
      debit: parsedDebit,
      credit: parsedCredit,
      balance,
      description,
      createdBy: req.user?.id || req.user?._id
    });

    res.status(201).json({
      ledger: created,
      account: createdAccount
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
