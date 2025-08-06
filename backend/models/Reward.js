const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['voucher', 'discount', 'cashback', 'product', 'experience'],
    required: true
  },
  category: {
    type: String,
    enum: ['dining', 'shopping', 'travel', 'entertainment', 'wellness', 'technology'],
    required: true
  },
  value: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  pointsCost: {
    type: Number,
    required: true,
    min: 0
  },
  partner: {
    name: {
      type: String,
      required: true
    },
    logo: String,
    id: String,
    apiEndpoint: String
  },
  image: {
    type: String,
    required: true
  },
  availability: {
    totalQuantity: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    remainingQuantity: {
      type: Number,
      default: -1
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  },
  terms: {
    type: String,
    required: true
  },
  validityPeriod: {
    type: Number,
    default: 90 // days
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  redemptionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
rewardSchema.index({ category: 1, isActive: 1 });
rewardSchema.index({ pointsCost: 1 });
rewardSchema.index({ featured: -1, createdAt: -1 });

// Virtual for availability status
rewardSchema.virtual('isAvailable').get(function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.availability.startDate > now) return false;
  if (this.availability.endDate && this.availability.endDate < now) return false;
  if (this.availability.remainingQuantity === 0) return false;
  
  return true;
});

// Method to check if user can redeem
rewardSchema.methods.canRedeem = function(userPoints) {
  return this.isAvailable && userPoints >= this.pointsCost;
};

// Method to process redemption
rewardSchema.methods.processRedemption = function() {
  if (this.availability.remainingQuantity > 0) {
    this.availability.remainingQuantity--;
  }
  this.redemptionCount++;
  return this.save();
};

rewardSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Reward', rewardSchema);