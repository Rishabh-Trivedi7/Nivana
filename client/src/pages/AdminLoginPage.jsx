import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const { login, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(form);
      const role = res?.data?.user?.role;
      if (role !== 'admin') {
        await logout();
        setApiError('Access restricted. This portal is for admin accounts only.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Left decorative panel */}
      <div className="admin-login-page__brand">
        <div className="admin-login-page__brand-content">
          <Link to="/" className="admin-login-page__logo">
            <span className="admin-login-page__logo-icon">◆</span>
            Nivana
          </Link>
          <div className="admin-login-page__brand-tagline">
            <h1 className="admin-login-page__brand-title">
              Admin<br /><span>Control Panel</span>
            </h1>
            <p className="admin-login-page__brand-text">
              Manage properties, bookings, and users from one centralized dashboard.
            </p>
          </div>
          <div className="admin-login-page__brand-decoration" aria-hidden="true">
            <div className="admin-login-page__diamond admin-login-page__diamond--1">◆</div>
            <div className="admin-login-page__diamond admin-login-page__diamond--2">◆</div>
            <div className="admin-login-page__diamond admin-login-page__diamond--3">◆</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="admin-login-page__form-panel">
        <div className="admin-login-page__form-wrap">
          <div className="admin-login-page__form-header">
            <span className="admin-login-page__form-badge">Administrator Access</span>
            <h2 className="admin-login-page__form-title">Welcome back</h2>
            <p className="admin-login-page__form-subtitle">
              Sign in with your admin credentials to access the dashboard.
            </p>
          </div>

          {apiError && (
            <div className="admin-login-page__error" role="alert">
              <span className="admin-login-page__error-icon">⚠</span>
              {apiError}
            </div>
          )}

          <form className="admin-login-page__form" onSubmit={handleSubmit} noValidate>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                className={`admin-form-input${errors.email ? ' admin-form-input--error' : ''}`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="admin@nivana.com"
              />
              {errors.email && <span className="admin-form-error">{errors.email}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className={`admin-form-input${errors.password ? ' admin-form-input--error' : ''}`}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="••••••••"
              />
              {errors.password && <span className="admin-form-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="admin-login-page__submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="admin-login-page__spinner" aria-hidden="true" />
              ) : null}
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="admin-login-page__footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/admin/register" className="admin-login-page__back-link">
              Don't have an admin account? Register here →
            </Link>
            <Link to="/login" className="admin-login-page__back-link">
              ← Back to user login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
