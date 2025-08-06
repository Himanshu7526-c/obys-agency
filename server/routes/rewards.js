const express = require('express');
const { auth } = require('../middleware/auth');
const Reward = require('../models/Reward');
const Activity = require('../models/Activity');
const router = express.Router();

// Get user's rewards
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (type) query.type = type;

    const rewards = await Reward.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sourceId');

    const total = await Reward.countDocuments(query);

    res.json({
      success: true,
      data: rewards,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Get reward by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const reward = await Reward.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('sourceId');

    if (!reward) {
      return res.status(404).json({ error: req.t('errors.rewardNotFound') });
    }

    res.json({
      success: true,
      data: reward,
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Redeem reward
router.post('/:id/redeem', auth, async (req, res) => {
  try {
    const reward = await Reward.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reward) {
      return res.status(404).json({ error: req.t('errors.rewardNotFound') });
    }

    if (reward.status !== 'active') {
      return res.status(400).json({ error: req.t('errors.rewardNotActive') });
    }

    if (reward.expiresAt && reward.expiresAt < new Date()) {
      return res.status(400).json({ error: req.t('errors.rewardExpired') });
    }

    // Update reward status
    reward.status = 'redeemed';
    reward.redeemedAt = new Date();
    await reward.save();

    // Update user points if it's a points reward
    if (reward.type === 'points') {
      req.user.points += reward.pointsValue;
      req.user.totalPointsEarned += reward.pointsValue;
      await req.user.save();
    }

    res.json({
      success: true,
      data: reward,
      message: req.t('common.rewardRedeemed'),
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Get user's activities
router.get('/activities/list', auth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (type) query.type = type;

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Complete activity
router.post('/activities/:id/complete', auth, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!activity) {
      return res.status(404).json({ error: req.t('errors.activityNotFound') });
    }

    if (activity.status !== 'available') {
      return res.status(400).json({ error: req.t('errors.activityNotAvailable') });
    }

    // Update activity status
    activity.status = 'completed';
    activity.completedAt = new Date();
    await activity.save();

    // Create reward for completed activity
    const reward = new Reward({
      user: req.user._id,
      type: 'points',
      title: `Points for ${activity.title}`,
      description: `Earned ${activity.pointsReward} points for completing "${activity.title}"`,
      pointsValue: activity.pointsReward,
      status: 'active',
      source: 'activity',
      sourceId: activity._id,
      sourceModel: 'Activity',
    });

    await reward.save();

    // Update user points
    req.user.points += activity.pointsReward;
    req.user.totalPointsEarned += activity.pointsReward;
    await req.user.save();

    res.json({
      success: true,
      data: {
        activity,
        reward,
        pointsEarned: activity.pointsReward,
      },
      message: req.t('common.activityCompleted'),
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

module.exports = router;