import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);

  const [form, setForm] = useState({
    delivery_address: '',
    phone: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/cart')
      .then(res => setCart(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Failed to load cart');
      });
  }, []);

  const set = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.delivery_address.trim()) {
      return toast.error('Please enter delivery address.');
    }

    if (!form.phone.trim()) {
      return toast.error('Please enter phone number.');
    }

    if (!cart?.items?.length) {
      return toast.error('Your cart is empty.');
    }

    setLoading(true);

    try {
      // ✅ MATCHES YOUR BACKEND EXACTLY
      const payload = {
        delivery_address: form.delivery_address,
        phone: form.phone,
        notes: form.notes || null,

        total_amount: parseFloat(cart.total),

        items: cart.items.map(item => ({
          product_name: item.name || item.product_name,
          product_price: parseFloat(item.price || item.product_price),
          quantity: item.quantity
        }))
      };

      console.log("ORDER PAYLOAD:", payload);

      await api.post('/orders', payload);

      toast.success('🎉 Order placed successfully!');
      navigate('/orders');

    } catch (err) {
      console.error('ORDER ERROR:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Could not place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
      </div>

      <div className="checkout-layout">

        {/* LEFT SIDE FORM */}
        <form onSubmit={handleSubmit} className="checkout-form">

          <div className="card">
            <div className="card-body">

              <h2 style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
                <MapPin size={20} color="var(--green)" />
                Delivery Information
              </h2>

              <div className="form-group">
                <label className="form-label">Delivery Address *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Enter full delivery address"
                  value={form.delivery_address}
                  onChange={set('delivery_address')}
                  required
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} style={{ marginRight: 5 }} />
                  Phone Number *
                </label>
                <input
                  className="form-input"
                  placeholder="08012345678"
                  value={form.phone}
                  onChange={set('phone')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Delivery instructions..."
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                />
              </div>

            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: 18 }}
          >
            <ShoppingBag size={18} />
            {loading
              ? 'Placing Order...'
              : `Place Order — ₦${cart ? parseFloat(cart.total).toLocaleString() : '0'}`
            }
          </button>

        </form>

        {/* RIGHT SIDE SUMMARY */}
        <div className="card">
          <div className="card-body">

            <h2 style={{ marginBottom: 20 }}>Order Summary</h2>

            {!cart?.items?.length ? (
              <p>Your cart is empty</p>
            ) : (
              cart.items.map((item, i) => (
                <div key={i} className="checkout-item">
                  <span>
                    {item.name || item.product_name} × {item.quantity}
                  </span>

                  <strong>
                    ₦{(
                      parseFloat(item.price || item.product_price) *
                      item.quantity
                    ).toLocaleString()}
                  </strong>
                </div>
              ))
            )}

            <div className="checkout-total">
              <strong>Total</strong>
              <strong style={{ color: 'var(--green)', fontSize: 20 }}>
                ₦{cart ? parseFloat(cart.total).toLocaleString() : '0'}
              </strong>
            </div>

          </div>
        </div>

      </div>

      {/* STYLES */}
      <style>{`
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .checkout-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }

        .checkout-total {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

    </div>
  );
}