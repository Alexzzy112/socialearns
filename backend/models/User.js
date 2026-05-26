const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    isAccountActivated: { type: Boolean, default: false },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/default.png',
    },
    walletBalance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralEarnings: { type: Number, default: 0 },
    totalReferrals: { type: Number, default: 0 },
    dailyEarnings: { type: Number, default: 0 },
    lastEarningDate: { type: Date },
    bankAccount: {
      bankName: { type: String },
      accountNumber: { type: String },
      accountName: { type: String },
    },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    phoneVerificationCode: { type: String },
    phoneVerificationExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateReferralCode = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.referralCode = code;
};

module.exports = mongoose.model('User', userSchema);
