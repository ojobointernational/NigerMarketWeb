import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Store, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, isApprovedSeller, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn && !isAdmin && !isApprovedSeller) {
      api.get('/cart')
        .then(r => setCartCount(r.data.count || 0))
        .catch(() => {});
    }
  }, [isLoggedIn, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          🛒 <span>Naija</span>Market
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Shop
          </Link>
          {isLoggedIn && !isAdmin && !isApprovedSeller && (
            <>
              <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>
                Orders
              </Link>
            </>
          )}
          {isApprovedSeller && (
            <Link to="/seller" className={`nav-link ${location.pathname.startsWith('/seller') ? 'active' : ''}`}>
              My Shop
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {isLoggedIn && !isAdmin && !isApprovedSeller && (
            <Link to="/cart" className="cart-btn">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="user-menu">
              <button className="user-btn">
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
              </button>
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item">
                    <Settings size={16} /> Admin Panel
                  </Link>
                )}
                {isApprovedSeller && (
                  <Link to="/seller" className="dropdown-item">
                    <Store size={16} /> My Shop
                  </Link>
                )}
                <button onClick={handleLogout} className="dropdown-item dropdown-logout">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn-primary btn-sm">Register</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-link">🏠 Shop</Link>
          {isLoggedIn && !isAdmin && !isApprovedSeller && (
            <>
              <Link to="/cart"   onClick={() => setMenuOpen(false)} className="mobile-link">🛒 Cart {cartCount > 0 && `(${cartCount})`}</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="mobile-link">📦 Orders</Link>
            </>
          )}
          {isApprovedSeller && (
            <Link to="/seller" onClick={() => setMenuOpen(false)} className="mobile-link">🏪 My Shop</Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="mobile-link">⚙️ Admin</Link>
          )}
          {isLoggedIn
            ? <button onClick={handleLogout} className="mobile-link mobile-logout">🚪 Logout</button>
            : <>
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="mobile-link">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="mobile-link">Register</Link>
              </>
          }
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--gray-200);
          transition: box-shadow 0.2s ease;
          height: 72px;
        }
        .navbar-scrolled { box-shadow: var(--shadow-md); }
        .navbar-inner {
          display: flex; align-items: center;
          justify-content: space-between; height: 72px;
        }
        .navbar-logo {
          font-family: 'Sora', sans-serif;
          font-size: 22px; font-weight: 900;
          color: var(--green); display: flex;
          align-items: center; gap: 8px;
        }
        .navbar-logo span { color: var(--gray-900); }
        .navbar-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          padding: 8px 14px; border-radius: var(--radius-sm);
          font-weight: 600; font-size: 14px;
          color: var(--gray-600); transition: var(--transition);
        }
        .nav-link:hover, .nav-link.active {
          color: var(--green); background: var(--green-pale);
        }
        .navbar-right { display: flex; align-items: center; gap: 12px; }
        .cart-btn {
          position: relative; display: flex;
          padding: 8px; border-radius: var(--radius-sm);
          color: var(--gray-600); transition: var(--transition);
        }
        .cart-btn:hover { color: var(--green); background: var(--green-pale); }
        .cart-badge {
          position: absolute; top: 2px; right: 2px;
          background: var(--red); color: white;
          font-size: 10px; font-weight: 800;
          min-width: 16px; height: 16px;
          border-radius: 8px; display: flex;
          align-items: center; justify-content: center;
          padding: 0 4px;
        }
        .user-menu { position: relative; }
        .user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 999px;
          background: var(--gray-100);
          border: 1.5px solid var(--gray-200);
          cursor: pointer; transition: var(--transition);
        }
        .user-btn:hover { background: var(--green-pale); border-color: var(--green); }
        .user-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--green); color: white;
          display: flex; align-items: center;
          justify-content: center; font-weight: 800;
          font-size: 13px;
        }
        .user-name { font-size: 14px; font-weight: 600; color: var(--gray-700); }
        .user-dropdown {
          display: none; position: absolute;
          top: calc(100% + 8px); right: 0;
          background: white; border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-200);
          min-width: 220px; overflow: hidden; z-index: 100;
        }
        .user-menu:hover .user-dropdown { display: block; }
        .dropdown-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--gray-100);
          display: flex; flex-direction: column; gap: 2px;
        }
        .dropdown-header strong { font-size: 14px; color: var(--gray-900); }
        .dropdown-header span   { font-size: 12px; color: var(--gray-400); }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; font-size: 14px;
          color: var(--gray-700); font-weight: 600;
          transition: var(--transition); width: 100%;
          text-align: left; background: none;
        }
        .dropdown-item:hover { background: var(--gray-50); }
        .dropdown-logout { color: var(--red); }
        .dropdown-logout:hover { background: var(--red-light); }
        .auth-btns { display: flex; gap: 8px; }
        .menu-toggle {
          display: none; padding: 6px;
          border-radius: var(--radius-sm);
          color: var(--gray-700);
        }
        .mobile-menu {
          background: white; border-top: 1px solid var(--gray-100);
          padding: 12px 20px 20px;
        }
        .mobile-link {
          display: block; padding: 12px 0;
          font-size: 16px; font-weight: 600;
          color: var(--gray-700); width: 100%;
          text-align: left; border-bottom: 1px solid var(--gray-100);
        }
        .mobile-logout { color: var(--red); margin-top: 8px; }
        @media (max-width: 768px) {
          .navbar-links, .auth-btns, .user-name { display: none; }
          .menu-toggle { display: flex; }
        }
      `}</style>
    </nav>
  );
}