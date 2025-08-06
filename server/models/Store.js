const mongoose = require('mongoose');

const storeItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['gaming', 'entertainment', 'lifestyle', 'tech', 'food', 'other'],
  },
  price: {
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  image: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    default: -1, // -1 means unlimited
  },
  partnerData: {
    partnerId: String,
    externalId: String,
    partnerMetadata: mongoose.Schema.Types.Mixed,
  },
  metadata: {
    tags: [String],
    features: [String],
    requirements: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreItem',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  totalCurrency: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['points', 'stripe', 'mixed'],
    required: true,
  },
  stripePaymentIntentId: String,
  voucherCode: String,
  partnerData: {
    partnerId: String,
    externalId: String,
    partnerMetadata: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
storeItemSchema.index({ category: 1, isActive: 1 });
purchaseSchema.index({ user: 1, status: 1 });
purchaseSchema.index({ createdAt: 1 });

const StoreItem = mongoose.model('StoreItem', storeItemSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = { StoreItem, Purchase };