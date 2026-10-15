import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../services/api';

const STATUS_PROGRESSION = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrders();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Could not load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Bonus Challenge: Update status progression demo
  const handleAdvanceStatus = async (orderId, currentStatus) => {
    const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
    const nextStatus =
      currentIndex >= 0 && currentIndex < STATUS_PROGRESSION.length - 1
        ? STATUS_PROGRESSION[currentIndex + 1]
        : STATUS_PROGRESSION[0]; // loop back or stay

    try {
      setUpdatingId(orderId);
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ALL') return true;
    return order.status === filter;
  });

  return (
    <div className="orders-page-container">
      {/* Page Header */}
      <div className="orders-header-row">
        <div>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">
            Track and review your past purchases and delivery status
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="btn-refresh-orders"
          title="Refresh orders"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-bar">
        {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
          <button
            key={st}
            type="button"
            className={`filter-tab-btn ${filter === st ? 'active' : ''}`}
            onClick={() => setFilter(st)}
          >
            {st === 'ALL' ? `All Orders (${orders.length})` : st}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="orders-loading-grid">
          {[1, 2].map((n) => (
            <div key={n} className="order-skeleton-card">
              <div className="skeleton-line shimmer-w-40" />
              <div className="skeleton-line shimmer-w-80" />
              <div className="skeleton-line shimmer-w-60" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="orders-error-card">
          <AlertCircle size={40} className="text-danger" />
          <h3>Unable to Load Orders</h3>
          <p>{error}</p>
          <button type="button" onClick={fetchOrders} className="btn btn-primary">
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="orders-empty-card">
          <div className="empty-cart-icon-wrap">
            <ShoppingBag size={52} className="text-muted" />
          </div>
          <h2>You have not placed any orders yet</h2>
          <p>Explore our catalogue, add your favourite products to cart, and checkout with ease.</p>
          <Link to="/products" className="btn btn-primary">
            <span>Start Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const currentStatusIndex = STATUS_PROGRESSION.indexOf(order.status);

            return (
              <div key={order._id} className="order-card" id={`order-card-${order._id}`}>
                {/* Order Top Bar */}
                <div className="order-card-topbar">
                  <div className="order-meta-group">
                    <span className="order-id-label">Order</span>
                    <span className="order-id-val font-mono">#{order._id}</span>
                    <span className="order-dot">•</span>
                    <span className="order-date-text">
                      <Calendar size={13} />
                      {orderDate}
                    </span>
                  </div>

                  <div className="order-badges-group">
                    <span className={`status-pill pill-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span className={`payment-pill pill-${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Visual Status Progression Tracker */}
                <div className="order-status-tracker">
                  {STATUS_PROGRESSION.map((step, idx) => {
                    const isCompleted =
                      currentStatusIndex >= 0 && idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;

                    return (
                      <React.Fragment key={step}>
                        <div
                          className={`tracker-step ${isCompleted ? 'completed' : ''} ${
                            isCurrent ? 'current' : ''
                          }`}
                        >
                          <div className="tracker-circle">
                            {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                          </div>
                          <span className="tracker-label">{step}</span>
                        </div>
                        {idx < STATUS_PROGRESSION.length - 1 && (
                          <div
                            className={`tracker-bar ${
                              currentStatusIndex > idx ? 'completed' : ''
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Items Preview List */}
                <div className="order-items-preview">
                  {order.items.map((item, i) => (
                    <div key={item._id || i} className="order-item-chip">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'}
                        alt={item.name}
                        className="chip-img"
                      />
                      <div className="chip-details">
                        <span className="chip-name">{item.name}</span>
                        <span className="chip-qty-price">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Actions */}
                <div className="order-card-footer">
                  <div className="order-total-block">
                    <span className="total-label">Total Amount</span>
                    <span className="total-val">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="order-actions-right">
                    {/* Bonus: Advance Status progression demo button */}
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(order._id, order.status)}
                      className="btn-status-demo"
                      title="Bonus: Advance order status progression"
                      disabled={updatingId === order._id}
                    >
                      <Sparkles size={14} />
                      <span>
                        {updatingId === order._id
                          ? 'Updating...'
                          : `Simulate: Next Status`}
                      </span>
                    </button>

                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-view-order-details"
                    >
                      <span>View Details</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
