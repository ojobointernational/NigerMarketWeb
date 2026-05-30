import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, ShoppingBag, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [form, setForm] = useState({
    delivery_address: '',
    phone: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/cart')
      .then(r => setCart(r.data))
      .catch(console.error);
  }, []);

  const set = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  // ─────────────────────────────────────────────
  // PAYMENT INITIATION
  // ─────────────────────────────────────────────
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!form.delivery_address.trim())
      return toast.error('Please enter your delivery address.');

    if (!form.phone.trim())
      return toast.error('Please enter your phone number.');

    if (!cart || cart.items.length === 0)
      return toast.error('Your cart is empty.');

    setLoading(true);

    try {
      const res = await api.post('/payment/initialize', form);

      toast.success('Redirecting to payment...');

      // ✅ FIX: SAVE ORDER ID BEFORE REDIRECT
      localStorage.setItem('pending_order_id', res.data.order_id);

      window.location.href = res.data.authorization_url;

    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initialize payment.');
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // PAYMENT VERIFICATION AFTER REDIRECT
  // ─────────────────────────────────────────────
  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get('reference');

    const orderId = localStorage.getItem('pending_order_id');

    if (reference && orderId) {
      const verifyPayment = async () => {
        try {
          await api.post('/payment/verify', { reference });

          toast.success('🎉 Payment successful!');

          localStorage.removeItem('pending_order_id');

          navigate('/orders');

        } catch (err) {
          toast.error('Payment verification failed.');
        }
      };

      verifyPayment();
    }
  }, [navigate]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
      </div>

      <div className="checkout-layout">

        {/* LEFT FORM */}
        <form onSubmit={handlePayment} className="checkout-form">

          <div className="card">
            <div className="card-body">

              <h2 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                <MapPin size={20} color="var(--green)" />
                Delivery Information
              </h2>

              <div className="form-group">
                <label className="form-label">Delivery Address *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="House number, street, area..."
                  value={form.delivery_address}
                  onChange={set('delivery_address')}
                  required
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} style={{ marginRight: 4 }} />
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
                <label className="form-label">Order Notes (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Any instructions..."
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                />
              </div>

            </div>
          </div>

          {/* PAYMENT INFO */}
          <div className="pay-notice">
            <Lock size={20} color="var(--green)" />
            <div>
              <strong>Secure Payment with Paystack</strong>
              <p>
                You will be redirected to Paystack to complete payment securely.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !cart}
            style={{ width: '100%', padding: '18px', fontSize: 17 }}
          >
            <ShoppingBag size={20} />
            {loading
              ? 'Processing...'
              : `Pay ₦${cart ? parseFloat(cart.total).toLocaleString() : '...'}`
            }
          </button>

        </form>

        {/* RIGHT SUMMARY */}
        <div className="card">
          <div className="card-body">

            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Order Summary</h2>

            {cart?.items.map(item => (
              <div key={item.product_id} className="checkout-item">
                <span>{item.name} × {item.quantity}</span>
                <span>
                  ₦{(parseFloat(item.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}

            <div className="checkout-total">
              <strong>Total</strong>
              <strong style={{ color: 'var(--green)', fontSize: 22 }}>
                ₦{cart ? parseFloat(cart.total).toLocaleString() : '...'}
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
          align-items: start;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pay-notice {
          display: flex;
          gap: 12px;
          background: var(--green-pale);
          padding: 16px;
          border-radius: var(--radius);
          border-left: 3px solid var(--green);
          font-size: 14px;
        }

        .checkout-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid var(--gray-100);
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