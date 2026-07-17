import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT sales.*, products.name as product_name, products.sku, users.name as sold_by_name
    FROM sales
    JOIN products ON sales.product_id = products.id
    LEFT JOIN users ON sales.sold_by = users.id
    ORDER BY sales.sold_at DESC
    LIMIT 200
  `).all();
  res.json(rows);
});

// Record a sale — this is a transaction: insert sale row + decrement stock atomically
router.post('/', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'productId and a positive quantity are required' });
  }
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.quantity < quantity) return res.status(400).json({ error: 'Not enough stock available' });

  const recordSale = db.transaction(() => {
    const info = db.prepare(`
      INSERT INTO sales (product_id, quantity, sale_price, sold_by)
      VALUES (?, ?, ?, ?)
    `).run(productId, quantity, product.sale_price, req.user.id);
    db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?').run(quantity, productId);
    db.prepare('INSERT INTO stock_movements (product_id, change, reason) VALUES (?, ?, ?)')
      .run(productId, -quantity, `Sale #${info.lastInsertRowid}`);
    return info.lastInsertRowid;
  });

  const saleId = recordSale();
  const sale = db.prepare(`
    SELECT sales.*, products.name as product_name FROM sales
    JOIN products ON sales.product_id = products.id
    WHERE sales.id = ?
  `).get(saleId);
  res.status(201).json(sale);
});

export default router;
