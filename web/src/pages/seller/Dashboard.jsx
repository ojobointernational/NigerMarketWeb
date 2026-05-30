import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/seller/products'),
      api.get('/seller/dashboard'),
    ]).then(([pr, st]) => {
      setProducts(pr.data);
      setStats(st.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/seller/products/${id}`);
      setProducts(p => p.filter(x => x.id !== id));
      toast.success('Product deleted.');
    } catch {
      toast.error('Could not delete product.');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏪 {user?.shop_name || 'My Shop'}</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>Seller Dashboard</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/seller/add')}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          {[
            { icon: '📦', label: 'Products',    value: stats.total_products },
            { icon: '🧾', label: 'Orders',      value: stats.total_orders },
            { icon: '💰', label: 'Revenue',     value: `₦${stats.total_revenue.toLocaleString()}` },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Products table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 17 }}>My Products ({products.length})</h2>
            <button className="btn-secondary btn-sm" onClick={() => navigate('/seller/orders')}>
              <Package size={15} /> View Orders
            </button>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products yet</h3>
              <p>Add your first product to start selling</p>
              <button className="btn-primary" onClick={() => navigate('/seller/add')}>
                <Plus size={16} /> Add Product
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                            : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛍️</div>
                          }
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{p.category_name}</div>
                          </div>
                        </div>
                      </td>
                      <td><strong style={{ color: 'var(--green)' }}>₦{parseFloat(p.price).toLocaleString()}</strong></td>
                      <td>
                        <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock < 5 ? 'badge-yellow' : 'badge-green'}`}>
                          {p.stock} left
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.is_available ? 'badge-green' : 'badge-red'}`}>
                          {p.is_available ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-secondary btn-sm" onClick={() => navigate(`/seller/edit/${p.id}`)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn-danger btn-sm" onClick={() => deleteProduct(p.id, p.name)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}