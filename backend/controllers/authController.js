const User = require('../models/User');
const Wallet = require('../models/Wallet');
const generateToken = require('../utils/generateToken');
const { generateOTP } = require('../utils/helpers');
const crypto = require('crypto');

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, referralCode } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    const user = await User.create({ name, email, phone, password });
    user.generateReferralCode();

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        referrer.totalReferrals += 1;
        await referrer.save();
      }
    }

    await user.save();

    await Wallet.create({ user: user._id, balance: 0 });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
      isAccountActivated: user.isAccountActivated,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Account suspended. Contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
      isAccountActivated: user.isAccountActivated,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const otp = generateOTP();
    user.emailVerificationToken = otp;
    user.emailVerificationExpires = Date.now() + 3600000;
    await user.save();

    res.json({ message: 'Verification code sent to email', otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (user.emailVerificationToken !== otp || user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully', isEmailVerified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendPhoneVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const otp = generateOTP(4);
    user.phoneVerificationCode = otp;
    user.phoneVerificationExpires = Date.now() + 3600000;
    await user.save();

    res.json({ message: 'Verification code sent to phone', otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPhone = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (user.phoneVerificationCode !== otp || user.phoneVerificationExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Phone verified successfully', isPhoneVerified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    res.json({ message: 'Password reset link sent to email', resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendEmailVerification,
  verifyEmail,
  sendPhoneVerification,
  verifyPhone,
  forgotPassword,
  resetPassword,
};
