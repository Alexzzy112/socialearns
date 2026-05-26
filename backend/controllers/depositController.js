const Deposit = require('../models/Deposit');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Notification = require('../models/Notification');
const { creditWallet } = require('./walletController');
const { generateReference } = require('../utils/helpers');
const axios = require('axios');

const initializeDeposit = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum deposit is N100' });
    }

    const reference = generateReference('DEP');

    const deposit = await Deposit.create({
      user: req.user._id,
      amount,
      reference,
      isActivationFee: req.body.isActivation || false,
    });

    res.json({
      message: 'Deposit initiated',
      deposit: {
        _id: deposit._id,
        amount: deposit.amount,
        reference: deposit.reference,
        status: deposit.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    const deposit = await Deposit.findOne({ reference });
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data } = response.data;

    if (data.status === 'success' && data.amount / 100 === deposit.amount) {
      deposit.status = 'approved';
      deposit.paystackResponse = data;
      deposit.processedAt = new Date();
      await deposit.save();

      await creditWallet(
        deposit.user,
        deposit.amount,
        `Deposit via Paystack (Ref: ${reference})`,
        reference
      );

      const user = await User.findById(deposit.user);
      if (deposit.isActivationFee || deposit.amount >= parseInt(process.env.ACTIVATION_FEE)) {
        user.isAccountActivated = true;
        await user.save();
      }

      await Notification.create({
        user: deposit.user,
        title: 'Deposit Successful',
        message: `N${deposit.amount} has been credited to your wallet.`,
        type: 'success',
      });

      return res.json({ message: 'Payment verified successfully', deposit });
    }

    deposit.status = 'reversed';
    await deposit.save();

    res.status(400).json({ message: 'Payment verification failed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user._id }).sort('-createdAt');
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createManualDeposit = async (req, res) => {
  try {
    const { amount, bankName } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum deposit is N100' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Payment receipt screenshot is required' });
    }

    const reference = 'MAN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const isActivation = parseInt(amount) >= parseInt(process.env.ACTIVATION_FEE || '1500');

    const deposit = await Deposit.create({
      user: req.user._id,
      amount: parseInt(amount),
      reference,
      paymentMethod: 'manual_bank',
      bankName: bankName || 'Moniepoint',
      screenshot: req.file.path,
      isActivationFee: isActivation,
    });

    res.status(201).json({
      message: 'Deposit request submitted. Awaiting admin approval.',
      deposit: {
        _id: deposit._id,
        amount: deposit.amount,
        reference: deposit.reference,
        status: deposit.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { initializeDeposit, verifyPaystackPayment, getUserDeposits, createManualDeposit };
