import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Plus, Star } from 'lucide-react';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

/**
 * ProductCard — Luxury Lab 05 enhanced version
 */
function ProductCard({ product, initialSaved = false }) {
  const navigate = useNavigate();
  const { addToCart, actionLoading, getProductCartQuantity } = useCart();
  const { isWishlisted, toggleWishlist: toggleWishlistCtx, actionLoading: wishlistActionLoading } = useWishlist();

  const { _id, name, price, category, image, stock } = product;

  // Rating representation (deterministic based on id for consistency)
  const ratingScore = 4.7 + ((_id ? _id.charCodeAt(0) : 0) % 3) * 0.1;
  const ratingCount = 45 + ((_id ? _id.charCodeAt(1) : 0) % 85);

  // ─── Wishlist State from Global Context ─────────────────────────────────────
  const isSaved = isWishlisted(_id);
  const isSaving = Boolean(wishlistActionLoading?.[_id]);
  const [wishlistError, setWishlistError] = useState('');

  // ─── Cart State (Task 7) ─────────────────────────────────────────────────────
  const isAddingToCart = actionLoading[_id] === 'adding';
  const inCartQty = getProductCartQuantity(_id);
  const isOutOfStock = (stock ?? 0) <= 0;
  const isMaxStockInCart = inCartQty >= stock && stock > 0;

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (isSaving) return;

    setWishlistError('');

    try {
      const res = await toggleWishlistCtx(_id, product);
      if (res?.requireAuth) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      setWishlistError('Unable to update wishlist. Try again.');
    }
  };

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();
    if (isAddingToCart || isOutOfStock || isMaxStockInCart) return;

    const res = await addToCart(_id);
    if (res?.requireAuth) {
      navigate('/login');
    }
  };

  return (
    <div className="product-card-luxury" id={`product-card-${_id}`}>
      {/* Product Image Wrap with Glow */}
      <div
        className="product-card-img-wrap"
        onClick={() => navigate(`/products/${_id}`)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500'}
          alt={name || 'Product'}
          className="product-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500';
          }}
        />

        {/* Floating Stock Badges */}
        {isOutOfStock ? (
          <span className="stock-pill pill-out">Out of Stock</span>
        ) : stock <= 5 ? (
          <span className="stock-pill pill-low">Only {stock} left!</span>
        ) : (
          <span className="stock-pill pill-in">In Stock</span>
        )}

        {/* In-Cart floating count pill */}
        {inCartQty > 0 && (
          <span className="in-cart-indicator-badge" title={`${inCartQty} in your cart`}>
            {inCartQty} in cart
          </span>
        )}

        {/* Wishlist Heart Overlay */}
        <button
          className={`wishlist-heart-btn ${isSaved ? 'is-saved' : ''}`}
          id={`wishlist-heart-${_id}`}
          onClick={handleWishlistToggle}
          disabled={isSaving}
          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            size={18}
            fill={isSaved ? 'currentColor' : 'none'}
            strokeWidth={2.2}
          />
        </button>
      </div>

      {/* Card Details Body */}
      <div className="product-card-body">
        <div className="product-meta-row">
          <span className="product-category-chip">{category || 'General'}</span>
          <div className="rating-mini-badge" title={`${ratingScore.toFixed(1)} rating`}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span>{ratingScore.toFixed(1)}</span>
            <span className="rating-count-muted">({ratingCount})</span>
          </div>
        </div>

        <h3
          className="product-name"
          title={name}
          onClick={() => navigate(`/products/${_id}`)}
          style={{ cursor: 'pointer' }}
        >
          {name || 'Unnamed Product'}
        </h3>

        <div className="product-pricing-row">
          <span className="product-price-current">
            ₹{(price ?? 0).toLocaleString('en-IN')}
          </span>
          {price > 1500 && (
            <span className="product-price-original">
              ₹{Math.round(price * 1.25).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Wishlist Error message */}
        {wishlistError && (
          <p className="wishlist-error-msg" role="alert">
            {wishlistError}
          </p>
        )}

        {/* Action Buttons: Add to Cart & Quick View */}
        <div className="product-card-actions">
          <button
            className={`btn btn-cart-action ${inCartQty > 0 ? 'btn-in-cart' : 'btn-primary'}`}
            id={`add-to-cart-${_id}`}
            onClick={handleAddToCartClick}
            disabled={isAddingToCart || isOutOfStock || isMaxStockInCart}
            title={
              isOutOfStock
                ? 'Out of stock'
                : isMaxStockInCart
                ? 'Max stock reached'
                : inCartQty > 0
                ? 'Add another unit'
                : 'Add to cart'
            }
          >
            {isAddingToCart ? (
              <>
                <span className="btn-spinner" />
                <span>Adding...</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isMaxStockInCart ? (
              <span>Max in Cart</span>
            ) : inCartQty > 0 ? (
              <>
                <Plus size={15} />
                <span>Add Another ({inCartQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            className="btn btn-secondary btn-icon-only"
            id={`view-details-${_id}`}
            onClick={() => navigate(`/products/${_id}`)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
