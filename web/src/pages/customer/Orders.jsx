import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import api from '../../config/api';

const STATUS_STYLES = {
  pending:    'badge-yellow',
  confirmed:  'badge-blue',
  processing: 'badge-blue',
  shipped:    'badge-gray',
  delivered:  'badge-green',
  cancelled:  'badge-red',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Package size={64} color="var(--gray-300)" /></div>
          <h3>No orders yet</h3>
          <p>Your orders will appear here after you shop</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="card-body">
                <div className="order-header">
                  <div>
                    <div className="order-id">Order #{order.id}</div>
                    <div className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-NG', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`badge ${STATUS_STYLES[order.status] || 'badge-gray'}`}>
                      {order.status}
                    </span>
                    <span className={`badge ${order.payment_status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                      {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                    </span>
                  </div>
                </div>
                <div className="order-address">📍 {order.delivery_address}</div>
                {order.items && order.items[0] && (
                  <div className="order-items-list">
                    {order.items.filter(i => i).map((item, idx) => (
                      <span key={idx} className="order-item-tag">
                        {item.product_name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                )}
                <div className="order-footer">
                  <strong className="order-total">₦{parseFloat(order.total_amount).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
        .order-id   { font-size: 17px; font-weight: 800; color: var(--gray-900); font-family: 'Sora', sans-serif; }
        .order-date { font-size: 13px; color: var(--gray-400); margin-top: 2px; }
        .order-address { font-size: 13px; color: var(--gray-600); margin-bottom: 12px; }
        .order-items-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .order-item-tag { background: var(--gray-100); padding: 4px 10px; border-radius: 999px; font-size: 12px; color: var(--gray-600); font-weight: 500; }
        .order-footer { border-top: 1px solid var(--gray-100); padding-top: 12px; display: flex; justify-content: flex-end; }
        .order-total { font-size: 20px; color: var(--green); font-family: 'Sora', sans-serif; }
      `}</style>
    </div>
  );
}