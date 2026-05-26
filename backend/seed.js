require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Wallet = require('./models/Wallet');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await User.findOne({ email: 'azamukwokusilas2@gmail.com' });
    if (existing) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'azamukwokusilas2@gmail.com',
      phone: '+2348000000000',
      password: 'Alexzzy11',
      role: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      isAccountActivated: true,
    });

    admin.generateReferralCode();
    await admin.save();

    await Wallet.create({ user: admin._id, balance: 0 });

    console.log('Admin user created successfully');
    console.log('Email: azamukwokusilas2@gmail.com');
    console.log('Password: Alexzzy11');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
