import React from 'react';
import { ShieldCheck, Truck, Lock, ArrowRight, Loader2, CreditCard } from 'lucide-react';

const OrderSummary = ({
  cartItems,
  subtotal,
  shippingFee,
  grandTotal,
  totalItems,
  onPlaceOrder,
  loading,
}) => {
  return (
    <aside className="checkout-summary-card" aria-label="Order Checkout Summary">
      <div className="summary-header">
        <h3 className="summary-title">Order Review</h3>
        <span className="summary-badge">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      </div>

      {/* Cart Items Miniature Review */}
      <div className="checkout-items-list">
        {cartItems.map((item) => {
          const product = item.product || {};
          const itemTotal = (product.price || 0) * (item.quantity || 1);

          return (
            <div key={product._id || item._id} className="checkout-item-row">
              <div className="item-thumbnail-wrap">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'}
                  alt={product.name}
                  className="item-thumbnail"
                />
                <span className="item-qty-pill">{item.quantity}</span>
              </div>
              <div className="item-info">
                <h4 className="item-name" title={product.name}>{product.name}</h4>
                <div className="item-meta">
                  <span className="item-price">₹{(product.price || 0).toLocaleString('en-IN')} × {item.quantity}</span>
                </div>
              </div>
              <div className="item-total-col">
                ₹{itemTotal.toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Calculations */}
      <div className="summary-pricing-table">
        <div className="pricing-row">
          <span className="pricing-label">Items Subtotal</span>
          <span className="pricing-value" id="checkout-subtotal">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="pricing-row">
          <span className="pricing-label">Shipping & Handling</span>
          <span className="pricing-value" id="checkout-shipping">
            {shippingFee === 0 ? (
              <span className="free-shipping-tag">FREE</span>
            ) : (
              `₹${shippingFee}`
            )}
          </span>
        </div>

        <div className="pricing-divider" />

        <div className="pricing-row grand-total-row">
          <span className="total-label">Final Amount</span>
          <span className="total-value" id="checkout-grand-total">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
        <p className="taxes-note">Inclusive of all taxes & Razorpay secure checkout fee</p>
      </div>

      {/* Place Order CTA Button */}
      <button
        type="button"
        id="place-order-btn"
        className="btn-place-order"
        onClick={onPlaceOrder}
        disabled={loading || cartItems.length === 0}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="spinner-icon" />
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <CreditCard size={18} />
            <span>Pay ₹{grandTotal.toLocaleString('en-IN')} with Razorpay</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Trust & Compliance Signals */}
      <div className="checkout-trust-signals">
        <div className="trust-pill">
          <ShieldCheck size={16} className="text-emerald" />
          <span>Razorpay Test Mode Active</span>
        </div>
        <div className="trust-pill">
          <Lock size={16} className="text-primary" />
          <span>HMAC SHA256 Verified</span>
        </div>
        <div className="trust-pill">
          <Truck size={16} className="text-amber" />
          <span>Express Delivery (2-3 Days)</span>
        </div>
      </div>
    </aside>
  );
};

export default OrderSummary;
