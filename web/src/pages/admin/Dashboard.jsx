import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const statItems = stats ? [
    { icon: <Users size={28} />,       label: 'Customers', value: stats.total_customers, color: '#3b82f6' },
    { icon: <Store size={28} />,       label: 'Sellers',   value: stats.total_sellers,   color: '#8b5cf6' },
    { icon: <Package size={28} />,     label: 'Products',  value: stats.total_products,  color: '#f59e0b' },
    { icon: <ShoppingCart size={28} />,label: 'Orders',    value: stats.total_orders,    color: '#16a34a' },
    { icon: <TrendingUp size={28} />,  label: 'Revenue',   value: `₦${stats.total_revenue.toLocaleString()}`, color: '#ef4444' },
  ] : [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Admin Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>Platform overview</p>
        </div>
        <button className="btn-danger" onClick={() => { logout(); navigate('/login'); }}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {statItems.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { icon: '🏪', title: 'Manage Sellers', sub: 'Approve or reject seller applications', route: '/admin/sellers', badge: null },
          { icon: '🧾', title: 'All Orders',     sub: 'View and update all customer orders',   route: '/admin/orders',  badge: null },
        ].map(a => (
          <button key={a.route} className="admin-action-card" onClick={() => navigate(a.route)}>
            <span style={{ fontSize: 36 }}>{a.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{a.sub}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 24, color: 'var(--gray-300)' }}>›</span>
          </button>
        ))}
      </div>

      <style>{`
        .admin-action-card {
          display: flex; align-items: center; gap: 16px;
          background: white; border-radius: var(--radius-md);
          padding: 20px; border: 1.5px solid var(--gray-200);
          cursor: pointer; transition: var(--transition);
          text-align: left; width: 100%;
          box-shadow: var(--shadow-sm);
        }
        .admin-action-card:hover {
          border-color: var(--green);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}