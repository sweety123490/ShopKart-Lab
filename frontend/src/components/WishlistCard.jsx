import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Package, ShoppingCart, Check, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

/**
 * WishlistCard — Lab 05 Enhanced
 *
 * Displays a saved product with:
 * - Direct "Add to Cart" / "Move to Cart" button powered by global CartContext
 * - View Details
 * - Remove from Wishlist
 */
function WishlistCard({ product, onRemoved }) {
  const navigate = useNavigate();
  const { addToCart, actionLoading, getProductCartQuantity } = useCart();
  const { removeFromWishlist: removeFromWishlistCtx, actionLoading: wishlistActionLoading } = useWishlist();

  const { _id, name, price, category, image, stock } = product;

  const removing = Boolean(wishlistActionLoading?.[_id]);
  const [error, setError] = useState('');

  const isAddingToCart = actionLoading[_id] === 'adding';
  const inCartQty = getProductCartQuantity(_id);
  const isOutOfStock = (stock ?? 0) <= 0;
  const isMaxStockInCart = inCartQty >= stock && stock > 0;

  const handleRemove = async () => {
    if (removing) return;
    setError('');

    try {
      await removeFromWishlistCtx(_id);
      if (onRemoved) onRemoved(_id);
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      setError('Could not remove. Try again.');
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || isOutOfStock || isMaxStockInCart) return;
    await addToCart(_id);
  };

  return (
    <div className="wishlist-card" id={`wishlist-card-${_id}`}>
      {/* Product Image */}
      <div
        className="wishlist-card-img-wrap"
        onClick={() => navigate(`/products/${_id}`)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500'}
          alt={name || 'Product'}
          className="wishlist-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500';
          }}
        />

        {/* Floating Quick Remove Button (always visible on top right of image) */}
        <button
          className={`wishlist-float-remove-btn ${removing ? 'is-removing' : ''}`}
          id={`wishlist-float-remove-${_id}`}
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          disabled={removing}
          title={`Remove ${name || 'item'} from wishlist`}
          aria-label={`Remove ${name || 'item'} from wishlist`}
        >
          {removing ? (
            <span className="btn-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
          ) : (
            <Trash2 size={16} />
          )}
        </button>

        {stock === 0 ? (
          <span className="out-of-stock-badge">Out of Stock</span>
        ) : stock <= 5 ? (
          <span className="low-stock-badge">Only {stock} left!</span>
        ) : null}

        {/* In-cart count badge */}
        {inCartQty > 0 && (
          <span className="in-cart-indicator-badge" title={`${inCartQty} in cart`}>
            {inCartQty} in cart
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="wishlist-card-body">
        <span className="product-category">{category || 'General'}</span>

        <h3
          className="product-name"
          title={name}
          onClick={() => navigate(`/products/${_id}`)}
          style={{ cursor: 'pointer' }}
        >
          {name || 'Unnamed Product'}
        </h3>

        <p className="product-price">₹{(price ?? 0).toLocaleString('en-IN')}</p>

        <div className="wishlist-stock-row">
          <Package size={14} />
          <span className={stock > 0 ? 'stock-ok' : 'stock-out'}>
            {stock > 0 ? `${stock} units left` : 'Out of stock'}
          </span>
        </div>

        {/* Error feedback */}
        {error && (
          <p className="wishlist-error-msg" role="alert">
            {error}
          </p>
        )}

        {/* Action Buttons: Add to Cart + Details + Remove */}
        <div className="wishlist-card-actions">
          <button
            className={`btn btn-cart-action ${inCartQty > 0 ? 'btn-in-cart' : 'btn-primary'}`}
            id={`wishlist-add-cart-${_id}`}
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock || isMaxStockInCart}
            title={isOutOfStock ? 'Out of stock' : isMaxStockInCart ? 'Max in cart' : 'Add to cart'}
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
                <Plus size={14} />
                <span>Add Another ({inCartQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <div className="wishlist-secondary-actions">
            <button
              className="btn btn-secondary btn-details"
              id={`wishlist-view-${_id}`}
              onClick={() => navigate(`/products/${_id}`)}
              title="View Details"
            >
              <Eye size={15} />
              <span>Details</span>
            </button>

            <button
              className={`btn btn-remove-wishlist ${removing ? 'btn-removing' : ''}`}
              id={`wishlist-remove-${_id}`}
              onClick={handleRemove}
              disabled={removing}
              title={`Remove ${name || 'item'} from wishlist`}
              aria-label={`Remove ${name || 'item'} from wishlist`}
            >
              {removing ? (
                <>
                  <span className="btn-spinner" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  <span>Remove</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;
