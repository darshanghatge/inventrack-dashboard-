import { useEffect, useState } from 'react';
import api from '../api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSales();
    api.get('/products').then((r) => setProducts(r.data));
  }, []);

  async function loadSales() {
    const { data } = await api.get('/sales');
    setSales(data);
  }

  async function recordSale(e) {
    e.preventDefault();
    setError('');
    if (!productId) return;
    try {
      await api.post('/sales', { productId: Number(productId), quantity: Number(quantity) });
      setQuantity(1);
      loadSales();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not record sale');
    }
  }

  return (
    <div>
      <h1>Sales</h1>

      <form className="product-form" onSubmit={recordSale}>
        {error && <div className="error">{error}</div>}
        <div className="form-grid">
          <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.quantity} in stock)</option>
            ))}
          </select>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <button type="submit">Record Sale</button>
      </form>

      <table className="data-table">
        <thead>
          <tr><th>Date</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Sold By</th></tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{new Date(s.sold_at).toLocaleString()}</td>
              <td>{s.product_name}</td>
              <td>{s.quantity}</td>
              <td>${s.sale_price.toFixed(2)}</td>
              <td>${(s.quantity * s.sale_price).toFixed(2)}</td>
              <td>{s.sold_by_name || '—'}</td>
            </tr>
          ))}
          {sales.length === 0 && <tr><td colSpan={6} className="empty-small">No sales recorded yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
