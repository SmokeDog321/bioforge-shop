const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Lazy-load database
let store;
function getStore() {
  if (!store) store = require('./database');
  return store;
}

// Auth
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = getStore().getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

app.get('/api/auth/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'dev-secret');
    const user = getStore().getUserById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
});

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'dev-secret');
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

// Products
app.get('/api/products', (req, res) => {
  res.json(getStore().getProducts(req.query));
});

app.get('/api/products/:id', (req, res) => {
  const p = getStore().getProductById(parseInt(req.params.id));
  if (!p || p.active !== 1) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.post('/api/products', auth, (req, res) => {
  const { name, description, price, image, category, stock, model_3d } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });
  const product = getStore().createProduct({ name, description: description || '', price: parseFloat(price), image: image || '', category: category || '', stock: parseInt(stock) || 0, model_3d: model_3d || '' });
  res.status(201).json(product);
});

app.put('/api/products/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const existing = getStore().getProductById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { name, description, price, image, category, stock, active, model_3d } = req.body;
  const product = getStore().updateProduct(id, {
    name: name ?? existing.name, description: description ?? existing.description,
    price: price !== undefined ? parseFloat(price) : existing.price,
    image: image ?? existing.image, category: category ?? existing.category,
    stock: stock !== undefined ? parseInt(stock) : existing.stock,
    active: active !== undefined ? (active ? 1 : 0) : existing.active,
    model_3d: model_3d !== undefined ? model_3d : (existing.model_3d || '')
  });
  res.json(product);
});

app.delete('/api/products/:id', auth, (req, res) => {
  const ok = getStore().deleteProduct(parseInt(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

app.get('/api/products/admin/all', auth, (req, res) => {
  res.json(getStore().getAllProducts());
});

// Orders
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, items, total } = req.body;
  if (!customer_name || !customer_email || !items || !total) return res.status(400).json({ error: 'Missing fields' });
  const order = getStore().createOrder({ customer_name, customer_email, customer_phone: customer_phone || '', customer_address: customer_address || '', items, total: parseFloat(total) });
  res.status(201).json(order);
});

app.get('/api/orders', auth, (req, res) => {
  res.json(getStore().getOrders(req.query.status));
});

app.put('/api/orders/:id', auth, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });
  const order = getStore().updateOrder(parseInt(req.params.id), { status });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

// Payment
app.post('/api/payment/create-session', async (req, res) => {
  const { items, orderId } = req.body;
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('YOUR_')) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({ price_data: { currency: 'rub', product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) }, quantity: item.quantity })),
        mode: 'payment',
        success_url: `${req.headers.origin || 'https://bioforge.vercel.app'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'https://bioforge.vercel.app'}/cart`,
        metadata: { orderId: orderId || '' },
      });
      if (orderId) getStore().updateOrder(parseInt(orderId), { payment_id: session.id });
      return res.json({ sessionId: session.id, url: session.url });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }
  res.json({ demo: true, message: 'Stripe not configured' });
});

// Upload (limited on Vercel — no filesystem writes in production)
app.post('/api/upload', auth, (req, res) => {
  res.status(501).json({ error: 'File upload not available on Vercel. Use external storage (S3, Cloudinary) or upload images as URLs.' });
});

module.exports = app;
