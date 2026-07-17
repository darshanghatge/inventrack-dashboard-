📦 InvenTrack — Inventory & Sales Analytics Dashboard
A full-stack inventory management system for small businesses: track
products and stock levels, record sales, and get real-time insight into
revenue, profit, and top sellers through a live analytics dashboard.
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2-8884d8?logo=chart.js&logoColor=white)
---
✨ Features
🔐 Authentication — JWT-based sessions with bcrypt password hashing
📦 Product Catalog — SKU, category, supplier, cost/sale price, and stock tracking
📊 Live Analytics Dashboard — 30-day revenue & profit, 14-day revenue trend chart, top 5 products, revenue-by-category breakdown
🚨 Low-Stock Alerts — Automatic flagging when a product drops below its reorder threshold
🧾 Sales Recording — Atomic transactions that update stock and log the movement together, so data can never end up inconsistent
🔍 Search & Filter — Quickly find products by name or SKU
🌱 Seed Script — Populate the database with realistic sample data (products + 2 weeks of sales) in one command
🛠️ Tech Stack
Layer	Technology
Frontend	React 18 (Vite), React Router, Recharts, Axios
Backend	Node.js, Express (REST API)
Database	SQLite (`better-sqlite3`)
Auth	JSON Web Tokens, bcrypt
📁 Project Structure
```
inventrack-dashboard/
├── backend/
│   ├── server.js             # Express app
│   ├── db.js                  # SQLite schema & connection
│   ├── seed.js                 # Sample data generator
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   └── routes/
│       ├── auth.js               # Register / login
│       ├── products.js           # Product CRUD, stock adjustments
│       ├── meta.js               # Categories & suppliers
│       ├── sales.js              # Sale recording (transactional)
│       └── dashboard.js          # Analytics aggregation endpoints
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx / Register.jsx
        │   ├── Dashboard.jsx       # Charts & stat cards
        │   ├── Products.jsx        # Product table + CRUD form
        │   └── Sales.jsx           # Record & view sales
        ├── components/
        │   ├── Layout.jsx          # Sidebar navigation
        │   └── StatCard.jsx
        └── context/
            └── AuthContext.jsx     # Auth state provider
```
🚀 Getting Started
Prerequisites
Node.js 18+
npm
1. Clone & install
```bash
git clone https://github.com/<your-username>/inventrack-dashboard.git
cd inventrack-dashboard
```
2. Backend
```bash
cd backend
npm install
cp .env.example .env      # set JWT_SECRET to a long random string
npm run seed                # optional: populate sample products & sales
npm run dev                  # → http://localhost:5001
```
3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                  # → http://localhost:5174
```
4. Try it out
Register an account, then head to the Dashboard — if you ran the seed
script, you'll see populated charts and a couple of low-stock alerts right
away. Add a product on the Products page, or record a sale on the Sales
page and watch the dashboard numbers update.
🗄️ Database Schema
```
users
categories ──┐
suppliers ───┼── products ── sales
             │       └── stock_movements
```
Recording a sale runs inside a single SQL transaction: it inserts the sale
row, decrements the product's quantity, and logs a stock movement — all or
nothing (see `backend/routes/sales.js`).
🔮 Possible Extensions
Purchase orders / supplier reorder workflow
CSV export of sales reports
Multi-warehouse / multi-location stock tracking
Role-based permissions (admin vs. staff)
📄 License
MIT — feel free to use this project as a learning reference or a portfolio base.
