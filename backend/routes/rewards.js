const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reward = require('../models/Reward');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/rewards - Get available rewards
router.get('/', auth, async (req, res) => {
  try {
    const { category, minPoints, maxPoints, featured } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (minPoints || maxPoints) {
      query.pointsCost = {};
      if (minPoints) query.pointsCost.$gte = parseInt(minPoints);
      if (maxPoints) query.pointsCost.$lte = parseInt(maxPoints);
    }

    const rewards = await Reward.find(query)
      .sort({ featured: -1, pointsCost: 1 })
      .limit(50);

    res.json({
      success: true,
      data: rewards,
      count: rewards.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards',
      error: error.message
    });
  }
});

// POST /api/rewards/:id/redeem - Redeem a reward
router.post('/:id/redeem', auth, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward || !reward.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found or inactive'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!reward.canRedeem(user.points)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot redeem reward',
        reason: user.points < reward.pointsCost ? 'Insufficient points' : 'Reward unavailable'
      });
    }

    // Deduct points from user
    user.points -= reward.pointsCost;
    
    // Add reward to user's rewards
    const userReward = {
      rewardId: reward._id,
      status: 'pending',
      voucherCode: `ACT-${reward._id.toString().slice(-6).toUpperCase()}-${Date.now()}`,
      expiresAt: new Date(Date.now() + reward.validityPeriod * 24 * 60 * 60 * 1000)
    };
    
    user.rewards.push(userReward);
    user.calculateLevel();
    
    // Update reward redemption count
    await reward.processRedemption();
    await user.save();

    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        reward: userReward,
        userPoints: user.points,
        userLevel: user.level
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to redeem reward',
      error: error.message
    });
  }
});

module.exports = router;