import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(), password,
      });
      login(res.data.user, res.data.token);
      toast.success(res.data.message);
      const { role, seller_status } = res.data.user;
      if (role === 'admin') navigate('/admin');
      else if (role === 'seller' && seller_status === 'approved') navigate('/seller');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🛒</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your Naija Market account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: calc(100vh - 72px);
          display: flex; align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--green-pale) 0%, var(--gray-100) 100%);
          padding: 40px 20px;
        }
        .auth-card {
          background: white; border-radius: var(--radius-lg);
          padding: 40px; width: 100%; max-width: 440px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-200);
        }
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-logo { font-size: 52px; margin-bottom: 12px; }
        .auth-header h1 { font-size: 26px; margin-bottom: 6px; }
        .auth-header p  { color: var(--gray-500); font-size: 14px; }
        .input-with-icon { position: relative; }
        .input-with-icon .form-input { padding-right: 46px; }
        .input-icon-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400); display: flex;
        }
        .input-icon-btn:hover { color: var(--gray-600); }
        .auth-footer {
          text-align: center; margin-top: 24px;
          font-size: 14px; color: var(--gray-500);
        }
        .auth-footer a { color: var(--green); font-weight: 700; }
        .spinner-sm {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}