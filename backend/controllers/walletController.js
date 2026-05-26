const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateReference } = require('../utils/helpers');

const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWalletHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.json({ ledger: [] });

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const ledger = wallet.ledger
      .sort((a, b) => b.date - a.date)
      .slice(skip, skip + parseInt(limit));

    res.json({ ledger, total: wallet.ledger.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const creditWallet = async (userId, amount, description, reference = null) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }

  const balanceBefore = wallet.balance;
  wallet.balance += amount;
  wallet.totalCredited += amount;

  wallet.ledger.push({
    type: 'credit',
    amount,
    description,
    reference: reference || generateReference('CR'),
    balanceBefore,
    balanceAfter: wallet.balance,
  });

  await wallet.save();

  await User.findByIdAndUpdate(userId, {
    $inc: { walletBalance: amount, totalEarned: amount },
  });

  return wallet;
};

const debitWallet = async (userId, amount, description, reference = null) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  const balanceBefore = wallet.balance;
  wallet.balance -= amount;
  wallet.totalDebited += amount;

  wallet.ledger.push({
    type: 'debit',
    amount,
    description,
    reference: reference || generateReference('DR'),
    balanceBefore,
    balanceAfter: wallet.balance,
  });

  await wallet.save();

  await User.findByIdAndUpdate(userId, {
    $inc: { walletBalance: -amount, totalWithdrawn: amount },
  });

  return wallet;
};

const selfActivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isAccountActivated) {
      return res.status(400).json({ message: 'Account already activated' });
    }

    const amount = parseInt(process.env.ACTIVATION_FEE || '1500');
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: `Insufficient balance. You need at least N${amount.toLocaleString()} to activate.` });
    }

    await debitWallet(user._id, amount, `Account activation fee: N${amount.toLocaleString()}`);

    user.isAccountActivated = true;
    await user.save();

    await Notification.create({
      user: user._id,
      title: 'Account Activated',
      message: `Your account has been activated! You can now start earning.`,
      type: 'success',
    });

    res.json({ message: 'Account activated successfully', isAccountActivated: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWallet, getWalletHistory, creditWallet, debitWallet, selfActivateAccount };
