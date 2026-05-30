import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Store, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await api.post('/cart', { product_id: parseInt(id), quantity });
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!product) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <div className="empty-state-icon">❌</div>
      <h3>Product not found</h3>
      <button className="btn-primary" onClick={() => navigate('/')}>Back to Shop</button>
    </div>
  );

  return (
    <div className="page">
      <button className="btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="product-detail-grid">
        {/* Image */}
        <div className="product-detail-img-wrap">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="product-detail-img" />
          ) : (
            <div className="product-detail-img-ph">🛍️</div>
          )}
        </div>

        {/* Info */}
        <div className="product-detail-info">
          {product.category_name && (
            <span className="badge badge-green" style={{ marginBottom: 12, display: 'inline-flex' }}>
              {product.category_icon} {product.category_name}
            </span>
          )}
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>{product.name}</h1>
          <div className="product-detail-price">₦{parseFloat(product.price).toLocaleString()}</div>

          <div className="product-detail-shop">
            <Store size={16} />
            <span>Sold by <strong>{product.seller_shop_name}</strong></span>
          </div>

          <div className="product-detail-stock">
            <Package size={16} />
            {product.stock > 0
              ? <span className="in-stock">✅ In Stock ({product.stock} available)</span>
              : <span className="out-stock">❌ Out of Stock</span>
            }
          </div>

          {product.description && (
            <div className="product-detail-desc">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.stock > 0 && (
            <>
              <div className="qty-row">
                <span className="qty-label">Quantity:</span>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="qty-num">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                </div>
              </div>

              <div className="product-detail-total">
                <span>Total:</span>
                <strong>₦{(parseFloat(product.price) * quantity).toLocaleString()}</strong>
              </div>

              <button className="btn-primary" style={{ width: '100%', padding: '16px' }} onClick={addToCart} disabled={adding}>
                <ShoppingCart size={18} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .product-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px; align-items: start;
        }
        .product-detail-img-wrap {
          border-radius: var(--radius-lg);
          overflow: hidden; aspect-ratio: 1;
          background: var(--gray-100);
        }
        .product-detail-img { width: 100%; height: 100%; object-fit: cover; }
        .product-detail-img-ph {
          width: 100%; height: 400px;
          display: flex; align-items: center;
          justify-content: center; font-size: 96px;
          background: var(--gray-100);
        }
        .product-detail-price {
          font-size: 36px; font-weight: 900;
          color: var(--green); margin-bottom: 16px;
          font-family: 'Sora', sans-serif;
        }
        .product-detail-shop, .product-detail-stock {
          display: flex; align-items: center;
          gap: 8px; font-size: 14px;
          color: var(--gray-600); margin-bottom: 12px;
        }
        .in-stock  { color: #166534; font-weight: 600; }
        .out-stock { color: var(--red); font-weight: 600; }
        .product-detail-desc {
          margin: 20px 0;
          padding: 20px; background: var(--gray-50);
          border-radius: var(--radius); border-left: 3px solid var(--green);
        }
        .product-detail-desc h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gray-500); margin-bottom: 8px; }
        .product-detail-desc p  { font-size: 15px; color: var(--gray-700); line-height: 1.7; }
        .qty-row { display: flex; align-items: center; gap: 16px; margin: 20px 0; }
        .qty-label { font-weight: 700; color: var(--gray-700); }
        .qty-controls { display: flex; align-items: center; gap: 12px; }
        .qty-btn {
          width: 36px; height: 36px;
          border-radius: var(--radius-sm);
          background: var(--gray-100);
          font-size: 20px; font-weight: 700;
          color: var(--gray-700); display: flex;
          align-items: center; justify-content: center;
          cursor: pointer; transition: var(--transition);
          border: 1.5px solid var(--gray-200);
        }
        .qty-btn:hover { background: var(--green-light); border-color: var(--green); }
        .qty-num { font-size: 20px; font-weight: 800; min-width: 32px; text-align: center; }
        .product-detail-total {
          display: flex; justify-content: space-between;
          align-items: center; padding: 16px;
          background: var(--green-pale);
          border-radius: var(--radius); margin-bottom: 16px;
          font-size: 16px; color: var(--gray-700);
        }
        .product-detail-total strong {
          font-size: 22px; font-weight: 900;
          color: var(--green); font-family: 'Sora', sans-serif;
        }
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr; gap: 24px; }
          .product-detail-img-ph { height: 260px; font-size: 64px; }
        }
      `}</style>
    </div>
  );
}