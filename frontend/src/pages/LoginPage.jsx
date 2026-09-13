import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('priyanka.sharma@example.com');
    setPassword('Customer@123');
    setError(null);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Left Side: Brand Visual */}
        <div className="auth-visual-side">
          <div className="auth-visual-content">
            <div className="brand-badge-light">
              <Sparkles size={16} />
              <span>SARAVANA PRIVILEGE CLUB</span>
            </div>
            <h2>Grace, Heritage & Modern Elegance</h2>
            <p>
              Sign in to unlock personalized bridal recommendations, track your courier shipments, and access member-only festive sales.
            </p>
            <div className="auth-perks-list">
              <div className="perk-item">
                <ShieldCheck size={18} />
                <span>Express doorstep delivery and easy 7-day returns</span>
              </div>
              <div className="perk-item">
                <ShieldCheck size={18} />
                <span>Earn loyalty coins on every silk saree purchase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="auth-form-side">
          <div className="auth-form-box">
            <div className="auth-form-header">
              <h1 className="auth-main-title">Welcome Back</h1>
              <p className="auth-subtitle">
                Enter your credentials to access your Saravana Women Dresses account
              </p>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '18px',
                  fontSize: '0.88rem'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* One-Click Demo Login */}
            <button type="button" className="btn-demo-login" onClick={handleDemoLogin}>
              <Sparkles size={16} color="#D4AF37" />
              <span>One-Click Demo Fill (Priyanka Sharma)</span>
            </button>

            <div className="auth-divider">
              <span>or sign in with email</span>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-link">
                  <label>Password</label>
                  <span
                    className="forgot-password-link"
                    onClick={() => alert('Password reset link has been dispatched to your email address.')}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-remember-row">
                <label className="checkbox-remember">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch-footer">
              <span>Don't have an account yet?</span>
              <Link to="/register" className="auth-switch-link">
                Create New Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
