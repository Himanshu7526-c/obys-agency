const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// GET /api/users/profile - Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('rewards.rewardId')
      .populate('addOns.addOnId')
      .select('-password');

    res.json({
      success: true,
      data: user,
      message: req.t('common.profileRetrieved')
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('username').optional().trim().isLength({ min: 3, max: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, username, profilePicture } = req.body;
    const user = await User.findById(req.user.id);

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: req.t('errors.usernameAlreadyExists')
        });
      }
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username) user.username = username;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      data: user,
      message: req.t('common.profileUpdated')
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', [
  auth,
  body('language').optional().isIn(['en', 'es', 'fr']),
  body('notifications.email').optional().isBoolean(),
  body('notifications.push').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { language, notifications } = req.body;
    const user = await User.findById(req.user.id);

    if (language) user.preferences.language = language;
    if (notifications) {
      if (notifications.email !== undefined) user.preferences.notifications.email = notifications.email;
      if (notifications.push !== undefined) user.preferences.notifications.push = notifications.push;
    }

    await user.save();

    res.json({
      success: true,
      data: user.preferences,
      message: req.t('common.preferencesUpdated')
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

// GET /api/users/rewards - Get user rewards
router.get('/rewards', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('rewards.rewardId')
      .select('rewards');

    res.json({
      success: true,
      data: user.rewards,
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

// GET /api/users/addons - Get user add-ons
router.get('/addons', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('addOns.addOnId')
      .select('addOns');

    res.json({
      success: true,
      data: user.addOns,
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

// GET /api/users/points - Get user points summary
router.get('/points', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('points totalPointsEarned totalPointsSpent');

    res.json({
      success: true,
      data: {
        currentPoints: user.points,
        totalEarned: user.totalPointsEarned,
        totalSpent: user.totalPointsSpent,
        availablePoints: user.points
      },
      message: req.t('common.pointsRetrieved')
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
});

module.exports = router;