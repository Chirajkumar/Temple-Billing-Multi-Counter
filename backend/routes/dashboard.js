const express = require('express');
const Donation = require('../models/Donation');
const Devotee = require('../models/Devotee');
const Seva = require('../models/Seva');
const Alert = require('../models/Alert');
const InventoryItem = require('../models/InventoryItem');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthly = new Date();
    monthly.setDate(1);
    monthly.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthly.getFullYear(), monthly.getMonth() + 1, 0, 23, 59, 59);

    // Get today's donations total
    const todayDonationsResult = await Donation.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get monthly donations total
    const monthlyDonationsResult = await Donation.aggregate([
      { $match: { createdAt: { $gte: monthly, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get total devotees count
    const totalDevotees = await Devotee.countDocuments();

    // Get today's seva bookings (sevas created today)
    const totalSevaBookings = await Seva.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get stock alerts count (inventory items where current stock <= minimum stock)
    const stockAlerts = await InventoryItem.countDocuments({
      $expr: { $lte: ['$currentStock', '$minStock'] }
    });

    // Get unread alerts
    const unreadAlerts = await Alert.countDocuments({ status: 'unread' });

    res.json({
      todayCollection: todayDonationsResult[0]?.total || 0,
      totalSevaBookings: totalSevaBookings,
      totalDonations: monthlyDonationsResult[0]?.total || 0,
      stockAlerts: stockAlerts,
      monthlyTarget: 500000,
      monthlyAchieved: monthlyDonationsResult[0]?.total || 0,
      devotees: totalDevotees,
      unreadAlerts: unreadAlerts
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET weekly revenue data
router.get('/weekly-revenue', protect, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const dailyRevenue = await Donation.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for frontend
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = daysOfWeek[date.getDay()];
      
      const dayData = dailyRevenue.find(d => d._id === dateStr);
      data.push({
        name: dayName,
        revenue: dayData?.revenue || 0,
        expenses: 0 // Placeholder - you'll need expense tracking
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Weekly revenue error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET seva distribution
router.get('/seva-distribution', protect, async (req, res) => {
  try {
    const sevas = await Seva.find().limit(10);
    
    const data = sevas.map(seva => ({
      name: seva.name,
      bookings: 0, // Placeholder - need booking tracking
      revenue: seva.price || 0
    }));

    res.json(data);
  } catch (err) {
    console.error('Seva distribution error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET donation distribution
router.get('/donation-distribution', protect, async (req, res) => {
  try {
    const monthly = new Date();
    monthly.setDate(1);
    monthly.setHours(0, 0, 0, 0);

    const distribution = await Donation.aggregate([
      { $match: { createdAt: { $gte: monthly } } },
      {
        $group: {
          _id: '$type',
          value: { $sum: '$amount' }
        }
      }
    ]);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const data = distribution.map((item, index) => ({
      name: item._id || 'General',
      value: item.value,
      color: colors[index % colors.length]
    }));

    res.json(data);
  } catch (err) {
    console.error('Donation distribution error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET recent transactions
router.get('/recent-transactions', protect, async (req, res) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('devoteeId', 'name');

    const transactions = donations.map(donation => ({
      id: donation._id,
      type: donation.type || 'Donation',
      amount: donation.amount,
      date: donation.createdAt.toLocaleString(),
      status: donation.status || 'Completed'
    }));

    res.json(transactions);
  } catch (err) {
    console.error('Recent transactions error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET all transactions (Donation + Seva)
router.get('/all-transactions', protect, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const search = (req.query.search || '').trim();

    const skip = (page - 1) * limit;

    // Build search filters (best-effort; different fields exist on Donation/Seva)
    const donationMatch = {};
    const sevaMatch = {};

    if (search) {
      donationMatch.$or = [
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { receiptNo: { $regex: search, $options: 'i' } }
      ];
      sevaMatch.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [donations, sevas] = await Promise.all([
      Donation.find(donationMatch)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select({ type: 1, amount: 1, description: 1, status: 1, receiptNo: 1, createdAt: 1 })
        .lean(),
      Seva.find(sevaMatch)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select({ name: 1, price: 1, description: 1, createdAt: 1 })
        .lean()
    ]);

    const transactions = [
      ...donations.map((d) => ({
        id: String(d._id),
        type: d.type || 'Donation',
        amount: d.amount,
        date: d.createdAt ? d.createdAt.toLocaleString() : '',
        createdAt: d.createdAt,
        status: (d.status || 'completed').toString()
      })),
      ...sevas.map((s) => ({
        id: String(s._id),
        type: s.name || 'Seva',
        amount: s.price,
        date: s.createdAt ? s.createdAt.toLocaleString() : '',
        createdAt: s.createdAt,
        status: 'Completed'
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .map(({ createdAt, ...rest }) => rest);

    res.json({
      transactions
    });
  } catch (err) {
    console.error('All transactions error:', err);
    res.status(500).json({ message: err.message });
  }
});


// NEW: GET daily report by date - COUNTER-WISE
router.get('/daily-report', protect, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter required (YYYY-MM-DD)' });
    }

    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    // Aggregate DONATIONS by counter
    const donationData = await Donation.aggregate([
      { $match: { 
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        counter: { $exists: true, $ne: null }
      }},
      {
        $group: {
          _id: '$counter',
          amount: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      {
        $project: {
          counter: '$_id',
          amount: 1,
          transactions: 1,
          _id: 0
        }
      }
    ]);

    // Aggregate SEVAS by counter  
    const sevaData = await Seva.aggregate([
      { $match: { 
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        counter: { $exists: true, $ne: null }
      }},
      {
        $group: {
          _id: '$counter',
          amount: { $sum: '$price' },
          transactions: { $sum: 1 }
        }
      },
      {
        $project: {
          counter: '$_id',
          amount: 1,
          transactions: 1,
          _id: 0
        }
      }
    ]);

    // MERGE donation + seva data by counter
    const counterWiseMap = {};
    [...donationData, ...sevaData].forEach(item => {
      if (!counterWiseMap[item.counter]) {
        counterWiseMap[item.counter] = { counter: item.counter, amount: 0, transactions: 0 };
      }
      counterWiseMap[item.counter].amount += item.amount || 0;
      counterWiseMap[item.counter].transactions += item.transactions || 0;
    });

    const counterWiseCollection = Object.values(counterWiseMap);

    // TOTALS
    const totalCollection = counterWiseCollection.reduce((sum, item) => sum + item.amount, 0);
    const totalTransactions = counterWiseCollection.reduce((sum, item) => sum + item.transactions, 0);

    // Summary counts
    const totalDonations = await Donation.countDocuments({ 
      createdAt: { $gte: startOfDay, $lte: endOfDay } 
    });
    const totalSevas = await Seva.countDocuments({ 
      createdAt: { $gte: startOfDay, $lte: endOfDay } 
    });

    res.json({
      date: date,
      counterWiseCollection,
      totalCollection,
      totalTransactions,
      donations: totalDonations,
      sevas: totalSevas,
      period: 'Daily'
    });
  } catch (err) {
    console.error('Daily report error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


