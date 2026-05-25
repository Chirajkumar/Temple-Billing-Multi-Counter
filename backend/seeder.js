require('dotenv').config();
const mongoose = require('mongoose');
const Devotee = require('./models/Devotee');
const Seva = require('./models/Seva');
const Room = require('./models/Room');
const Alert = require('./models/Alert');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      Devotee.deleteMany(),
      Seva.deleteMany(),
      Room.deleteMany(),
      Alert.deleteMany(),
      User.deleteMany()
    ]);

    // Seed devotees
    await Devotee.insertMany([
      { name: 'Rama Krishna', mobile: '9876543210', address: '123 Temple St', email: 'rama@example.com' },
      { name: 'Sita Devi', mobile: '9876543211', address: '456 Main Rd', email: 'sita@example.com' }
    ]);

    // Seed admin user (needed for Seva.createdBy)
    let adminUser = await User.findOne({ email: 'admin@temple.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@temple.com',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'Admin'
      });
    }


    // Seed sevas
    // Note: Seva model requires `createdBy` and `counter`.
    await Seva.insertMany([
      {
        name: 'Abhishekam',
        price: 2500,
        duration: 30,
        slots: 10,
        counter: 'Counter 1',
        createdBy: adminUser._id
      },
      {
        name: 'Archana',
        price: 500,
        duration: 15,
        slots: 20,
        counter: 'Counter 1',
        createdBy: adminUser._id
      }
    ]);


    // Seed rooms setup

    await Room.insertMany([
      { roomId: '101', type: 'AC Single', capacity: 1, price: 1500, status: 'Active', facilities: 'AC, TV, WiFi' },
      { roomId: '102', type: 'AC Double', capacity: 2, price: 2500, status: 'Active', facilities: 'AC, TV, WiFi, Balcony' },
      { roomId: '201', type: 'Non-AC Single', capacity: 1, price: 800, status: 'Active', facilities: 'Fan, Hot Water' },
      { roomId: '202', type: 'Non-AC Double', capacity: 2, price: 1400, status: 'Maintenance', facilities: 'Fan' },
      { roomId: '301', type: 'VIP Suite', capacity: 4, price: 5000, status: 'Active', facilities: 'AC, TV, Fridge, Kitchenette' }
    ]);

    // Seed alerts (Alert model requires accountId)
    await Alert.insertMany([
      { accountId: adminUser._id, title: 'System Update', message: 'System maintenance scheduled for tonight at 10 PM.', type: 'warning', status: 'active' },
      { accountId: adminUser._id, title: 'High Value Donation', message: 'New donation of ₹25,000 received.', type: 'success', status: 'unread' },
      { accountId: adminUser._id, title: 'Low Stock Alert', message: 'Prasada item "Laddu" stock below threshold.', type: 'error', status: 'active' }
    ]);


    // Seed admin user
    if (!adminUser) {
      await User.create({
        name: 'Admin User',
        email: 'admin@temple.com',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'admin'
      });
    }


    console.log('Seeding completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });

