const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51H1234567890abcdefghijklmnopqrstuvwxyz');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user._id.toString(),
        ...metadata,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: req.t('errors.paymentError') });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        data: {
          status: 'succeeded',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        },
      });
    } else {
      res.status(400).json({ error: req.t('errors.paymentFailed') });
    }
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: req.t('errors.paymentError') });
  }
});

// Get payment methods
router.get('/payment-methods', auth, async (req, res) => {
  try {
    // In a real implementation, you would store customer IDs
    // For now, we'll return an empty array
    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    res.status(500).json({ error: req.t('errors.internalServerError') });
  }
});

module.exports = router;