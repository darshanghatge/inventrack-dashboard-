import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api';
import StatCard from '../components/StatCard';

const COLORS = ['#6366f1', '#22d3ee', '#f472b6', '#fbbf24', '#34d399'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setSummary(r.data));
    api.get('/dashboard/sales-trend').then((r) => setTrend(r.data));
    api.get('/dashboard/top-products').then((r) => setTopProducts(r.data));
    api.get('/dashboard/category-breakdown').then((r) => setCategoryData(r.data));
    api.get('/dashboard/low-stock').then((r) => setLowStock(r.data));
  }, []);

  if (!summary) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stat-grid">
        <StatCard label="Total Products" value={summary.totalProducts} accent="#6366f1" />
        <StatCard label="Stock Value" value={`$${summary.totalStockValue.toLocaleString()}`} accent="#22d3ee" />
        <StatCard label="Revenue (30d)" value={`$${summary.revenueLast30Days.toLocaleString()}`} accent="#34d399" />
        <StatCard label="Profit (30d)" value={`$${summary.profitLast30Days.toLocaleString()}`} accent="#fbbf24" />
        <StatCard label="Low Stock Items" value={summary.lowStockCount} accent="#f87171" />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Revenue — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top 5 Products by Units Sold</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
              <Bar dataKey="units_sold" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="revenue" nameKey="category" outerRadius={90} label>
                {categoryData.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Low Stock Alerts</h3>
          <div className="low-stock-list">
            {lowStock.map((p) => (
              <div key={p.id} className="low-stock-row">
                <span>{p.name} <small>({p.sku})</small></span>
                <span className="qty-badge">{p.quantity} left</span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="empty-small">All stock levels are healthy 🎉</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
