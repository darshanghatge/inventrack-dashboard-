import db from './db.js';

const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Apparel'];
const catIds = {};
for (const name of categories) {
  const info = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run(name);
  catIds[name] = info.lastInsertRowid || db.prepare('SELECT id FROM categories WHERE name = ?').get(name).id;
}

const supplierInfo = db.prepare('INSERT INTO suppliers (name, contact_email, phone) VALUES (?, ?, ?)')
  .run('Acme Wholesale', 'sales@acme.example', '555-0100');
const supplierId = supplierInfo.lastInsertRowid;

const products = [
  { sku: 'ELEC-001', name: 'Wireless Mouse', cat: 'Electronics', cost: 8, price: 19.99, qty: 120, reorder: 20 },
  { sku: 'ELEC-002', name: 'USB-C Hub', cat: 'Electronics', cost: 15, price: 34.99, qty: 8, reorder: 15 },
  { sku: 'OFF-001', name: 'Notebook Pack (3)', cat: 'Office Supplies', cost: 3, price: 8.5, qty: 200, reorder: 30 },
  { sku: 'OFF-002', name: 'Ballpoint Pens (12)', cat: 'Office Supplies', cost: 2, price: 5.99, qty: 15, reorder: 25 },
  { sku: 'FURN-001', name: 'Ergonomic Chair', cat: 'Furniture', cost: 80, price: 189.99, qty: 25, reorder: 5 },
  { sku: 'APP-001', name: 'Cotton T-Shirt', cat: 'Apparel', cost: 4, price: 14.99, qty: 5, reorder: 20 },
];

const insertProduct = db.prepare(`
  INSERT INTO products (sku, name, category_id, supplier_id, cost_price, sale_price, quantity, reorder_level)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const productIds = [];
for (const p of products) {
  const info = insertProduct.run(p.sku, p.name, catIds[p.cat], supplierId, p.cost, p.price, p.qty, p.reorder);
  productIds.push(info.lastInsertRowid);
}

// backdated sample sales over the last 14 days
const insertSale = db.prepare(`
  INSERT INTO sales (product_id, quantity, sale_price, sold_at) VALUES (?, ?, ?, datetime('now', ?))
`);
for (let day = 13; day >= 0; day--) {
  const salesToday = 1 + Math.floor(Math.random() * 4);
  for (let i = 0; i < salesToday; i++) {
    const idx = Math.floor(Math.random() * products.length);
    const qty = 1 + Math.floor(Math.random() * 5);
    insertSale.run(productIds[idx], qty, products[idx].price, `-${day} days`);
  }
}

console.log('Seed data inserted: categories, suppliers, products, and 14 days of sample sales.');
