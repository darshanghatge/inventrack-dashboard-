import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import metaRoutes from './routes/meta.js';
import salesRoutes from './routes/sales.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`InvenTrack API running on port ${PORT}`);
});
