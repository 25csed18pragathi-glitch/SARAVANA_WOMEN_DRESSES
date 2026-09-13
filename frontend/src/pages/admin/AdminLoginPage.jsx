import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useShopSettings } from '../../context/ShopSettingsContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAdmin } = useAuth();
  const { settings } = useShopSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/admin';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        throw new Error('Access denied: Customer accounts cannot access the Admin Portal.');
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper" style={{ minHeight: '100vh', background: '#0F172A' }}>
      <div className="auth-card-container" style={{ maxWidth: '960px' }}>
        {/* Left Visual Side */}
        <div
          className="auth-visual-side"
          style={{
            background: 'linear-gradient(145deg, #1E1B4B 0%, #4C0519 50%, #9B2242 100%)'
          }}
        >
          <div className="auth-visual-content">
            <div className="brand-badge-light">
              <Sparkles size={16} />
              <span>{settings.shopName} SELLER HUB</span>
            </div>
            <h2>Store Operations & Merchant Control</h2>
            <p>
              Manage royal sarees, western collections, inventory alerts, orders, and customer queries in real-time.
            </p>
            <div className="auth-perks-list">
              <div className="perk-item">
                <ShieldCheck size={18} />
                <span>Protected role-based administrative access</span>
              </div>
              <div className="perk-item">
                <ShieldCheck size={18} />
                <span>Real-time MongoDB Atlas data sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-form-side">
          <div className="auth-form-box">
            <div className="auth-form-header">
              <h1 className="auth-main-title">Admin Portal Sign In</h1>
              <p className="auth-subtitle">
                Enter your merchant credentials to access the control panel
              </p>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.88rem'
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>Admin Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Seller Hub</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
              <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
                ← Return to Customer Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
