const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Mock partner data for testing
const mockPartners = {
  'partner-1': {
    id: 'partner-1',
    name: 'Gaming Rewards Co.',
    type: 'gaming',
    endpoints: {
      createVoucher: '/api/ota/partner-1/vouchers',
      purchaseAddOn: '/api/ota/partner-1/purchase',
      validateVoucher: '/api/ota/partner-1/validate',
    },
    capabilities: ['vouchers', 'addons', 'validation'],
  },
  'partner-2': {
    id: 'partner-2',
    name: 'Entertainment Hub',
    type: 'entertainment',
    endpoints: {
      createVoucher: '/api/ota/partner-2/vouchers',
      purchaseAddOn: '/api/ota/partner-2/purchase',
      validateVoucher: '/api/ota/partner-2/validate',
    },
    capabilities: ['vouchers', 'addons'],
  },
};

// Mock voucher data
const mockVouchers = new Map();

// Mock add-on data
const mockAddOns = [
  {
    id: 'addon-1',
    name: 'Premium Gaming Pass',
    description: 'Access to premium gaming content for 30 days',
    price: 500,
    partnerId: 'partner-1',
    category: 'gaming',
    image: 'https://via.placeholder.com/300x200?text=Gaming+Pass',
  },
  {
    id: 'addon-2',
    name: 'Movie Streaming Credit',
    description: '$10 credit for movie streaming platform',
    price: 750,
    partnerId: 'partner-2',
    category: 'entertainment',
    image: 'https://via.placeholder.com/300x200?text=Movie+Credit',
  },
  {
    id: 'addon-3',
    name: 'Tech Gadget Discount',
    description: '20% off on selected tech gadgets',
    price: 1000,
    partnerId: 'partner-1',
    category: 'tech',
    image: 'https://via.placeholder.com/300x200?text=Tech+Discount',
  },
];

// Get available partners
router.get('/partners', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: Object.values(mockPartners),
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Create voucher (stub implementation)
router.post('/:partnerId/vouchers', auth, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { amount, currency, description, expiresAt } = req.body;

    if (!mockPartners[partnerId]) {
      return res.status(404).json({ error: req.t('errors.partnerNotFound') });
    }

    // Generate mock voucher
    const voucherId = `voucher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const voucherCode = `VOUCHER-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const voucher = {
      id: voucherId,
      code: voucherCode,
      amount,
      currency: currency || 'USD',
      description,
      partnerId,
      userId: req.user._id,
      status: 'active',
      createdAt: new Date(),
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    mockVouchers.set(voucherId, voucher);

    res.json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Purchase add-on (stub implementation)
router.post('/:partnerId/purchase', auth, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { addonId, quantity = 1 } = req.body;

    if (!mockPartners[partnerId]) {
      return res.status(404).json({ error: req.t('errors.partnerNotFound') });
    }

    const addon = mockAddOns.find(a => a.id === addonId && a.partnerId === partnerId);
    if (!addon) {
      return res.status(404).json({ error: req.t('errors.addonNotFound') });
    }

    // Check if user has enough points
    if (req.user.points < addon.price * quantity) {
      return res.status(400).json({ error: req.t('errors.insufficientPoints') });
    }

    // Generate purchase record
    const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const purchase = {
      id: purchaseId,
      addonId,
      partnerId,
      userId: req.user._id,
      quantity,
      totalPoints: addon.price * quantity,
      status: 'completed',
      createdAt: new Date(),
      addon: addon,
    };

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Validate voucher (stub implementation)
router.post('/:partnerId/validate', auth, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { voucherCode } = req.body;

    if (!mockPartners[partnerId]) {
      return res.status(404).json({ error: req.t('errors.partnerNotFound') });
    }

    // Find voucher in mock data
    const voucher = Array.from(mockVouchers.values()).find(
      v => v.code === voucherCode && v.partnerId === partnerId
    );

    if (!voucher) {
      return res.status(404).json({ error: req.t('errors.voucherNotFound') });
    }

    if (voucher.status !== 'active') {
      return res.status(400).json({ error: req.t('errors.voucherInactive') });
    }

    if (voucher.expiresAt < new Date()) {
      return res.status(400).json({ error: req.t('errors.voucherExpired') });
    }

    res.json({
      success: true,
      data: {
        isValid: true,
        voucher,
      },
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Get available add-ons for a partner
router.get('/:partnerId/addons', auth, async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!mockPartners[partnerId]) {
      return res.status(404).json({ error: req.t('errors.partnerNotFound') });
    }

    const addons = mockAddOns.filter(addon => addon.partnerId === partnerId);

    res.json({
      success: true,
      data: addons,
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Get user's vouchers for a partner
router.get('/:partnerId/vouchers', auth, async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!mockPartners[partnerId]) {
      return res.status(404).json({ error: req.t('errors.partnerNotFound') });
    }

    const userVouchers = Array.from(mockVouchers.values()).filter(
      voucher => voucher.userId.toString() === req.user._id.toString() && 
                voucher.partnerId === partnerId
    );

    res.json({
      success: true,
      data: userVouchers,
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

module.exports = router;