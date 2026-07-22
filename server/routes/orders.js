const express = require('express');
const store = require('../database');
const auth = require('../middleware');

const router = express.Router();

// Public: create order
router.post('/', (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, items, total } = req.body;
  if (!customer_name || !customer_email || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const order = store.createOrder({
    customer_name, customer_email, customer_phone: customer_phone || '',
    customer_address: customer_address || '', items, total: parseFloat(total)
  });
  res.status(201).json(order);
});

// Admin: get all orders
router.get('/', auth, (req, res) => {
  const orders = store.getOrders(req.query.status);
  res.json(orders);
});

// Admin: update order status
router.put('/:id', auth, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });
  const order = store.updateOrder(parseInt(req.params.id), { status });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

module.exports = router;
