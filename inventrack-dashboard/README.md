# InvenTrack — Inventory & Sales Analytics Dashboard

A full-stack inventory management system with a live analytics dashboard:
track products and stock levels, record sales, and visualize revenue,
profit, and top sellers.

## Stack
- **Frontend:** React 18 (Vite), React Router, Recharts (charts), Axios
- **Backend:** Node.js, Express (REST API)
- **Database:** SQLite via `better-sqlite3`
- **Auth:** JWT + bcrypt password hashing

## Features
- JWT-authenticated manager accounts
- Product catalog with SKU, category, supplier, cost/sale price, stock levels
- Stock adjustments (restock, correction) with a full movement history table
- Sale recording that atomically decrements stock (uses a DB transaction)
- Analytics dashboard: 30-day revenue & profit, 14-day revenue trend line
  chart, top 5 products bar chart, revenue-by-category pie chart
- Automatic low-stock alerts based on a per-product reorder threshold
- Search & filter product list

## Project Structure
```
inventrack-dashboard/
├── backend/
│   ├── server.js         # Express app
│   ├── db.js              # SQLite schema & connection
│   ├── seed.js             # Sample data generator (categories, products, 14 days of sales)
│   ├── middleware/auth.js  # JWT verification middleware
│   └── routes/              # auth, products, meta (categories/suppliers), sales, dashboard
└── frontend/
    └── src/
        ├── pages/            # Login, Register, Dashboard, Products, Sales
        ├── components/       # Layout, StatCard
        └── context/          # AuthContext
```

## Getting Started

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env       # edit JWT_SECRET
npm run seed                # optional: populate sample products & sales
npm run dev                  # starts on http://localhost:5001
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                  # starts on http://localhost:5174
```

Register an account, then visit the Dashboard — if you ran the seed script
you'll immediately see populated charts and a couple of low-stock alerts.

## Database Schema
`users`, `categories`, `suppliers`, `products`, `sales`, `stock_movements` —
sales are recorded through a SQL transaction that inserts the sale row,
decrements product quantity, and logs a stock movement together, so the
data can never end up inconsistent.

## Possible Extensions
- Purchase orders / reorder workflow with suppliers
- CSV export of sales reports
- Multi-warehouse / multi-location stock tracking
- Role-based permissions (admin vs. staff)
