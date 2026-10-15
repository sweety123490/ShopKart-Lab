import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../services/api';

const Register = ({ setUser }) => {
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await registerUser(formData);

      if (response.success) {
        if (response.customer && setUser) {
          setUser(response.customer);
          navigate('/products');
        } else {
          navigate('/login', {
            state: { message: 'Account created successfully! Please log in.' },
          });
        }
      } else {
        setApiError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to connect to server. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon-wrapper">
          <UserPlus size={28} />
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join ShopKart today and start shopping</p>
      </div>

      {apiError && (
        <div className="alert alert-error" role="alert" id="register-api-error">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          {errors.fullName && (
            <span className="field-error-text">
              <AlertCircle size={13} /> {errors.fullName}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          {errors.email && (
            <span className="field-error-text">
              <AlertCircle size={13} /> {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
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
          {errors.password && (
            <span className="field-error-text">
              <AlertCircle size={13} /> {errors.password}
            </span>
          )}
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number</label>
          <div className="input-wrapper">
            <Phone className="input-icon" size={18} />
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          {errors.phone && (
            <span className="field-error-text">
              <AlertCircle size={13} /> {errors.phone}
            </span>
          )}
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
          id="btn-register-submit"
        >
          {loading ? (
            <>
              <div className="spinner-sm"></div>
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <span>Already have an account?</span>
        <Link to="/login" id="link-to-login">Log In</Link>
      </div>
    </div>
  );
};

export default Register;
