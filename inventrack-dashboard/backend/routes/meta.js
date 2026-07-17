import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});

router.post('/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.status(201).json({ id: info.lastInsertRowid, name });
  } catch {
    res.status(409).json({ error: 'Category already exists' });
  }
});

router.get('/suppliers', (req, res) => {
  res.json(db.prepare('SELECT * FROM suppliers ORDER BY name').all());
});

router.post('/suppliers', (req, res) => {
  const { name, contactEmail, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare('INSERT INTO suppliers (name, contact_email, phone) VALUES (?, ?, ?)')
    .run(name, contactEmail || null, phone || null);
  res.status(201).json({ id: info.lastInsertRowid, name, contact_email: contactEmail, phone });
});

export default router;
