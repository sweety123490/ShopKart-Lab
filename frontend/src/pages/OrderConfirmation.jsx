import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Printer,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { getOrderById } from '../services/api';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderById(id);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError('Could not retrieve order details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="order-confirm-page">
        <div className="order-confirm-loading">
          <Loader2 size={36} className="spinner-icon text-primary" />
          <p>Confirming your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirm-page">
        <div className="order-confirm-card text-center">
          <div className="status-icon-wrap failed">
            <Package size={36} />
          </div>
          <h2>Order Not Found</h2>
          <p>{error || 'We could not locate this order.'}</p>
          <div className="confirm-actions">
            <Link to="/orders" className="btn btn-primary">
              View My Orders
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="order-confirm-page">
      <div className="order-confirm-card">
        {/* Celebration Header */}
        <div className="confirm-hero-section">
          <div className="success-badge-circle">
            <CheckCircle2 size={44} className="success-check-icon" />
          </div>
          <span className="celebration-pill">Payment Verified</span>
          <h1 className="confirm-main-title">Order Placed Successfully!</h1>
          <p className="confirm-subtitle">
            Thank you for shopping with ShopKart. Your order has been placed and payment has been verified.
          </p>

          <div className="order-key-info-bar">
            <div className="key-info-col">
              <span className="info-label">Order Reference ID</span>
              <span className="info-val font-mono" id="confirm-order-id">{order._id}</span>
            </div>
            <div className="key-info-col">
              <span className="info-label">Order Date</span>
              <span className="info-val">{formattedDate}</span>
            </div>
            <div className="key-info-col">
              <span className="info-label">Payment Status</span>
              <span className="info-badge badge-paid" id="confirm-payment-status">{order.paymentStatus}</span>
            </div>
            <div className="key-info-col">
              <span className="info-label">Order Status</span>
              <span className="info-badge badge-placed" id="confirm-order-status">{order.status}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Details: Items Snapshot & Delivery */}
        <div className="confirm-details-grid">
          {/* Purchased Items Snapshot */}
          <div className="confirm-section items-snapshot-section">
            <div className="section-head">
              <Package size={18} className="text-primary" />
              <h3>Purchased Items ({order.items.length})</h3>
            </div>

            <div className="snapshot-items-list">
              {order.items.map((item, index) => (
                <div key={item._id || index} className="snapshot-item-row">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'}
                    alt={item.name}
                    className="snapshot-img"
                  />
                  <div className="snapshot-info">
                    <span className="snapshot-name">{item.name}</span>
                    <span className="snapshot-qty">Qty: {item.quantity}</span>
                  </div>
                  <div className="snapshot-price">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    <span className="snapshot-unit-price">
                      (₹{item.price.toLocaleString('en-IN')} each)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="snapshot-total-box">
              <div className="snapshot-row">
                <span>Items Total</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="snapshot-row">
                <span>Shipping</span>
                <span className="text-emerald font-semibold">FREE</span>
              </div>
              <div className="snapshot-divider" />
              <div className="snapshot-row total-paid">
                <span>Total Paid</span>
                <span className="total-amount-highlight" id="confirm-total-amount">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Information */}
          <div className="confirm-section delivery-payment-section">
            <div className="section-head">
              <MapPin size={18} className="text-primary" />
              <h3>Delivery Address</h3>
            </div>

            <div className="shipping-address-card">
              <strong className="recipient-name">{order.shippingAddress?.fullName}</strong>
              <p className="addr-line">{order.shippingAddress?.addressLine1}</p>
              <p className="addr-city">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="addr-phone">Phone: {order.shippingAddress?.phone}</p>
            </div>

            <div className="section-head mt-4">
              <CreditCard size={18} className="text-primary" />
              <h3>Payment & Transaction</h3>
            </div>

            <div className="payment-receipt-card">
              <div className="receipt-row">
                <span>Gateway</span>
                <span>Razorpay Standard Checkout (Test Mode)</span>
              </div>
              {order.razorpayOrderId && (
                <div className="receipt-row">
                  <span>Razorpay Order ID</span>
                  <span className="font-mono">{order.razorpayOrderId}</span>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div className="receipt-row">
                  <span>Payment Transaction ID</span>
                  <span className="font-mono">{order.razorpayPaymentId}</span>
                </div>
              )}
              <div className="receipt-row">
                <span>Signature Verification</span>
                <span className="text-emerald font-semibold flex-center">
                  <ShieldCheck size={14} style={{ marginRight: 4 }} /> HMAC SHA256 Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirm-footer-actions">
          <Link to="/orders" className="btn btn-primary" id="view-my-orders-btn">
            <span>View My Orders</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn btn-secondary">
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
          <button type="button" onClick={handlePrint} className="btn-icon-secondary" title="Print Receipt">
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
