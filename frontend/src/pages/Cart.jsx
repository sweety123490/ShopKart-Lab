import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Tag,
  CheckCircle2,
  Trash,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

function Cart({ user }) {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    totalItems,
    subtotal,
    shippingFee,
    clearUserCart,
    refreshCart,
  } = useCart();

  // Interactive coupon discount state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');


  // Apply promo code (bonus delight)
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'SHOPKART10' || code === 'SAVE10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code, discount, percent: 10 });
    } else if (code === 'WELCOME50' && subtotal >= 500) {
      setAppliedCoupon({ code, discount: 50, percent: 0 });
    } else {
      setCouponError('Invalid coupon code. Try SHOPKART10');
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalPayable = Math.max(0, subtotal - discountAmount + shippingFee);

  // ─── 1. Loading State (Task 17) ───────────────────────────────────────────
  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="cart-state-box loading-state-box" id="cart-loading-state">
          <div className="cart-spinner-glow">
            <div className="spinner" />
          </div>
          <h2 className="state-title">Loading your cart...</h2>
          <p className="state-subtitle">Retrieving your saved items and checking latest stock</p>
        </div>
      </div>
    );
  }

  // ─── 2. Error State (Task 17) ─────────────────────────────────────────────
  if (error && cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="cart-state-box error-state-box" id="cart-error-state">
          <div className="state-icon-circle error-circle">⚠️</div>
          <h2 className="state-title">Unable to load your cart.</h2>
          <p className="state-subtitle">{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-retry"
            id="cart-retry-btn"
            onClick={refreshCart}
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── 3. Empty State (Task 17) ─────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="cart-state-box empty-state-box" id="cart-empty-state">
          <div className="empty-cart-illustration">
            <div className="empty-cart-bubble">
              <ShoppingBag size={52} strokeWidth={1.5} />
            </div>
            <div className="sparkle-dot sparkle-1" />
            <div className="sparkle-dot sparkle-2" />
          </div>

          <h2 className="state-title">Your cart is empty 🛒</h2>
          <p className="state-subtitle">
            Looks like you haven't added anything yet. Explore our curated collections and discover great deals!
          </p>

          <Link
            to="/products"
            className="btn btn-primary btn-browse-products"
            id="browse-products-btn"
          >
            <span>Browse Products</span>
            <ArrowRight size={18} />
          </Link>

          {/* Quick recommendations preview links */}
          <div className="empty-cart-categories">
            <span>Popular categories:</span>
            <Link to="/products?category=Electronics" className="cat-chip">Electronics</Link>
            <Link to="/products?category=Fashion" className="cat-chip">Fashion</Link>
            <Link to="/products?category=Books" className="cat-chip">Books</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 4. Main Cart UI (Task 8 & 13) ────────────────────────────────────────
  return (
    <div className="cart-page-container" id="cart-page">
      {/* Page Title & Breadcrumbs */}
      <div className="cart-header-row">
        <div>
          <h1 className="cart-page-title">
            My Cart <span className="cart-title-count">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
          </h1>
          <p className="cart-page-subtitle">Review your items, adjust quantities, and proceed to checkout.</p>
        </div>

        <div className="cart-header-actions">
          <button
            type="button"
            className="btn-clear-cart"
            onClick={clearUserCart}
            title="Clear all items in cart"
          >
            <Trash size={14} />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      <div className="cart-grid-layout">
        {/* Left Column: Cart Items List */}
        <section className="cart-items-section" aria-label="Shopping Cart Items">
          <div className="cart-items-header-bar">
            <span>Product Details</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem key={item.product?._id || item._id} item={item} />
            ))}
          </div>

          {/* Free shipping banner */}
          <div className="cart-shipping-banner">
            <Truck size={20} className="banner-icon" />
            <div>
              {subtotal >= 999 ? (
                <span className="free-shipping-active">
                  🎉 Congratulations! You unlocked <strong>FREE Standard Delivery</strong>.
                </span>
              ) : (
                <span>
                  Add items worth <strong>₹{(999 - subtotal).toLocaleString('en-IN')}</strong> more to get <strong>FREE Delivery</strong>!
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Order Summary (Task 8 & 15) */}
        <aside className="order-summary-sidebar" aria-label="Order Summary">
          <div className="order-summary-card">
            <h2 className="summary-card-title">Order Summary</h2>

            {/* Price Breakdown */}
            <div className="summary-breakdown">
              <div className="summary-row">
                <span className="row-label">Total Items</span>
                <span className="row-value" id="summary-items-count">{totalItems} units</span>
              </div>

              <div className="summary-row">
                <span className="row-label">Subtotal</span>
                <span className="row-value" id="summary-subtotal">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedCoupon && (
                <div className="summary-row discount-row">
                  <span className="row-label">
                    Discount ({appliedCoupon.code})
                  </span>
                  <span className="row-value text-discount" id="summary-discount">
                    -₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="summary-row">
                <span className="row-label">Delivery Fee</span>
                <span className="row-value" id="summary-shipping">
                  {shippingFee === 0 ? (
                    <span className="free-tag">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="summary-divider" />

              {/* Grand Total */}
              <div className="summary-row summary-grand-total">
                <span className="total-label">Total Amount</span>
                <span className="total-value" id="summary-total">₹{finalPayable.toLocaleString('en-IN')}</span>
              </div>

              <p className="tax-inclusive-note">Inclusive of all applicable GST & taxes</p>
            </div>

            {/* Promo Code Input */}
            <form className="coupon-box" onSubmit={handleApplyCoupon}>
              <div className="coupon-input-wrap">
                <Tag size={16} className="coupon-icon" />
                <input
                  type="text"
                  placeholder="Promo Code (e.g. SHOPKART10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button type="submit" className="btn-coupon-apply">
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <div className="coupon-success-pill">
                  <CheckCircle2 size={13} />
                  <span>Code <strong>{appliedCoupon.code}</strong> applied (-₹{discountAmount})</span>
                </div>
              )}
              {couponError && <p className="coupon-error-text">{couponError}</p>}
            </form>

            {/* Proceed to Checkout Button */}
            <button
              type="button"
              className="btn btn-primary btn-checkout"
              id="proceed-to-checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <Link to="/products" className="continue-shopping-link">
              Continue Shopping
            </Link>

            {/* Trust & Guarantee Badges */}
            <div className="trust-features-list">
              <div className="trust-feature-item">
                <ShieldCheck size={16} className="trust-icon" />
                <span>100% Secure & Encrypted Payments</span>
              </div>
              <div className="trust-feature-item">
                <RotateCcw size={16} className="trust-icon" />
                <span>7-Day Easy Return & Refund Guarantee</span>
              </div>
              <div className="trust-feature-item">
                <Sparkles size={16} className="trust-icon" />
                <span>Quality Tested & Verified Products</span>
              </div>
            </div>
          </div>
        </aside>
      </div>


    </div>
  );
}

export default Cart;
