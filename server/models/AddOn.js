const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
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
    enum: ['premium', 'feature', 'boost', 'cosmetic', 'utility'],
    default: 'feature'
  },
  price: {
    amount: {
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
    }
  },
  image: {
    type: String,
    default: ''
  },
  features: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  duration: {
    type: String,
    enum: ['permanent', 'temporary', 'subscription'],
    default: 'permanent'
  },
  durationDays: {
    type: Number,
    default: null,
    min: 1
  },
  availability: {
    total: {
      type: Number,
      default: -1, // -1 means unlimited
      min: -1
    },
    remaining: {
      type: Number,
      default: -1,
      min: -1
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  requirements: {
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
    requiredAddOns: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AddOn'
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['productivity', 'entertainment', 'social', 'gaming', 'utility', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  instructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  compatibility: {
    platforms: [{
      type: String,
      enum: ['web', 'mobile', 'desktop'],
      default: ['web']
    }],
    browsers: [{
      type: String,
      enum: ['chrome', 'firefox', 'safari', 'edge'],
      default: ['chrome', 'firefox', 'safari', 'edge']
    }]
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
addOnSchema.index({ isActive: 1, category: 1 });
addOnSchema.index({ 'availability.remaining': 1 });
addOnSchema.index({ 'price.pointsCost': 1 });
addOnSchema.index({ isFeatured: 1, isPopular: 1 });
addOnSchema.index({ type: 1 });

// Virtual for availability status
addOnSchema.virtual('isAvailable').get(function() {
  const now = new Date();
  const isInStock = this.availability.remaining === -1 || this.availability.remaining > 0;
  const isInDateRange = !this.availability.endDate || now <= this.availability.endDate;
  return this.isActive && isInStock && isInDateRange;
});

// Method to check if user is eligible
addOnSchema.methods.isUserEligible = function(user) {
  if (!this.isAvailable) return false;
  if (user.points < this.requirements.minPoints) return false;
  if (user.points < this.price.pointsCost) return false;
  return true;
};

// Method to purchase add-on
addOnSchema.methods.purchase = function() {
  if (this.availability.remaining === 0) {
    throw new Error('Add-on is out of stock');
  }
  if (this.availability.remaining > 0) {
    this.availability.remaining -= 1;
  }
  return this.save();
};

// Virtual for formatted price
addOnSchema.virtual('formattedPrice').get(function() {
  return `${this.price.currency} ${this.price.amount.toFixed(2)}`;
});

// Virtual for discount (if applicable)
addOnSchema.virtual('hasDiscount').get(function() {
  return this.metadata.get('originalPrice') && 
         this.metadata.get('originalPrice') > this.price.amount;
});

addOnSchema.virtual('discountPercentage').get(function() {
  if (!this.hasDiscount) return 0;
  const originalPrice = this.metadata.get('originalPrice');
  return Math.round(((originalPrice - this.price.amount) / originalPrice) * 100);
});

// Ensure virtual fields are serialized
addOnSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

module.exports = mongoose.model('AddOn', addOnSchema);