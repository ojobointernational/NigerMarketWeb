import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../config/api';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];
const STATUS_STYLE = {
  pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-blue',
  shipped: 'badge-gray', delivered: 'badge-green', cancelled: 'badge-red',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/orders')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
      toast.success(`Order #${id} → ${status}`);
    } catch { toast.error('Could not update status.'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">All Orders ({orders.length})</h1>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>#{order.id}</strong></td>
                  <td>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customer_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{order.customer_email}</div>
                  </td>
                  <td style={{ fontSize: 13, maxWidth: 180 }}>{order.delivery_address}</td>
                  <td><strong style={{ color: 'var(--green)' }}>₦{parseFloat(order.total_amount).toLocaleString()}</strong></td>
                  <td>
                    <span className={`badge ${order.payment_status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_STYLE[order.status]}`}>{order.status}</span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '6px 10px', fontSize: 13, width: 130 }}
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}