import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../../config/api';

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchProducts = async (q = '', cat = '', s = 'newest') => {
    try {
      const params = new URLSearchParams();
      if (q)   params.set('search', q);
      if (cat) params.set('category', cat);
      if (s)   params.set('sort', s);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data)).catch(console.error);
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(window._st);
    window._st = setTimeout(() => fetchProducts(val, selectedCat, sort), 400);
  };

  const handleCat = (id) => {
    const newCat = selectedCat === id ? '' : id;
    setSelectedCat(newCat);
    fetchProducts(search, newCat, sort);
  };

  const handleSort = (e) => {
    setSort(e.target.value);
    fetchProducts(search, selectedCat, e.target.value);
  };

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1 className="hero-title">
            Nigeria's Favourite<br />Online Marketplace
          </h1>
          <p className="hero-sub">
            Shop from thousands of sellers across Nigeria
          </p>
          <div className="hero-search">
            <Search size={20} className="hero-search-icon" />
            <input
              className="hero-search-input"
              placeholder="Search for products, brands, categories..."
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="page">
        {/* Categories */}
        <div className="categories-row">
          <button
            className={`cat-chip ${!selectedCat ? 'active' : ''}`}
            onClick={() => handleCat('')}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`cat-chip ${selectedCat === String(c.id) ? 'active' : ''}`}
              onClick={() => handleCat(String(c.id))}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <span className="toolbar-count">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </span>
          <div className="toolbar-right">
            <SlidersHorizontal size={16} />
            <select className="sort-select" value={sort} onChange={handleSort}>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="name_az">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <h3>No products found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="product-card-img" />
                ) : (
                  <div className="product-card-img-placeholder">🛍️</div>
                )}
                <div className="product-card-body">
                  <div className="product-card-shop">🏪 {product.seller_shop_name}</div>
                  <div className="product-card-name">{product.name}</div>
                  <div className="product-card-price">₦{parseFloat(product.price).toLocaleString()}</div>
                  {product.stock === 0 && (
                    <div className="product-card-oos">Out of Stock</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Support Section */}
<div className="support-section">
  <h3>Need Help?</h3>
  <p>
    If you have any enquiries, payment issues, delivery concerns, or need
    assistance using NaijaMarket, we're here to help.
  </p>

  <a href="tel:08077876818" className="support-btn">
    📞 Call 08077876818
  </a>
</div>
      </div>

      <style>{`
        .hero {
          background: linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%);
          padding: 80px 20px 60px;
          text-align: center;
        }
        .hero-title {
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 900; color: white;
          line-height: 1.2; margin-bottom: 16px;
        }
        .hero-sub {
          color: rgba(255,255,255,0.85);
          font-size: 18px; margin-bottom: 32px;
        }
        .hero-search {
          position: relative; max-width: 600px;
          margin: 0 auto;
        }
        .hero-search-icon {
          position: absolute; left: 18px; top: 50%;
          transform: translateY(-50%); color: var(--gray-400);
        }
        .hero-search-input {
          width: 100%; padding: 18px 20px 18px 52px;
          border-radius: 999px; border: none;
          font-size: 16px; color: var(--gray-900);
          box-shadow: var(--shadow-lg);
          outline: none;
        }
        .categories-row {
          display: flex; gap: 8px;
          overflow-x: auto; padding-bottom: 4px;
          margin-bottom: 20px;
          scrollbar-width: none;
        }
        .categories-row::-webkit-scrollbar { display: none; }
        .cat-chip {
          white-space: nowrap;
          padding: 8px 16px; border-radius: 999px;
          font-size: 13px; font-weight: 600;
          border: 1.5px solid var(--gray-200);
          background: white; color: var(--gray-600);
          cursor: pointer; transition: var(--transition);
          flex-shrink: 0;
        }
        .cat-chip:hover, .cat-chip.active {
          background: var(--green); color: white;
          border-color: var(--green);
        }
        .toolbar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .toolbar-count { font-size: 14px; color: var(--gray-500); font-weight: 500; }
        .toolbar-right { display: flex; align-items: center; gap: 8px; color: var(--gray-400); }
        .sort-select {
          padding: 8px 12px; border-radius: var(--radius-sm);
          border: 1.5px solid var(--gray-200);
          font-size: 13px; font-weight: 600;
          color: var(--gray-700); background: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}