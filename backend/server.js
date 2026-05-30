const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const walletRoutes = require('./routes/wallet');
const depositRoutes = require('./routes/deposits');
const withdrawalRoutes = require('./routes/withdrawals');
const referralRoutes = require('./routes/referrals');
const notificationRoutes = require('./routes/notifications');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.SITE_URL || '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.locals.io = io;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts. Please try again later.' },
});

app.use(helmet());
app.use(cors({ origin: process.env.SITE_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  let responded = false;
  const timeout = setTimeout(() => {
    responded = true;
    res.status(503).json({ message: 'Database connecting. Please wait and refresh.' });
  }, 40000);
  const onConnected = () => {
    if (!responded) { clearTimeout(timeout); next(); }
  };
  if (mongoose.connection.readyState === 1) return onConnected();
  mongoose.connection.on('connected', onConnected);
});

app.use('/api/auth', authLimiter);
app.use('/api', limiter);

const Wallet = require('./models/Wallet');
const User = require('./models/User');

app.get('/api/cleanup', async (req, res) => {
  try {
    const Wallet = require('./models/Wallet');
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    const walletCount = await Wallet.countDocuments();
    await User.deleteMany({});
    await Wallet.deleteMany({});
    res.json({ message: `Deleted ${userCount} users and ${walletCount} wallets. Database is now empty.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/setup-admin', async (req, res) => {
  try {
    const existing = await User.findOne({ email: 'azamukwokusilas2@gmail.com' });
    if (existing) {
      existing.password = 'Alexzzy11';
      existing.role = 'admin';
      await existing.save();
      return res.json({ message: 'Admin password reset to Alexzzy11' });
    }
    const admin = await User.create({
      name: 'Admin', email: 'azamukwokusilas2@gmail.com', phone: '+2348000000000',
      password: 'Alexzzy11', role: 'admin', isEmailVerified: true, isPhoneVerified: true, isAccountActivated: true,
    });
    admin.generateReferralCode();
    await admin.save();
    await Wallet.create({ user: admin._id, balance: 0 });
    res.json({ message: 'Admin created. Email: azamukwokusilas2@gmail.com, Password: Alexzzy11' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ 
    status: 'OK', 
    message: 'Social Earn API is running',
    dbConnected: dbState === 1,
    dbState: states[dbState] || 'unknown'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

connectDB().catch(err => console.error('DB connection error:', err));
connectCloudinary();
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

module.exports = app;
module.exports.httpServer = httpServer;
module.exports.io = io;
