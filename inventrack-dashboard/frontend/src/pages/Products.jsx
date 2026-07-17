import { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { sku: '', name: '', categoryId: '', costPrice: '', salePrice: '', quantity: '', reorderLevel: 10 };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search]);

  async function loadProducts() {
    const { data } = await api.get('/products', { params: search ? { search } : {} });
    setProducts(data);
  }

  async function loadCategories() {
    const { data } = await api.get('/meta/categories');
    setCategories(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/products', form);
      setForm(emptyForm);
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create product');
    }
  }

  async function adjustStock(id, change) {
    const reason = change > 0 ? 'Restock' : 'Manual correction';
    await api.post(`/products/${id}/adjust-stock`, { change, reason });
    loadProducts();
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ New Product'}</button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <div className="form-grid">
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Cost price" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            <input type="number" step="0.01" placeholder="Sale price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
            <input type="number" placeholder="Initial quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <input type="number" placeholder="Reorder level" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
          </div>
          <button type="submit">Save Product</button>
        </form>
      )}

      <input className="search-box" placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th><th>Name</th><th>Category</th><th>Cost</th><th>Price</th><th>Qty</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={p.quantity <= p.reorder_level ? 'low-row' : ''}>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>{p.category_name || '—'}</td>
              <td>${p.cost_price.toFixed(2)}</td>
              <td>${p.sale_price.toFixed(2)}</td>
              <td>{p.quantity}</td>
              <td className="actions-cell">
                <button onClick={() => adjustStock(p.id, 10)}>+10</button>
                <button onClick={() => adjustStock(p.id, -1)}>-1</button>
                <button className="danger" onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={7} className="empty-small">No products found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
