import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: '0.00', count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (productId, qty) => {
    if (qty < 1) return;
    try {
      await api.put(`/cart/${productId}`, { quantity: qty });
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update.');
    }
  };

  const removeItem = async (productId, name) => {
    try {
      await api.delete(`/cart/${productId}`);
      toast.success(`${name} removed from cart`);
      fetchCart();
    } catch {
      toast.error('Could not remove item.');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  if (cart.items.length === 0) return (
    <div className="page">
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          <ShoppingBag size={18} /> Start Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Cart ({cart.count} items)</h1>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.product_id} className="cart-item card">
              <div className="cart-item-body card-body">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} className="cart-item-img" />
                  : <div className="cart-item-img cart-item-img-ph">🛍️</div>
                }
                <div className="cart-item-info">
                  <div className="cart-item-shop">{item.seller_shop_name}</div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₦{parseFloat(item.price).toLocaleString()}</div>
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity - 1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="btn-danger btn-sm" onClick={() => removeItem(item.product_id, item.name)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-subtotal">
                  ₦{(parseFloat(item.price) * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary card">
          <div className="card-body">
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({cart.count} items)</span>
              <strong>₦{parseFloat(cart.total).toLocaleString()}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className="badge badge-green">Calculated at checkout</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>₦{parseFloat(cart.total).toLocaleString()}</strong>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 20, padding: '16px' }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
        .cart-items { display: flex; flex-direction: column; gap: 12px; }
        .cart-item-body { display: flex; align-items: center; gap: 16px; }
        .cart-item-img { width: 88px; height: 88px; border-radius: var(--radius); object-fit: cover; flex-shrink: 0; }
        .cart-item-img-ph { background: var(--gray-100); display: flex; align-items: center; justify-content: center; font-size: 36px; }
        .cart-item-info { flex: 1; }
        .cart-item-shop  { font-size: 11px; color: var(--gray-400); margin-bottom: 3px; }
        .cart-item-name  { font-size: 15px; font-weight: 700; color: var(--gray-800); margin-bottom: 4px; }
        .cart-item-price { font-size: 13px; color: var(--gray-500); margin-bottom: 10px; }
        .cart-item-controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .cart-item-subtotal { font-size: 17px; font-weight: 900; color: var(--green); font-family: 'Sora', sans-serif; white-space: nowrap; }
        .qty-controls { display: flex; align-items: center; gap: 8px; }
        .qty-btn { width: 30px; height: 30px; border-radius: 6px; background: var(--gray-100); font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1.5px solid var(--gray-200); transition: var(--transition); }
        .qty-btn:hover { background: var(--green-light); border-color: var(--green); }
        .qty-num { font-size: 15px; font-weight: 700; min-width: 24px; text-align: center; }
        .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--gray-100); font-size: 14px; color: var(--gray-600); }
        .summary-total { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; font-size: 18px; }
        .summary-total strong { font-size: 22px; color: var(--green); font-family: 'Sora', sans-serif; }
        @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } .cart-item-body { flex-wrap: wrap; } }
      `}</style>
    </div>
  );
}