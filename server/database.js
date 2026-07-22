const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data.json');

function loadDB() {
  if (fs.existsSync(DB_PATH)) {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  }
  return { users: [], products: [], orders: [], nextId: { products: 1, orders: 1 } };
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize DB
let db = loadDB();

// Create default admin if no users
if (db.users.length === 0) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shop.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  db.users.push({
    id: 1,
    email: adminEmail,
    password: bcrypt.hashSync(adminPass, 10),
    role: 'admin',
    created_at: new Date().toISOString()
  });
  db.nextId = db.nextId || { products: 1, orders: 1 };
  saveDB(db);
  console.log(`Admin created: ${adminEmail}`);
}

const store = {
  // Users
  getUserByEmail(email) {
    return db.users.find(u => u.email === email);
  },
  getUserById(id) {
    return db.users.find(u => u.id === id);
  },

  // Products
  getProducts(filters = {}) {
    let products = db.products.filter(p => p.active === 1);
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s))
      );
    }
    return products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getAllProducts() {
    return db.products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getProductById(id) {
    return db.products.find(p => p.id === id);
  },
  createProduct(data) {
    const id = (db.nextId.products = (db.nextId.products || 0) + 1);
    const product = { id, ...data, active: 1, created_at: new Date().toISOString() };
    db.products.push(product);
    saveDB(db);
    return product;
  },
  updateProduct(id, data) {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...data };
    saveDB(db);
    return db.products[idx];
  },
  deleteProduct(id) {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    db.products[idx].active = 0;
    saveDB(db);
    return true;
  },

  // Orders
  createOrder(data) {
    const id = (db.nextId.orders = (db.nextId.orders || 0) + 1);
    const order = { id, ...data, status: 'pending', created_at: new Date().toISOString() };
    db.orders.push(order);
    saveDB(db);
    return order;
  },
  getOrders(status) {
    let orders = [...db.orders];
    if (status) orders = orders.filter(o => o.status === status);
    return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getOrderById(id) {
    return db.orders.find(o => o.id === id);
  },
  updateOrder(id, data) {
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    db.orders[idx] = { ...db.orders[idx], ...data };
    saveDB(db);
    return db.orders[idx];
  }
};

module.exports = store;
