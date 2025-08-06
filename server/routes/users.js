const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, preferences } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await req.user.constructor.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user.toPublicJSON(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: req.t('errors.validationError') });
    }
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

module.exports = router;