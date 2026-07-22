const bcrypt = require('bcryptjs');

// In-memory database for Vercel serverless
let db = {
  users: [],
  products: [],
  orders: [],
  nextId: { products: 0, orders: 0 }
};

// Seed admin
const adminEmail = process.env.ADMIN_EMAIL || 'admin@shop.com';
const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
if (db.users.length === 0) {
  db.users.push({
    id: 1, email: adminEmail,
    password: bcrypt.hashSync(adminPass, 10),
    role: 'admin', created_at: new Date().toISOString()
  });
  db.nextId.products = 0;
  db.nextId.orders = 0;
}

const store = {
  getUserByEmail(email) { return db.users.find(u => u.email === email); },
  getUserById(id) { return db.users.find(u => u.id === id); },

  getProducts(filters = {}) {
    let products = db.products.filter(p => p.active === 1);
    if (filters.category) products = products.filter(p => p.category === filters.category);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
    }
    return products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getAllProducts() { return db.products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); },
  getProductById(id) { return db.products.find(p => p.id === id); },
  createProduct(data) {
    const id = ++db.nextId.products;
    const product = { id, ...data, active: 1, created_at: new Date().toISOString() };
    db.products.push(product);
    return product;
  },
  updateProduct(id, data) {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...data };
    return db.products[idx];
  },
  deleteProduct(id) {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    db.products[idx].active = 0;
    return true;
  },

  createOrder(data) {
    const id = ++db.nextId.orders;
    const order = { id, ...data, status: 'pending', created_at: new Date().toISOString() };
    db.orders.push(order);
    return order;
  },
  getOrders(status) {
    let orders = [...db.orders];
    if (status) orders = orders.filter(o => o.status === status);
    return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getOrderById(id) { return db.orders.find(o => o.id === id); },
  updateOrder(id, data) {
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    db.orders[idx] = { ...db.orders[idx], ...data };
    return db.orders[idx];
  }
};

module.exports = store;
