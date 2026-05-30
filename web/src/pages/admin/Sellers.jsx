import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

const STATUS_STYLE = {
  pending:  'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    api.get('/admin/sellers')
      .then(r => setSellers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id, name) => {
    try {
      await api.put(`/admin/sellers/${id}/approve`);
      setSellers(s => s.map(x => x.id === id ? { ...x, seller_status: 'approved' } : x));
      toast.success(`✅ ${name}'s shop approved!`);
    } catch { toast.error('Could not approve.'); }
  };

  const reject = async (id, name) => {
    if (!window.confirm(`Reject ${name}'s application?`)) return;
    try {
      await api.put(`/admin/sellers/${id}/reject`);
      setSellers(s => s.map(x => x.id === id ? { ...x, seller_status: 'rejected' } : x));
      toast.success(`${name}'s application rejected.`);
    } catch { toast.error('Could not reject.'); }
  };

  const filtered = sellers.filter(s => filter === 'all' || s.seller_status === filter);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Manage Sellers</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button
              key={f}
              className={filter === f ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize' }}
            >
              {f} ({f === 'all' ? sellers.length : sellers.filter(s => s.seller_status === f).length})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <h3>No {filter} sellers</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(seller => (
            <div key={seller.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>🏪</span>
                      <strong style={{ fontSize: 17 }}>{seller.shop_name}</strong>
                      <span className={`badge ${STATUS_STYLE[seller.seller_status]}`}>
                        {seller.seller_status}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 4 }}>
                      👤 {seller.name} · {seller.email}
                    </div>
                    {seller.phone && (
                      <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 4 }}>
                        📞 {seller.phone}
                      </div>
                    )}
                    {seller.shop_description && (
                      <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8, fontStyle: 'italic' }}>
                        "{seller.shop_description}"
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
                      Registered: {new Date(seller.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {seller.seller_status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary btn-sm" onClick={() => approve(seller.id, seller.name)}>
                        <CheckCircle size={15} /> Approve
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => reject(seller.id, seller.name)}>
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}