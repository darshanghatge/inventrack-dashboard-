import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

const productQuery = `
  SELECT products.*, categories.name as category_name, suppliers.name as supplier_name
  FROM products
  LEFT JOIN categories ON products.category_id = categories.id
  LEFT JOIN suppliers ON products.supplier_id = suppliers.id
`;

router.get('/', (req, res) => {
  const { search, categoryId, lowStock } = req.query;
  let query = productQuery + ' WHERE 1=1';
  const params = [];
  if (search) {
    query += ' AND (products.name LIKE ? OR products.sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categoryId) {
    query += ' AND products.category_id = ?';
    params.push(categoryId);
  }
  if (lowStock === 'true') {
    query += ' AND products.quantity <= products.reorder_level';
  }
  query += ' ORDER BY products.name';
  res.json(db.prepare(query).all(...params));
});

router.get('/:id', (req, res) => {
  const product = db.prepare(productQuery + ' WHERE products.id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', (req, res) => {
  const { sku, name, categoryId, supplierId, costPrice, salePrice, quantity, reorderLevel } = req.body;
  if (!sku || !name) return res.status(400).json({ error: 'sku and name are required' });
  try {
    const info = db.prepare(`
      INSERT INTO products (sku, name, category_id, supplier_id, cost_price, sale_price, quantity, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sku, name, categoryId || null, supplierId || null, costPrice || 0, salePrice || 0, quantity || 0, reorderLevel ?? 10);
    if (quantity) {
      db.prepare('INSERT INTO stock_movements (product_id, change, reason) VALUES (?, ?, ?)')
        .run(info.lastInsertRowid, quantity, 'Initial stock');
    }
    res.status(201).json(db.prepare(productQuery + ' WHERE products.id = ?').get(info.lastInsertRowid));
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'SKU already exists' });
    res.status(500).json({ error: 'Could not create product' });
  }
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  const { name, categoryId, supplierId, costPrice, salePrice, reorderLevel } = req.body;
  db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name),
      category_id = COALESCE(?, category_id),
      supplier_id = COALESCE(?, supplier_id),
      cost_price = COALESCE(?, cost_price),
      sale_price = COALESCE(?, sale_price),
      reorder_level = COALESCE(?, reorder_level)
    WHERE id = ?
  `).run(name ?? null, categoryId ?? null, supplierId ?? null, costPrice ?? null, salePrice ?? null, reorderLevel ?? null, req.params.id);
  res.json(db.prepare(productQuery + ' WHERE products.id = ?').get(req.params.id));
});

// adjust stock (restock or manual correction)
router.post('/:id/adjust-stock', (req, res) => {
  const { change, reason } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const newQty = product.quantity + Number(change);
  if (newQty < 0) return res.status(400).json({ error: 'Resulting quantity cannot be negative' });
  db.prepare('UPDATE products SET quantity = ? WHERE id = ?').run(newQty, req.params.id);
  db.prepare('INSERT INTO stock_movements (product_id, change, reason) VALUES (?, ?, ?)')
    .run(req.params.id, change, reason || 'Manual adjustment');
  res.json(db.prepare(productQuery + ' WHERE products.id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
