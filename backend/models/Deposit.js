const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'paystack' },
    reference: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'reversed', 'deleted'],
      default: 'pending',
    },
    isActivationFee: { type: Boolean, default: false },
    narration: { type: String },
    screenshot: { type: String },
    bankName: { type: String },
    paystackResponse: { type: Object },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deposit', depositSchema);
