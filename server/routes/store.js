const express = require('express');
const { auth } = require('../middleware/auth');
const { StoreItem, Purchase } = require('../models/Store');
const router = express.Router();

// Get all store items
router.get('/items', auth, async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;

    const items = await StoreItem.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StoreItem.countDocuments(query);

    res.json({
      success: true,
      data: items,
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

// Get store item by ID
router.get('/items/:id', auth, async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);

    if (!item || !item.isActive) {
      return res.status(404).json({ error: req.t('errors.itemNotFound') });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Purchase item with points
router.post('/purchase', auth, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    const item = await StoreItem.findById(itemId);
    if (!item || !item.isActive) {
      return res.status(404).json({ error: req.t('errors.itemNotFound') });
    }

    // Check stock
    if (item.stock !== -1 && item.stock < quantity) {
      return res.status(400).json({ error: req.t('errors.insufficientStock') });
    }

    const totalPoints = item.price.points * quantity;
    const totalCurrency = item.price.currency * quantity;

    // Check if user has enough points
    if (req.user.points < totalPoints) {
      return res.status(400).json({ error: req.t('errors.insufficientPoints') });
    }

    // Create purchase record
    const purchase = new Purchase({
      user: req.user._id,
      item: item._id,
      quantity,
      totalPoints,
      totalCurrency,
      status: 'completed',
      paymentMethod: totalCurrency > 0 ? 'mixed' : 'points',
    });

    await purchase.save();

    // Update user points
    req.user.points -= totalPoints;
    req.user.totalPointsRedeemed += totalPoints;
    await req.user.save();

    // Update item stock
    if (item.stock !== -1) {
      item.stock -= quantity;
      await item.save();
    }

    res.json({
      success: true,
      data: purchase,
      message: req.t('common.purchaseSuccessful'),
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

// Get user's purchase history
router.get('/purchases', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;

    const purchases = await Purchase.find(query)
      .populate('item')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Purchase.countDocuments(query);

    res.json({
      success: true,
      data: purchases,
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

// Get purchase by ID
router.get('/purchases/:id', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('item');

    if (!purchase) {
      return res.status(404).json({ error: req.t('errors.purchaseNotFound') });
    }

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

module.exports = router;