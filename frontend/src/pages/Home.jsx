import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, Truck, Headset, 
  ArrowRight, CheckCircle2 
} from 'lucide-react';
import { getProfile } from '../services/api';

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        if (!user) setLoading(true);
        const data = await getProfile();
        
        if (isMounted) {
          if (data && (data._id || data.email)) {
            setUser(data);
          } else if (!user) {
            navigate('/login');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch protected profile:', err);
          // Only show session expired if we truly don't have user in state
          if (!user) {
            setError('Session expired or unauthorized. Redirecting to login...');
            setUser(null);
            localStorage.removeItem('shopkart_token');
            setTimeout(() => {
              navigate('/login');
            }, 800);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setUser, user]);

  if (loading) {
    return (
      <div className="loading-wrapper" id="home-loading">
        <div className="spinner"></div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
          Verifying customer session & loading storefront...
        </p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="ecommerce-home-container" id="home-dashboard">
      {/* 1. Logged-in Customer Profile Banner (Lab 02 Required) */}
      <div className="customer-profile-banner" id="customer-profile-banner">
        <div className="profile-banner-left">
          <div className="customer-avatar">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="customer-welcome-text">
              Welcome back, <strong id="user-full-name">{user.fullName || 'Customer'}</strong>! 👋
            </div>
            <div className="customer-meta-info">
              <span id="user-email">✉️ {user.email}</span>
              <span style={{ margin: '0 6px', color: '#93c5fd' }}>•</span>
              <span id="user-phone">📞 {user.phone}</span>
            </div>
          </div>
        </div>
        <div>
          <span className="auth-badge-pill">
            <ShieldCheck size={14} /> Authenticated via /customers/me
          </span>
        </div>
      </div>

      {/* 2. Hero Section (Matching User Reference Image 100%) */}
      <section className="hero-section-light">
        <div className="hero-text-side">
          <h1 className="hero-serif-title">Discover Your Style</h1>
          <p className="hero-subtitle-light">
            Shop the latest trends & exclusive offers
          </p>
          <button 
            className="btn-shop-orange"
            id="btn-hero-shop-now"
            onClick={() => navigate('/products')}
          >
            <span>Shop Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="hero-image-side" onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" 
            alt="Discover Your Style"
            className="hero-img-light"
          />
        </div>
      </section>

      {/* 3. Features Bar (Matching User Reference Image) */}
      <section className="features-bar-light">
        <div className="feature-item-light">
          <Truck size={22} className="feature-icon-light" />
          <span className="feature-title-light">Free Shipping</span>
        </div>

        <div className="feature-divider-light"></div>

        <div className="feature-item-light">
          <ShieldCheck size={22} className="feature-icon-light" />
          <span className="feature-title-light">Secure Checkout</span>
        </div>

        <div className="feature-divider-light"></div>

        <div className="feature-item-light">
          <Headset size={22} className="feature-icon-light" />
          <span className="feature-title-light">24/7 Support</span>
        </div>
      </section>

      {/* 4. Featured Collections (Matching User Reference Image) */}
      <section className="collections-section-light">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="section-serif-title" style={{ margin: 0 }}>Featured Collections</h2>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/products')}
            style={{ fontSize: '0.875rem', padding: '0.4rem 0.85rem' }}
          >
            View All Products →
          </button>
        </div>

        <div className="collections-grid-light">
          {/* Collection 1: Spring Fashion */}
          <div 
            className="collection-item-card" 
            onClick={() => navigate('/products')}
            style={{ cursor: 'pointer' }}
          >
            <div className="collection-img-box">
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" 
                alt="Spring Fashion" 
              />
            </div>
            <h3 className="collection-name">Spring Fashion</h3>
          </div>

          {/* Collection 2: Luxury Watches */}
          <div 
            className="collection-item-card" 
            onClick={() => navigate('/products')}
            style={{ cursor: 'pointer' }}
          >
            <div className="collection-img-box">
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" 
                alt="Luxury Watches" 
              />
            </div>
            <h3 className="collection-name">Electronics & Watches</h3>
          </div>

          {/* Collection 3: Home Essentials */}
          <div 
            className="collection-item-card" 
            onClick={() => navigate('/products')}
            style={{ cursor: 'pointer' }}
          >
            <div className="collection-img-box">
              <img 
                src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80" 
                alt="Home Essentials" 
              />
            </div>
            <h3 className="collection-name">Home Essentials</h3>
          </div>
        </div>
      </section>

      {/* 5. Customer Account Verification Card (Lab 02 Criteria) */}
      <section className="customer-details-box">
        <div className="info-card-header">
          <div className="info-card-icon">
            <User size={18} />
          </div>
          <h3 className="info-card-title">Logged-In Customer Profile — GET /customers/me</h3>
        </div>

        <div className="detail-item">
          <span className="detail-label"><User size={15} /> Customer Name</span>
          <span className="detail-value">{user.fullName || 'N/A'}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label"><Mail size={15} /> Email Address</span>
          <span className="detail-value">{user.email || 'N/A'}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label"><Phone size={15} /> Phone Number</span>
          <span className="detail-value">{user.phone || 'N/A'}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label"><ShieldCheck size={15} /> Authentication</span>
          <span className="badge-status">
            <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Active Customer Session
          </span>
        </div>
      </section>
    </div>
  );
};

export default Home;
