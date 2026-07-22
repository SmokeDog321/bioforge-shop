const express = require('express');
const store = require('../database');
const auth = require('../middleware');

const router = express.Router();

// Public: get active products
router.get('/', (req, res) => {
  const products = store.getProducts(req.query);
  res.json(products);
});

// Public: get single product
router.get('/:id', (req, res) => {
  const product = store.getProductById(parseInt(req.params.id));
  if (!product || product.active !== 1) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Admin: create product
router.post('/', auth, (req, res) => {
  const { name, description, price, image, category, stock, model_3d } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });

  const product = store.createProduct({
    name, description: description || '', price: parseFloat(price),
    image: image || '', category: category || '', stock: parseInt(stock) || 0,
    model_3d: model_3d || ''
  });
  res.status(201).json(product);
});

// Admin: update product
router.put('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const existing = store.getProductById(id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name, description, price, image, category, stock, active, model_3d } = req.body;
  const product = store.updateProduct(id, {
    name: name ?? existing.name,
    description: description ?? existing.description,
    price: price !== undefined ? parseFloat(price) : existing.price,
    image: image ?? existing.image,
    category: category ?? existing.category,
    stock: stock !== undefined ? parseInt(stock) : existing.stock,
    active: active !== undefined ? (active ? 1 : 0) : existing.active,
    model_3d: model_3d !== undefined ? model_3d : (existing.model_3d || '')
  });
  res.json(product);
});

// Admin: delete product (soft)
router.delete('/:id', auth, (req, res) => {
  const ok = store.deleteProduct(parseInt(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

// Admin: get all products including inactive
router.get('/admin/all', auth, (req, res) => {
  const products = store.getAllProducts();
  res.json(products);
});

module.exports = router;
