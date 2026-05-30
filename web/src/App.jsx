// App.jsx — defines all pages and their URLs

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PaymentVerify from './pages/customer/PaymentVerify';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer pages
import Home from './pages/customer/Home';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminSellers from './pages/admin/Sellers';
import AdminOrders from './pages/admin/Orders';

// Layout
import Navbar from './components/layout/Navbar';

// ── Protected Route Components ───────────────────────────────

// Requires login
function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Requires approved seller account
function SellerRoute({ children }) {
  const { isLoggedIn, isApprovedSeller, isSeller, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isSeller && !isApprovedSeller) {
    return (
      <div className="pending-screen">
        <div className="pending-card">
          <span className="pending-icon">⏳</span>
          <h2>Pending Approval</h2>
          <p>Your seller account is awaiting admin approval. You will be notified once approved.</p>
          <a href="/" className="btn-primary">Back to Shop</a>
        </div>
      </div>
    );
  }
  return isApprovedSeller ? children : <Navigate to="/" replace />;
}

// Requires admin account
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
}

// ── Main App ─────────────────────────────────────────────────
function AppRoutes() {
  const { isLoggedIn, isAdmin, isApprovedSeller } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={
            isLoggedIn
              ? <Navigate to={isAdmin ? '/admin' : isApprovedSeller ? '/seller' : '/'} replace />
              : <Login />
          } />
          <Route path="/register" element={
            isLoggedIn ? <Navigate to="/" replace /> : <Register />
          } />

          {/* Customer routes (require login) */}
          <Route path="/cart"     element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders"   element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/payment/verify" element={<PrivateRoute><PaymentVerify /></PrivateRoute>} />

          {/* Seller routes */}
          <Route path="/seller"         element={<SellerRoute><SellerDashboard /></SellerRoute>} />
          <Route path="/seller/add"     element={<SellerRoute><AddProduct /></SellerRoute>} />
          <Route path="/seller/edit/:id" element={<SellerRoute><EditProduct /></SellerRoute>} />

          {/* Admin routes */}
          <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/sellers"  element={<AdminRoute><AdminSellers /></AdminRoute>} />
          <Route path="/admin/orders"   element={<AdminRoute><AdminOrders /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="not-found">
              <h1>404</h1>
              <p>Page not found</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}