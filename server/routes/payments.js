const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
const { body, validationResult } = require('express-validator');

// POST /api/payments/create-payment-intent - Create Stripe payment intent
router.post('/create-payment-intent', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be numeric'),
  body('currency').isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret
      },
      message: req.t('common.paymentIntentCreated')
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.paymentFailed')
    });
  }
});

// POST /api/payments/confirm - Confirm payment
router.post('/confirm', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.metadata.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: req.t('errors.unauthorized')
      });
    }

    res.json({
      success: true,
      data: paymentIntent,
      message: req.t('common.paymentConfirmed')
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: req.t('errors.paymentFailed')
    });
  }
});

module.exports = router;