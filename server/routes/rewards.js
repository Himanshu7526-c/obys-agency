const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Reward = require('../models/Reward');
const User = require('../models/User');

// GET /api/rewards - Get all available rewards
router.get('/', auth, async (req, res) => {
  try {
    const { category, isFeatured, limit = 20, page = 1 } = req.query;
    const user = await User.findById(req.user.id);
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const rewards = await Reward.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Filter rewards based on user eligibility
    const eligibleRewards = rewards.filter(reward => reward.isUserEligible(user));
    
    const total = await Reward.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        rewards: eligibleRewards,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      },
      message: req.t('common.rewardsRetrieved')
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/rewards/:id - Get specific reward
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    
    const reward = await Reward.findById(id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.rewardNotFound')
      });
    }
    
    if (!reward.isActive) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.rewardNotAvailable')
      });
    }
    
    const isEligible = reward.isUserEligible(user);
    
    res.json({
      success: true,
      data: {
        reward,
        isEligible,
        userPoints: user.points
      },
      message: req.t('common.rewardRetrieved')
    });
  } catch (error) {
    console.error('Error fetching reward:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// POST /api/rewards/:id/redeem - Redeem reward
router.post('/:id/redeem', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    const reward = await Reward.findById(id);
    
    if (!reward) {
      return res.status(404).json({
        success: false,
        error: req.t('errors.rewardNotFound')
      });
    }
    
    if (!reward.isUserEligible(user)) {
      return res.status(400).json({
        success: false,
        error: req.t('errors.rewardNotEligible')
      });
    }
    
    // Check if user has enough points
    if (user.points < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        error: req.t('errors.insufficientPoints')
      });
    }
    
    // Redeem the reward
    await reward.redeem();
    
    // Deduct points from user
    await user.spendPoints(reward.pointsCost);
    
    // Add reward to user's rewards
    await user.addReward(reward._id);
    
    res.json({
      success: true,
      data: {
        reward,
        remainingPoints: user.points,
        redemptionCode: `REDEEM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      },
      message: req.t('common.rewardRedeemed')
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/rewards/categories - Get reward categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Reward.distinct('category');
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await Reward.countDocuments({ 
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

// GET /api/rewards/featured - Get featured rewards
router.get('/featured', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const featuredRewards = await Reward.find({ 
      isFeatured: true, 
      isActive: true 
    }).limit(6);
    
    const eligibleRewards = featuredRewards.filter(reward => reward.isUserEligible(user));
    
    res.json({
      success: true,
      data: eligibleRewards,
      message: req.t('common.featuredRewardsRetrieved')
    });
  } catch (error) {
    console.error('Error fetching featured rewards:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

module.exports = router;