const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['voucher', 'product', 'experience', 'cash', 'points'],
    default: 'voucher'
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP']
  },
  pointsCost: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  partner: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    id: {
      type: String,
      required: true
    },
    logo: {
      type: String,
      default: ''
    }
  },
  availability: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    remaining: {
      type: Number,
      required: true,
      min: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  eligibility: {
    minPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    userLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    requiredTasks: [{
      type: String,
      trim: true
    }]
  },
  terms: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'entertainment', 'shopping', 'travel', 'gaming', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  redemptionInstructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  expiryDays: {
    type: Number,
    default: 30,
    min: 1
  }
}, {
  timestamps: true
});

// Indexes for better query performance
rewardSchema.index({ isActive: 1, category: 1 });
rewardSchema.index({ 'availability.remaining': 1 });
rewardSchema.index({ pointsCost: 1 });
rewardSchema.index({ isFeatured: 1 });
rewardSchema.index({ 'partner.id': 1 });

// Virtual for availability status
rewardSchema.virtual('isAvailable').get(function() {
  const now = new Date();
  return this.isActive && 
         this.availability.remaining > 0 && 
         now >= this.availability.startDate && 
         now <= this.availability.endDate;
});

// Method to check if user is eligible
rewardSchema.methods.isUserEligible = function(user) {
  if (!this.isAvailable) return false;
  if (user.points < this.eligibility.minPoints) return false;
  if (user.points < this.pointsCost) return false;
  return true;
};

// Method to redeem reward
rewardSchema.methods.redeem = function() {
  if (this.availability.remaining <= 0) {
    throw new Error('Reward is out of stock');
  }
  this.availability.remaining -= 1;
  return this.save();
};

// Method to get discount percentage (for vouchers)
rewardSchema.virtual('discountPercentage').get(function() {
  if (this.type === 'voucher' && this.value > 0) {
    return Math.round((this.value / 100) * 100);
  }
  return null;
});

// Ensure virtual fields are serialized
rewardSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

module.exports = mongoose.model('Reward', rewardSchema);