import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getOrderById } from '../services/api';

const OrderDetails = () => {
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

  if (loading) {
    return (
      <div className="order-details-container">
        <div className="loading-wrapper" style={{ minHeight: '50vh' }}>
          <Loader2 size={36} className="spinner-icon text-primary" />
          <p>Loading order #{id}...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-container">
        <div className="orders-error-card">
          <AlertCircle size={40} className="text-danger" />
          <h3>Order Not Found or Access Denied</h3>
          <p>{error || 'You do not have permission to view this order.'}</p>
          <Link to="/orders" className="btn btn-primary">
            Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="order-details-container">
      {/* Top Navigation */}
      <div className="order-details-nav">
        <Link to="/orders" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to All Orders</span>
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-print-invoice"
          title="Print official invoice receipt"
        >
          <Printer size={16} />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* Main Order Card */}
      <div className="order-details-card">
        {/* Header Strip */}
        <div className="details-header-strip">
          <div>
            <div className="order-id-badge">Order #{order._id}</div>
            <div className="order-placed-on">Placed on {orderDate}</div>
          </div>
          <div className="order-badges-wrap">
            <span className={`status-pill pill-${order.status?.toLowerCase()}`}>
              {order.status}
            </span>
            <span className={`payment-pill pill-${order.paymentStatus?.toLowerCase()}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="details-grid">
          {/* Left Column: Items */}
          <div className="details-left">
            <div className="details-section-title">
              <Package size={18} />
              <span>Purchased Items ({order.items.length})</span>
            </div>

            <div className="details-items-table">
              {order.items.map((item, index) => (
                <div key={item._id || index} className="details-item-row">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'}
                    alt={item.name}
                    className="item-row-img"
                  />
                  <div className="item-row-info">
                    <span className="item-row-name">{item.name}</span>
                    <span className="item-row-snapshot-price">
                      Snapshot Price: ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="item-row-qty">Qty: {item.quantity}</div>
                  <div className="item-row-total">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Price Breakdown */}
            <div className="details-price-box">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-row">
                <span>Delivery</span>
                <span className="text-emerald">FREE</span>
              </div>
              <div className="price-divider" />
              <div className="price-row grand-total">
                <span>Total Amount Paid</span>
                <span className="price-val">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Shipping & Payment Metadata */}
          <div className="details-right">
            {/* Shipping Address */}
            <div className="details-box">
              <div className="box-title">
                <MapPin size={18} />
                <span>Shipping Address</span>
              </div>
              <div className="box-content">
                <strong>{order.shippingAddress?.fullName}</strong>
                <p>{order.shippingAddress?.addressLine1}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                  {order.shippingAddress?.pincode}
                </p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="details-box">
              <div className="box-title">
                <CreditCard size={18} />
                <span>Payment Details</span>
              </div>
              <div className="box-content font-mono-details">
                <div className="detail-line">
                  <span className="d-label">Gateway:</span>
                  <span className="d-val">Razorpay Standard</span>
                </div>
                {order.razorpayOrderId && (
                  <div className="detail-line">
                    <span className="d-label">Razorpay Order:</span>
                    <span className="d-val font-mono">{order.razorpayOrderId}</span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div className="detail-line">
                    <span className="d-label">Payment ID:</span>
                    <span className="d-val font-mono">{order.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="detail-line">
                  <span className="d-label">Verification:</span>
                  <span className="d-val text-emerald">
                    <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
                    HMAC SHA256 Signature Validated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
