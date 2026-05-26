const User = require('../models/User');
const Notification = require('../models/Notification');
const { creditWallet } = require('./walletController');

const getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('referralCode referralEarnings totalReferrals referredBy')
      .populate('referredBy', 'name email');

    const referrals = await User.find({ referredBy: req.user._id })
      .select('name email createdAt totalEarned')
      .sort('-createdAt');

    const referralLink = `${process.env.SITE_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`;

    res.json({
      referralCode: user.referralCode,
      referralLink,
      referralEarnings: user.referralEarnings,
      totalReferrals: user.totalReferrals,
      referredBy: user.referredBy,
      referrals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processReferralBonus = async (referrerId, newUserId) => {
  try {
    const bonus = parseInt(process.env.REFERRAL_BONUS) || 800;

    await creditWallet(
      referrerId,
      bonus,
      `Referral bonus for referring a new user`,
      `REF${newUserId}`
    );

    await User.findByIdAndUpdate(referrerId, {
      $inc: { referralEarnings: bonus },
    });

    await Notification.create({
      user: referrerId,
      title: 'Referral Bonus!',
      message: `You earned N${bonus} referral bonus!`,
      type: 'success',
    });
  } catch (error) {
    console.error('Referral bonus error:', error);
  }
};

module.exports = { getReferralInfo, processReferralBonus };
