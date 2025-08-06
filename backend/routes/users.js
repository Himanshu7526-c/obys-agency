const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// PUT /api/users/profile - Update user profile
router.put('/profile', [
  auth,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('preferences.language').optional().isIn(['en', 'es', 'fr']).withMessage('Invalid language')
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

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// GET /api/users/stats - Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const stats = {
      totalPoints: user.points,
      currentLevel: user.level,
      tasksCompleted: user.completedTasks.length,
      rewardsRedeemed: user.rewards.filter(r => r.status === 'redeemed').length,
      joinedDate: user.createdAt,
      pointsToNextLevel: (user.level * 100) - user.points,
      achievements: []
    };

    // Add achievements based on stats
    if (stats.tasksCompleted >= 10) stats.achievements.push('Task Master');
    if (stats.rewardsRedeemed >= 5) stats.achievements.push('Reward Hunter');
    if (user.level >= 5) stats.achievements.push('Level Up Pro');

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
});

module.exports = router;