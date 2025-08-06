const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const AddOn = require('../models/AddOn');
const User = require('../models/User');

// GET /api/store/addons - Get all available add-ons
router.get('/addons', auth, async (req, res) => {
  try {
    const { category, type, isFeatured, isPopular, limit = 20, page = 1 } = req.query;
    const user = await User.findById(req.user.id);
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    
    if (isPopular === 'true') {
      query.isPopular = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const addOns = await AddOn.find(query)
      .sort({ isFeatured: -1, isPopular: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Filter add-ons based on user eligibility
    const eligibleAddOns = addOns.filter(addOn => addOn.isUserEligible(user));
    
    const total = await AddOn.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        addOns: eligibleAddOns,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      },
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

// GET /api/store/addons/:id - Get specific add-on
router.get('/addons/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    
    const addOn = await AddOn.findById(id);
    if (!addOn) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.addOnNotFound')
      });
    }
    
    if (!addOn.isActive) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.addOnNotAvailable')
      });
    }
    
    const isEligible = addOn.isUserEligible(user);
    
    res.json({
      success: true,
      data: {
        addOn,
        isEligible,
        userPoints: user.points
      },
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

// POST /api/store/addons/:id/purchase - Purchase add-on
router.post('/addons/:id/purchase', [
  auth,
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

    const { id } = req.params;
    const { paymentMethod } = req.body;
    const user = await User.findById(req.user.id);
    const addOn = await AddOn.findById(id);
    
    if (!addOn) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.addOnNotFound')
      });
    }
    
    if (!addOn.isUserEligible(user)) {
      return res.status(400).json({
        success: false,
        error: req.t('errors.addOnNotEligible')
      });
    }
    
    if (paymentMethod === 'points') {
      // Check if user has enough points
      if (user.points < addOn.price.pointsCost) {
        return res.status(400).json({
          success: false,
          error: req.t('errors.insufficientPoints')
        });
      }
      
      // Deduct points from user
      await user.spendPoints(addOn.price.pointsCost);
    }
    
    // Purchase the add-on
    await addOn.purchase();
    
    // Add add-on to user's add-ons
    await user.addAddOn(addOn._id);
    
    res.json({
      success: true,
      data: {
        addOn,
        remainingPoints: user.points,
        purchaseCode: `PURCHASE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      },
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

// GET /api/store/categories - Get add-on categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await AddOn.distinct('category');
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await AddOn.countDocuments({ 
          category, 
          isActive: true 
        });
        return { category, count };
      })
    );
    
    res.json({
      success: true,
      data: categoryStats,
      message: req.t('common.categoriesRetrieved')
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/store/featured - Get featured add-ons
router.get('/featured', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const featuredAddOns = await AddOn.find({ 
      isFeatured: true, 
      isActive: true 
    }).limit(6);
    
    const eligibleAddOns = featuredAddOns.filter(addOn => addOn.isUserEligible(user));
    
    res.json({
      success: true,
      data: eligibleAddOns,
      message: req.t('common.featuredAddOnsRetrieved')
    });
  } catch (error) {
    console.error('Error fetching featured add-ons:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/store/popular - Get popular add-ons
router.get('/popular', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const popularAddOns = await AddOn.find({ 
      isPopular: true, 
      isActive: true 
    }).limit(6);
    
    const eligibleAddOns = popularAddOns.filter(addOn => addOn.isUserEligible(user));
    
    res.json({
      success: true,
      data: eligibleAddOns,
      message: req.t('common.popularAddOnsRetrieved')
    });
  } catch (error) {
    console.error('Error fetching popular add-ons:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

module.exports = router;