require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Temple Management Backend API running!' });
});

// DB Connect (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Placeholder for routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/devotees', require('./routes/devotees'));
app.use('/api/sevas', require('./routes/sevas'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/counters', require('./routes/counters'));
app.use('/api/prasada', require('./routes/prasada'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/festivals', require('./routes/festivals'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/receipt-config', require('./routes/receiptConfiguration'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/ledger', require('./routes/ledger'));

// 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

