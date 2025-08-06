const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Mock partner data
const mockPartners = {
  'amazon': {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://via.placeholder.com/100x50/FF9900/FFFFFF?text=Amazon',
    apiEndpoint: 'https://api.amazon.com/vouchers',
    supportedTypes: ['voucher', 'discount'],
    categories: ['shopping', 'electronics']
  },
  'starbucks': {
    id: 'starbucks',
    name: 'Starbucks',
    logo: 'https://via.placeholder.com/100x50/00704A/FFFFFF?text=Starbucks',
    apiEndpoint: 'https://api.starbucks.com/vouchers',
    supportedTypes: ['voucher'],
    categories: ['dining']
  },
  'uber': {
    id: 'uber',
    name: 'Uber',
    logo: 'https://via.placeholder.com/100x50/000000/FFFFFF?text=Uber',
    apiEndpoint: 'https://api.uber.com/vouchers',
    supportedTypes: ['voucher', 'discount'],
    categories: ['travel']
  }
};

// Mock voucher templates
const mockVoucherTemplates = [
  {
    id: 'amazon-10',
    partnerId: 'amazon',
    title: '$10 Amazon Gift Card',
    description: 'Redeemable for any purchase on Amazon.com',
    value: { amount: 10, currency: 'USD' },
    pointsCost: 100,
    category: 'shopping',
    image: 'https://via.placeholder.com/300x200/FF9900/FFFFFF?text=$10+Amazon'
  },
  {
    id: 'starbucks-5',
    partnerId: 'starbucks',
    title: '$5 Starbucks Card',
    description: 'Perfect for your daily coffee fix',
    value: { amount: 5, currency: 'USD' },
    pointsCost: 50,
    category: 'dining',
    image: 'https://via.placeholder.com/300x200/00704A/FFFFFF?text=$5+Starbucks'
  },
  {
    id: 'uber-15',
    partnerId: 'uber',
    title: '$15 Uber Credit',
    description: 'Get around town with Uber rides',
    value: { amount: 15, currency: 'USD' },
    pointsCost: 150,
    category: 'travel',
    image: 'https://via.placeholder.com/300x200/000000/FFFFFF?text=$15+Uber'
  }
];

// Mock add-on products
const mockAddOns = [
  {
    id: 'premium-boost',
    title: 'Premium Point Boost',
    description: '2x points for 7 days',
    price: { amount: 4.99, currency: 'USD' },
    type: 'boost',
    duration: 7,
    multiplier: 2,
    image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=2x+Boost'
  },
  {
    id: 'task-unlock',
    title: 'Exclusive Task Pack',
    description: 'Unlock 5 high-value tasks',
    price: { amount: 9.99, currency: 'USD' },
    type: 'content',
    taskCount: 5,
    image: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Task+Pack'
  },
  {
    id: 'level-skip',
    title: 'Level Skip Token',
    description: 'Instantly advance one level',
    price: { amount: 2.99, currency: 'USD' },
    type: 'progression',
    levelBoost: 1,
    image: 'https://via.placeholder.com/300x200/FF5722/FFFFFF?text=Level+Skip'
  }
];

// GET /api/ota/partners - Get all available partners
router.get('/partners', auth, (req, res) => {
  try {
    const partners = Object.values(mockPartners);
    res.json({
      success: true,
      data: partners,
      count: partners.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners',
      error: error.message
    });
  }
});

// GET /api/ota/vouchers - Get available voucher templates
router.get('/vouchers', auth, (req, res) => {
  try {
    const { category, partnerId, minPoints, maxPoints } = req.query;
    let vouchers = [...mockVoucherTemplates];

    // Apply filters
    if (category) {
      vouchers = vouchers.filter(v => v.category === category);
    }
    if (partnerId) {
      vouchers = vouchers.filter(v => v.partnerId === partnerId);
    }
    if (minPoints) {
      vouchers = vouchers.filter(v => v.pointsCost >= parseInt(minPoints));
    }
    if (maxPoints) {
      vouchers = vouchers.filter(v => v.pointsCost <= parseInt(maxPoints));
    }

    // Add partner info
    const enrichedVouchers = vouchers.map(voucher => ({
      ...voucher,
      partner: mockPartners[voucher.partnerId]
    }));

    res.json({
      success: true,
      data: enrichedVouchers,
      count: enrichedVouchers.length,
      filters: { category, partnerId, minPoints, maxPoints }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vouchers',
      error: error.message
    });
  }
});

// POST /api/ota/vouchers/create - Create/redeem a voucher
router.post('/vouchers/create', [
  auth,
  body('voucherId').notEmpty().withMessage('Voucher ID is required'),
  body('userPoints').isNumeric().withMessage('User points must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { voucherId, userPoints } = req.body;
    const userId = req.user.id;

    // Find voucher template
    const voucherTemplate = mockVoucherTemplates.find(v => v.id === voucherId);
    if (!voucherTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Voucher template not found'
      });
    }

    // Check if user has enough points
    if (userPoints < voucherTemplate.pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points',
        required: voucherTemplate.pointsCost,
        available: userPoints
      });
    }

    // Generate mock voucher code
    const voucherCode = `ACT-${voucherId.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 days validity

    // Mock API call to partner (simulate delay)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    const createdVoucher = {
      id: `voucher_${Date.now()}`,
      code: voucherCode,
      template: voucherTemplate,
      partner: mockPartners[voucherTemplate.partnerId],
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      redemptionUrl: `https://redeem.${voucherTemplate.partnerId}.com/${voucherCode}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${voucherCode}`
    };

    res.json({
      success: true,
      message: 'Voucher created successfully',
      data: createdVoucher
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create voucher',
      error: error.message
    });
  }
});

// GET /api/ota/addons - Get available add-on products
router.get('/addons', auth, (req, res) => {
  try {
    const { type, maxPrice } = req.query;
    let addons = [...mockAddOns];

    // Apply filters
    if (type) {
      addons = addons.filter(addon => addon.type === type);
    }
    if (maxPrice) {
      addons = addons.filter(addon => addon.price.amount <= parseFloat(maxPrice));
    }

    res.json({
      success: true,
      data: addons,
      count: addons.length,
      filters: { type, maxPrice }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch add-ons',
      error: error.message
    });
  }
});

// POST /api/ota/addons/purchase - Purchase an add-on product
router.post('/addons/purchase', [
  auth,
  body('addonId').notEmpty().withMessage('Add-on ID is required'),
  body('paymentMethodId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { addonId, paymentMethodId } = req.body;
    const userId = req.user.id;

    // Find add-on
    const addon = mockAddOns.find(a => a.id === addonId);
    if (!addon) {
      return res.status(404).json({
        success: false,
        message: 'Add-on not found'
      });
    }

    // Mock Stripe payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock successful purchase
    const purchase = {
      id: `purchase_${Date.now()}`,
      addon: addon,
      userId: userId,
      amount: addon.price.amount,
      currency: addon.price.currency,
      status: 'completed',
      paymentIntentId: `pi_mock_${Date.now()}`,
      purchasedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      expiresAt: addon.duration ? 
        new Date(Date.now() + addon.duration * 24 * 60 * 60 * 1000).toISOString() : 
        null
    };

    res.json({
      success: true,
      message: 'Add-on purchased successfully',
      data: purchase
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to purchase add-on',
      error: error.message
    });
  }
});

// GET /api/ota/vouchers/:id/status - Check voucher status with partner
router.get('/vouchers/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock API call to partner to check status
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock status response
    const status = {
      id: id,
      status: 'active',
      remainingValue: Math.floor(Math.random() * 100) / 10, // Random remaining value
      lastUsed: null,
      usageHistory: [],
      checkedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check voucher status',
      error: error.message
    });
  }
});

// POST /api/ota/test-connection - Test partner API connection
router.post('/test-connection', [
  auth,
  body('partnerId').notEmpty().withMessage('Partner ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { partnerId } = req.body;
    const partner = mockPartners[partnerId];

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Mock connection test
    await new Promise(resolve => setTimeout(resolve, 800));

    res.json({
      success: true,
      message: 'Connection test successful',
      data: {
        partnerId: partnerId,
        partnerName: partner.name,
        endpoint: partner.apiEndpoint,
        latency: Math.floor(Math.random() * 200) + 50, // Mock latency
        status: 'connected',
        testedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: error.message
    });
  }
});

module.exports = router;