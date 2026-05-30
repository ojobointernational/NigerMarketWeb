import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    password: '', confirm: '',
    shop_name: '', shop_description: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm)
      return toast.error('Please fill in all required fields.');
    if (form.password !== form.confirm)
      return toast.error('Passwords do not match.');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters.');
    if (role === 'seller' && !form.shop_name)
      return toast.error('Shop name is required for sellers.');

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone || undefined,
        role,
        shop_name: form.shop_name || undefined,
        shop_description: form.shop_description || undefined,
      });

      if (role === 'seller') {
        toast.success('Seller account created! Waiting for admin approval.');
        navigate('/login');
      } else {
        login(res.data.user, res.data.token);
        toast.success(res.data.message);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <div className="auth-logo">🛒</div>
          <h1>Create Account</h1>
          <p>Join Naija Market today</p>
        </div>

        {/* Role selector */}
        <div className="role-selector">
          {[
            { key: 'customer', icon: '🛍️', label: 'Shop', sub: 'Buy products' },
            { key: 'seller',   icon: '🏪', label: 'Sell', sub: 'List & sell products' },
          ].map(r => (
            <button
              key={r.key}
              type="button"
              className={`role-btn ${role === r.key ? 'active' : ''}`}
              onClick={() => setRole(r.key)}
            >
              <span style={{ fontSize: 24 }}>{r.icon}</span>
              <strong>{r.label}</strong>
              <small>{r.sub}</small>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" placeholder="08012345678" value={form.phone} onChange={set('phone')} />
          </div>

          {role === 'seller' && (
            <>
              <div className="form-group">
                <label className="form-label">Shop Name *</label>
                <input className="form-input" placeholder="e.g. Emeka Electronics" value={form.shop_name} onChange={set('shop_name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Shop Description</label>
                <textarea className="form-input form-textarea" placeholder="What do you sell?" value={form.shop_description} onChange={set('shop_description')} />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner-sm" /> : role === 'seller' ? 'Apply as Seller' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: calc(100vh - 72px);
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--green-pale) 0%, var(--gray-100) 100%);
          padding: 40px 20px;
        }
        .auth-card {
          background: white; border-radius: var(--radius-lg);
          padding: 40px; width: 100%; max-width: 440px;
          box-shadow: var(--shadow-lg); border: 1px solid var(--gray-200);
        }
        .auth-header { text-align: center; margin-bottom: 24px; }
        .auth-logo { font-size: 52px; margin-bottom: 12px; }
        .auth-header h1 { font-size: 26px; margin-bottom: 6px; }
        .auth-header p  { color: var(--gray-500); font-size: 14px; }
        .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .role-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; padding: 16px 12px; border-radius: var(--radius);
          border: 2px solid var(--gray-200); cursor: pointer;
          transition: var(--transition); background: white;
        }
        .role-btn strong { font-size: 15px; font-weight: 700; color: var(--gray-700); }
        .role-btn small  { font-size: 12px; color: var(--gray-400); }
        .role-btn.active { border-color: var(--green); background: var(--green-pale); }
        .role-btn.active strong { color: var(--green); }
        .auth-footer { text-align: center; margin-top: 24px; font-size: 14px; color: var(--gray-500); }
        .auth-footer a { color: var(--green); font-weight: 700; }
        .spinner-sm { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
}