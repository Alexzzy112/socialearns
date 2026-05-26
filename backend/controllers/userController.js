const User = require('../models/User');
const Wallet = require('../models/Wallet');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -emailVerificationToken -emailVerificationExpires -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires');
    const wallet = await Wallet.findOne({ user: user._id });
    res.json({ user, wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, bankAccount } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bankAccount) {
      user.bankAccount = {
        bankName: bankAccount.bankName || user.bankAccount?.bankName,
        accountNumber: bankAccount.accountNumber || user.bankAccount?.accountNumber,
        accountName: bankAccount.accountName || user.bankAccount?.accountName,
      };
    }

    if (req.file) {
      user.avatar = req.file.path;
    }

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('walletBalance totalEarned totalWithdrawn completedTasks pendingTasks referralEarnings totalReferrals dailyEarnings')
      .populate('referredBy', 'name email');

    const wallet = await Wallet.findOne({ user: user._id });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    res.json({
      stats: {
        walletBalance: user.walletBalance,
        totalEarned: user.totalEarned,
        totalWithdrawn: user.totalWithdrawn,
        completedTasks: user.completedTasks,
        pendingTasks: user.pendingTasks,
        referralEarnings: user.referralEarnings,
        totalReferrals: user.totalReferrals,
        dailyEarnings: user.dailyEarnings,
      },
      wallet,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, getUserDashboard, updatePassword };
