const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['points', 'voucher', 'prize', 'addon'],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pointsValue: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'redeemed', 'expired', 'cancelled'],
    default: 'pending',
  },
  source: {
    type: String,
    required: true,
    enum: ['task', 'activity', 'purchase', 'bonus', 'referral'],
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel',
  },
  sourceModel: {
    type: String,
    enum: ['Activity', 'Task', 'Purchase'],
  },
  expiresAt: {
    type: Date,
  },
  redeemedAt: {
    type: Date,
  },
  voucherCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  partnerData: {
    partnerId: String,
    externalId: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
rewardSchema.index({ user: 1, status: 1 });
rewardSchema.index({ user: 1, type: 1 });
rewardSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reward', rewardSchema);