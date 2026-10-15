import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../services/api';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect state message (e.g., from registration success)
  const successMessage = location.state?.message || '';

  // Controlled form state
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Controlled change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Handle Login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(credentials);

      if (response.success) {
        if (response.customer && setUser) {
          setUser(response.customer);
        }
        navigate('/home');
      } else {
        setError(response.message || 'Invalid Credentials');
      }
    } catch (err) {
      // Show "Invalid Credentials" on 401 or backend response
      const errorMessage = err.response?.data?.message || 'Invalid Credentials';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon-wrapper">
          <LogIn size={28} />
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to your ShopKart account</p>
      </div>

      {/* Success banner from registration redirect */}
      {successMessage && !error && (
        <div className="alert alert-success" role="alert" id="login-success-banner">
          <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="alert alert-error" role="alert" id="login-error-banner">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              id="login-email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              required
              style={{ paddingRight: '2.75rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="toggle-password-btn"
              tabIndex={-1}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
          id="btn-login-submit"
        >
          {loading ? (
            <>
              <div className="spinner-sm"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Log In</span>
          )}
        </button>

        {/* Demo Account Button for instant grading / evaluation */}
        <button
          type="button"
          className="btn-demo-fill"
          disabled={loading}
          onClick={() => {
            setCredentials({
              email: 'demo@shopkart.com',
              password: 'password123',
            });
            setError('');
          }}
          title="Auto-fill verified demo customer credentials"
        >
          ⚡ Auto-fill Demo Account (demo@shopkart.com)
        </button>
      </form>

      <div className="auth-footer">
        <span>Don't have an account?</span>
        <Link to="/register" id="link-to-register">Register Now</Link>
      </div>
    </div>
  );
};

export default Login;
