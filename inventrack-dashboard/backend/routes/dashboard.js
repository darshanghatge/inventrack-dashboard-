import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/summary', (req, res) => {
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const totalStockValue = db.prepare('SELECT COALESCE(SUM(quantity * cost_price), 0) as v FROM products').get().v;
  const lowStockCount = db.prepare('SELECT COUNT(*) as c FROM products WHERE quantity <= reorder_level').get().c;

  const revenueRow = db.prepare(`
    SELECT COALESCE(SUM(quantity * sale_price), 0) as revenue, COALESCE(SUM(quantity), 0) as units
    FROM sales WHERE sold_at >= datetime('now', '-30 days')
  `).get();

  const profitRow = db.prepare(`
    SELECT COALESCE(SUM((sales.sale_price - products.cost_price) * sales.quantity), 0) as profit
    FROM sales JOIN products ON sales.product_id = products.id
    WHERE sold_at >= datetime('now', '-30 days')
  `).get();

  res.json({
    totalProducts,
    totalStockValue: Math.round(totalStockValue * 100) / 100,
    lowStockCount,
    revenueLast30Days: Math.round(revenueRow.revenue * 100) / 100,
    unitsSoldLast30Days: revenueRow.units,
    profitLast30Days: Math.round(profitRow.profit * 100) / 100,
  });
});

// daily revenue for the last 14 days, for a line/bar chart
router.get('/sales-trend', (req, res) => {
  const rows = db.prepare(`
    SELECT date(sold_at) as day, SUM(quantity * sale_price) as revenue, SUM(quantity) as units
    FROM sales
    WHERE sold_at >= datetime('now', '-14 days')
    GROUP BY date(sold_at)
    ORDER BY day
  `).all();
  res.json(rows);
});

// top selling products
router.get('/top-products', (req, res) => {
  const rows = db.prepare(`
    SELECT products.name, products.sku, SUM(sales.quantity) as units_sold,
           SUM(sales.quantity * sales.sale_price) as revenue
    FROM sales JOIN products ON sales.product_id = products.id
    GROUP BY sales.product_id
    ORDER BY units_sold DESC
    LIMIT 5
  `).all();
  res.json(rows);
});

// revenue by category, for a pie chart
router.get('/category-breakdown', (req, res) => {
  const rows = db.prepare(`
    SELECT COALESCE(categories.name, 'Uncategorized') as category,
           SUM(sales.quantity * sales.sale_price) as revenue
    FROM sales
    JOIN products ON sales.product_id = products.id
    LEFT JOIN categories ON products.category_id = categories.id
    GROUP BY category
    ORDER BY revenue DESC
  `).all();
  res.json(rows);
});

router.get('/low-stock', (req, res) => {
  const rows = db.prepare(`
    SELECT products.*, categories.name as category_name
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.quantity <= products.reorder_level
    ORDER BY products.quantity ASC
  `).all();
  res.json(rows);
});

export default router;
