const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Mock partner data for testing
const mockPartners = {
  'partner-1': {
    id: 'partner-1',
    name: 'TravelCo',
    type: 'travel',
    logo: 'https://via.placeholder.com/150x50/4F46E5/FFFFFF?text=TravelCo',
    apiEndpoint: 'https://api.travelco.com/v1',
    status: 'active'
  },
  'partner-2': {
    id: 'partner-2',
    name: 'FoodExpress',
    type: 'food',
    logo: 'https://via.placeholder.com/150x50/DC2626/FFFFFF?text=FoodExpress',
    apiEndpoint: 'https://api.foodexpress.com/v1',
    status: 'active'
  },
  'partner-3': {
    id: 'partner-3',
    name: 'ShopHub',
    type: 'retail',
    logo: 'https://via.placeholder.com/150x50/059669/FFFFFF?text=ShopHub',
    apiEndpoint: 'https://api.shophub.com/v1',
    status: 'active'
  }
};

// Mock vouchers data
const mockVouchers = [
  {
    id: 'voucher-1',
    partnerId: 'partner-1',
    code: 'TRAVEL20',
    type: 'percentage',
    value: 20,
    currency: 'USD',
    minSpend: 50,
    maxDiscount: 100,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    usageLimit: 1000,
    usedCount: 150,
    status: 'active'
  },
  {
    id: 'voucher-2',
    partnerId: 'partner-2',
    code: 'FOOD15',
    type: 'fixed',
    value: 15,
    currency: 'USD',
    minSpend: 30,
    maxDiscount: 15,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    usageLimit: 500,
    usedCount: 75,
    status: 'active'
  },
  {
    id: 'voucher-3',
    partnerId: 'partner-3',
    code: 'SHOP25',
    type: 'percentage',
    value: 25,
    currency: 'USD',
    minSpend: 40,
    maxDiscount: 50,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    usageLimit: 200,
    usedCount: 45,
    status: 'active'
  }
];

// Mock add-ons data
const mockAddOns = [
  {
    id: 'addon-1',
    partnerId: 'partner-1',
    name: 'Premium Travel Insurance',
    description: 'Comprehensive travel insurance coverage',
    price: 25.00,
    currency: 'USD',
    pointsCost: 250,
    features: ['Medical coverage', 'Trip cancellation', 'Baggage protection'],
    duration: 'temporary',
    durationDays: 30,
    status: 'active'
  },
  {
    id: 'addon-2',
    partnerId: 'partner-2',
    name: 'Priority Delivery',
    description: 'Get your food delivered in 15 minutes',
    price: 5.00,
    currency: 'USD',
    pointsCost: 50,
    features: ['15-minute delivery', 'Priority support', 'Free delivery'],
    duration: 'permanent',
    status: 'active'
  },
  {
    id: 'addon-3',
    partnerId: 'partner-3',
    name: 'Extended Warranty',
    description: 'Extended warranty for all purchases',
    price: 10.00,
    currency: 'USD',
    pointsCost: 100,
    features: ['2-year warranty', 'Free repairs', 'Replacement guarantee'],
    duration: 'permanent',
    status: 'active'
  }
];

// GET /api/ota/partners - Get all partners
router.get('/partners', auth, async (req, res) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    res.json({
      success: true,
      data: Object.values(mockPartners),
      message: req.t('common.partnersRetrieved')
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/ota/partners/:id - Get specific partner
router.get('/partners/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = mockPartners[id];
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.partnerNotFound')
      });
    }
    
    res.json({
      success: true,
      data: partner,
      message: req.t('common.partnerRetrieved')
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// POST /api/ota/vouchers - Create voucher
router.post('/vouchers', [
  auth,
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('type').isIn(['percentage', 'fixed']).withMessage('Invalid voucher type'),
  body('value').isNumeric().withMessage('Value must be numeric'),
  body('minSpend').isNumeric().withMessage('Minimum spend must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { partnerId, type, value, minSpend, maxDiscount, usageLimit } = req.body;
    
    // Check if partner exists
    if (!mockPartners[partnerId]) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.partnerNotFound')
      });
    }
    
    // Generate unique voucher code
    const voucherCode = `${partnerId.toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const newVoucher = {
      id: `voucher-${Date.now()}`,
      partnerId,
      code: voucherCode,
      type,
      value: parseFloat(value),
      currency: 'USD',
      minSpend: parseFloat(minSpend),
      maxDiscount: parseFloat(maxDiscount || 0),
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: parseInt(usageLimit || 1000),
      usedCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    mockVouchers.push(newVoucher);
    
    res.status(201).json({
      success: true,
      data: newVoucher,
      message: req.t('common.voucherCreated')
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/ota/vouchers - Get all vouchers
router.get('/vouchers', auth, async (req, res) => {
  try {
    const { partnerId, status } = req.query;
    
    let filteredVouchers = mockVouchers;
    
    if (partnerId) {
      filteredVouchers = filteredVouchers.filter(v => v.partnerId === partnerId);
    }
    
    if (status) {
      filteredVouchers = filteredVouchers.filter(v => v.status === status);
    }
    
    res.json({
      success: true,
      data: filteredVouchers,
      message: req.t('common.vouchersRetrieved')
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/ota/vouchers/:id - Get specific voucher
router.get('/vouchers/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = mockVouchers.find(v => v.id === id);
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.voucherNotFound')
      });
    }
    
    res.json({
      success: true,
      data: voucher,
      message: req.t('common.voucherRetrieved')
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// POST /api/ota/addons - Create add-on
router.post('/addons', [
  auth,
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be numeric'),
  body('pointsCost').isNumeric().withMessage('Points cost must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { partnerId, name, description, price, pointsCost, features, duration, durationDays } = req.body;
    
    // Check if partner exists
    if (!mockPartners[partnerId]) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.partnerNotFound')
      });
    }
    
    const newAddOn = {
      id: `addon-${Date.now()}`,
      partnerId,
      name,
      description,
      price: parseFloat(price),
      currency: 'USD',
      pointsCost: parseInt(pointsCost),
      features: features || [],
      duration: duration || 'permanent',
      durationDays: durationDays || null,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    mockAddOns.push(newAddOn);
    
    res.status(201).json({
      success: true,
      data: newAddOn,
      message: req.t('common.addOnCreated')
    });
  } catch (error) {
    console.error('Error creating add-on:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/ota/addons - Get all add-ons
router.get('/addons', auth, async (req, res) => {
  try {
    const { partnerId, status } = req.query;
    
    let filteredAddOns = mockAddOns;
    
    if (partnerId) {
      filteredAddOns = filteredAddOns.filter(a => a.partnerId === partnerId);
    }
    
    if (status) {
      filteredAddOns = filteredAddOns.filter(a => a.status === status);
    }
    
    res.json({
      success: true,
      data: filteredAddOns,
      message: req.t('common.addOnsRetrieved')
    });
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/ota/addons/:id - Get specific add-on
router.get('/addons/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const addOn = mockAddOns.find(a => a.id === id);
    
    if (!addOn) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.addOnNotFound')
      });
    }
    
    res.json({
      success: true,
      data: addOn,
      message: req.t('common.addOnRetrieved')
    });
  } catch (error) {
    console.error('Error fetching add-on:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// POST /api/ota/purchase-addon - Purchase add-on
router.post('/purchase-addon', [
  auth,
  body('addOnId').notEmpty().withMessage('Add-on ID is required'),
  body('paymentMethod').isIn(['points', 'stripe']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { addOnId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    const addOn = mockAddOns.find(a => a.id === addOnId);
    if (!addOn) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.addOnNotFound')
      });
    }
    
    if (addOn.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: req.t('errors.addOnNotAvailable')
      });
    }
    
    // Mock purchase process
    const purchase = {
      id: `purchase-${Date.now()}`,
      userId,
      addOnId,
      partnerId: addOn.partnerId,
      paymentMethod,
      amount: addOn.price,
      currency: addOn.currency,
      pointsCost: addOn.pointsCost,
      status: 'completed',
      purchasedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: purchase,
      message: req.t('common.addOnPurchased')
    });
  } catch (error) {
    console.error('Error purchasing add-on:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

module.exports = router;