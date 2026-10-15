import React, { useState } from 'react';
import { Trash2, Plus, Minus, AlertTriangle, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { addToWishlist } from '../services/api';
import { Link } from 'react-router-dom';

function CartItem({ item }) {
  const { updateQuantity, removeFromCart, actionLoading, showToast } = useCart();

  const product = item?.product;
  const quantity = item?.quantity || 1;

  const [savingWishlist, setSavingWishlist] = useState(false);
  const [savedWishlist, setSavedWishlist] = useState(false);

  if (!product) return null;

  const { _id, name, price, image, stock, category } = product;
  const itemLoading = actionLoading[_id];
  const isUpdating = itemLoading === 'updating';
  const isRemoving = itemLoading === 'removing';

  const isAtMaxStock = quantity >= stock;
  const isAtMinQuantity = quantity <= 1;

  const handleIncrement = () => {
    if (isAtMaxStock || isUpdating || isRemoving) return;
    updateQuantity(_id, quantity + 1);
  };

  const handleDecrement = () => {
    if (isAtMinQuantity || isUpdating || isRemoving) return;
    updateQuantity(_id, quantity - 1);
  };

  const handleRemove = () => {
    if (isRemoving) return;
    removeFromCart(_id);
  };

  const handleSaveToWishlist = async () => {
    if (savingWishlist) return;
    setSavingWishlist(true);
    try {
      await addToWishlist(_id);
      setSavedWishlist(true);
      showToast(`Saved ${name} to Wishlist! ❤️`, 'success');
    } catch (err) {
      if (err.response?.status === 409) {
        setSavedWishlist(true);
        showToast('Already in your Wishlist!', 'info');
      } else {
        showToast('Could not save to wishlist', 'error');
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  const itemTotal = (price || 0) * quantity;

  return (
    <div className={`cart-item-row ${isRemoving ? 'is-row-removing' : ''}`} id={`cart-item-${_id}`}>
      {/* Product Thumbnail */}
      <Link to={`/products/${_id}`} className="cart-item-img-wrap">
        <img
          src={image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400'}
          alt={name}
          className="cart-item-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400';
          }}
        />
      </Link>

      {/* Item Details */}
      <div className="cart-item-details">
        {category && <span className="cart-item-category">{category}</span>}
        <Link to={`/products/${_id}`} className="cart-item-title" title={name}>
          {name}
        </Link>
        <div className="cart-item-price-unit">
          ₹{(price || 0).toLocaleString('en-IN')} <span className="per-unit-label">/ unit</span>
        </div>

        {/* Stock warning notifications */}
        {stock <= 5 && stock > 0 && (
          <div className="cart-stock-warning">
            <AlertTriangle size={13} />
            <span>Only {stock} available in stock</span>
          </div>
        )}
      </div>

      {/* Quantity Stepper Controls (Task 14) */}
      <div className="cart-item-controls">
        <div className="quantity-stepper" id={`qty-stepper-${_id}`}>
          <button
            type="button"
            className="stepper-btn stepper-minus"
            id={`qty-decrease-${_id}`}
            onClick={handleDecrement}
            disabled={isAtMinQuantity || isUpdating || isRemoving}
            title={isAtMinQuantity ? "Minimum quantity is 1. Use Remove to delete." : "Decrease quantity"}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>

          <span className="stepper-qty" id={`qty-display-${_id}`}>
            {isUpdating ? <span className="mini-spinner" /> : quantity}
          </span>

          <button
            type="button"
            className="stepper-btn stepper-plus"
            id={`qty-increase-${_id}`}
            onClick={handleIncrement}
            disabled={isAtMaxStock || isUpdating || isRemoving}
            title={isAtMaxStock ? `Max available stock reached (${stock})` : "Increase quantity"}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        {isAtMaxStock && (
          <span className="max-stock-tag">Max stock reached</span>
        )}
      </div>

      {/* Row Total & Actions */}
      <div className="cart-item-total-col">
        <span className="cart-item-total-price" id={`item-total-${_id}`}>
          ₹{itemTotal.toLocaleString('en-IN')}
        </span>

        <div className="cart-item-actions-group">
          {/* Save for Later (Wishlist) */}
          <button
            type="button"
            className="cart-action-link save-wishlist-link"
            onClick={handleSaveToWishlist}
            disabled={savingWishlist}
            title="Save product to Wishlist"
          >
            <Heart size={13} fill={savedWishlist ? '#ef4444' : 'none'} color={savedWishlist ? '#ef4444' : 'currentColor'} />
            <span>{savedWishlist ? 'Saved' : 'Save for Later'}</span>
          </button>

          <span className="action-dot-divider">•</span>

          {/* Remove Button */}
          <button
            type="button"
            className="cart-action-link remove-link"
            id={`cart-remove-${_id}`}
            onClick={handleRemove}
            disabled={isRemoving}
            title="Remove from cart"
            aria-label={`Remove ${name} from cart`}
          >
            {isRemoving ? (
              <span className="mini-spinner" />
            ) : (
              <>
                <Trash2 size={13} />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
