import { useState, useEffect } from 'react';
import api from '../../config/api';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/orders')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Shop Orders ({orders.length})</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Orders for your products will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>Order #{order.id}</strong>
                    <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                    {order.status}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 8 }}>
                  👤 {order.customer_name} · 📞 {order.phone}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
                  📍 {order.delivery_address}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {order.my_items?.map((item, i) => (
                    <span key={i} style={{ background: 'var(--gray-100)', padding: '4px 10px', borderRadius: 999, fontSize: 12 }}>
                      {item.product_name} × {item.quantity}
                    </span>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 10, textAlign: 'right' }}>
                  <strong style={{ color: 'var(--green)', fontSize: 18 }}>
                    ₦{parseFloat(order.my_total).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}