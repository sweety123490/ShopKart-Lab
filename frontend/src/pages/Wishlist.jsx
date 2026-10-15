import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import WishlistCard from '../components/WishlistCard';

/**
 * Wishlist Page — Lab 04 (Task 6, 7)
 */
function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, loading, error, refreshWishlist } = useWishlist();

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // ─── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="wishlist-state-container" id="wishlist-loading">
        <div className="wishlist-spinner-wrap">
          <div className="spinner" />
          <p className="state-text">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="wishlist-state-container error-state" id="wishlist-error">
        <div className="wishlist-error-icon">
          <AlertCircle size={56} />
        </div>
        <h2 className="wishlist-state-title">Something went wrong</h2>
        <p className="wishlist-state-desc">We couldn't load your wishlist.</p>
        <button
          className="btn btn-primary"
          id="wishlist-retry-btn"
          onClick={fetchWishlist}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────────────────
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-state-container empty-state" id="wishlist-empty">
        <div className="wishlist-empty-icon">
          <Heart size={72} strokeWidth={1.5} />
        </div>
        <h2 className="wishlist-state-title">Your wishlist is empty</h2>
        <p className="wishlist-state-desc">
          Save products you love and find them here later.
        </p>
        <button
          className="btn btn-primary btn-large"
          id="wishlist-browse-btn"
          onClick={() => navigate('/products')}
        >
          <ShoppingBag size={18} />
          Browse Products
        </button>
      </div>
    );
  }

  // ─── Wishlist Grid ────────────────────────────────────────────────────────────
  return (
    <div className="wishlist-page" id="wishlist-page">
      {/* Page Header */}
      <div className="wishlist-header">
        <div className="wishlist-header-left">
          <div className="wishlist-header-icon">
            <Heart size={22} fill="currentColor" />
          </div>
          <div>
            <h1 className="wishlist-title">My Wishlist</h1>
            <p className="wishlist-subtitle" id="wishlist-count">
              {/* Bonus: count displayed dynamically from backend data */}
              {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
            </p>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/products')}
          id="continue-shopping-btn"
        >
          <ShoppingBag size={15} />
          Continue Shopping
        </button>
      </div>

      {/* Product Grid — rendered dynamically from API data */}
      <div className="wishlist-grid" id="wishlist-grid">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
