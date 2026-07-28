import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './AdminLoginPage.css';

export default function AdminRegisterPage() {
  const { register, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: 'admin',
      });
      navigate('/admin', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Registration failed');
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
              Admin<br /><span>Registration</span>
            </h1>
            <p className="admin-login-page__brand-text">
              Create an administrator account to list properties, manage bookings, and view users.
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
            <span className="admin-login-page__form-badge">Administrator Portal</span>
            <h2 className="admin-login-page__form-title">Create Admin Account</h2>
            <p className="admin-login-page__form-subtitle">
              Register as an administrator to access the control panel.
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
              <label className="admin-form-label" htmlFor="admin-fullName">Full Name</label>
              <input
                id="admin-fullName"
                className={`admin-form-input${errors.fullName ? ' admin-form-input--error' : ''}`}
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Admin Name"
              />
              {errors.fullName && <span className="admin-form-error">{errors.fullName}</span>}
            </div>

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
                autoComplete="new-password"
                placeholder="••••••••"
              />
              {errors.password && <span className="admin-form-error">{errors.password}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-confirmPassword">Confirm Password</label>
              <input
                id="admin-confirmPassword"
                className={`admin-form-input${errors.confirmPassword ? ' admin-form-input--error' : ''}`}
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <span className="admin-form-error">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="admin-login-page__submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="admin-login-page__spinner" aria-hidden="true" />
              ) : null}
              {loading ? 'Registering...' : 'Register Admin Account'}
            </button>
          </form>

          <div className="admin-login-page__footer">
            <Link to="/admin/login" className="admin-login-page__back-link">
              Already have an admin account? Sign in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
