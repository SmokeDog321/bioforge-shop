const express = require('express');
const store = require('../database');

const router = express.Router();

router.post('/create-session', async (req, res) => {
  const { items, orderId } = req.body;

  // If Stripe is configured
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('YOUR_')) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({
          price_data: {
            currency: 'rub',
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${req.headers.origin || 'http://localhost:5173'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'http://localhost:5173'}/cart`,
        metadata: { orderId: orderId || '' },
      });

      if (orderId) {
        store.updateOrder(parseInt(orderId), { payment_id: session.id });
      }

      return res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Demo mode
  res.json({ demo: true, message: 'Stripe not configured. Order created without online payment.' });
});

module.exports = router;
