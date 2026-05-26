const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'like_post',
        'comment_post',
        'follow_account',
        'share_post',
        'subscribe_youtube',
        'join_whatsapp',
        'join_telegram',
      ],
      required: true,
    },
    reward: { type: Number, required: true },
    platform: { type: String },
    targetUrl: { type: String },
    requirements: { type: String },
    instructions: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    totalSlots: { type: Number, default: 100 },
    completedCount: { type: Number, default: 0 },
    dailyLimit: { type: Number, default: 10 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
