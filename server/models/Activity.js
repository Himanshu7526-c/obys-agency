const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['task', 'survey', 'purchase', 'referral', 'social', 'custom'],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pointsReward: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'in_progress', 'completed', 'failed', 'expired'],
    default: 'available',
  },
  completedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  requirements: {
    minAge: Number,
    location: String,
    deviceType: String,
    customFields: mongoose.Schema.Types.Mixed,
  },
  metadata: {
    category: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    estimatedTime: Number, // in minutes
    tags: [String],
  },
  partnerData: {
    partnerId: String,
    externalId: String,
    partnerMetadata: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
activitySchema.index({ user: 1, status: 1 });
activitySchema.index({ type: 1, status: 1 });
activitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Activity', activitySchema);