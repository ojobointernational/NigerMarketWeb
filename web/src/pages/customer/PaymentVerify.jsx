import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../config/api';

export default function PaymentVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) {
      navigate('/');
      return;
    }
    verify();
  }, [reference]);

  const verify = async () => {
    try {
      const res = await api.post('/payment/verify', { reference });
      setStatus('success');
      toast.success(res.data.message);
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      setStatus('failed');
      toast.error(err.response?.data?.message || 'Payment verification failed.');
    }
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 20,
        padding: '48px 40px', maxWidth: 480,
        width: '100%', textAlign: 'center',
        boxShadow: '0 16px 32px rgba(0,0,0,0.1)',
      }}>
        {status === 'verifying' && (
          <>
            <div className="spinner" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Verifying Payment...</h2>
            <p style={{ color: 'var(--gray-500)' }}>Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 26, marginBottom: 8, color: 'var(--green)' }}>
              Payment Successful!
            </h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 24 }}>
              Your order has been confirmed. Redirecting to your orders...
            </p>
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/orders')}
            >
              View My Orders
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{ fontSize: 72, marginBottom: 20 }}>❌</div>
            <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--red)' }}>
              Payment Failed
            </h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 24 }}>
              Your payment could not be verified. Please try again.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => navigate('/cart')}
              >
                Back to Cart
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={verify}
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}