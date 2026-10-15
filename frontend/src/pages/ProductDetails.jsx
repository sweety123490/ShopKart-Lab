import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Tag, Package, ShieldCheck, 
  Truck, RotateCcw, Check, Sparkles, Heart 
} from 'lucide-react';
import { getSingleProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, getProductCartQuantity, actionLoading } = useCart();
  const { isWishlisted: checkIsWishlisted, toggleWishlist: toggleWishlistCtx, actionLoading: wishlistActionLoading } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Wishlist state for this product derived from global context
  const isWishlisted = checkIsWishlisted(id);
  const wishlistSaving = Boolean(wishlistActionLoading?.[id]);

  const isAdding = actionLoading[id] === 'adding' || actionLoading[id] === 'updating';
  const inCartQty = getProductCartQuantity(id);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getSingleProduct(id);
        setProduct(data.product);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Product not found.');
        } else if (err.response?.status === 400) {
          setError('Invalid product ID.');
        } else {
          setError('Something went wrong while loading the product.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (isAdding) return;
    const targetQty = inCartQty > 0 ? inCartQty + quantity : quantity;
    if (targetQty > (product?.stock || 0)) {
      return;
    }

    if (inCartQty === 0) {
      const res = await addToCart(id);
      if (res?.requireAuth) {
        navigate('/login');
        return;
      }
      if (res?.success && quantity > 1) {
        await updateQuantity(id, quantity);
      }
    } else {
      await updateQuantity(id, targetQty);
    }

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 3000);
  };

  const handleWishlistToggle = async () => {
    if (wishlistSaving) return;
    try {
      const res = await toggleWishlistCtx(id, product);
      if (res?.requireAuth) {
        navigate('/login');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        console.error('Wishlist error:', err);
      }
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="state-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p className="state-text">Loading product details...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="state-container error-state" style={{ minHeight: '60vh' }}>
        <p className="state-text">⚠️ {error}</p>
        <button 
          className="btn btn-secondary" 
          id="back-to-products-error"
          onClick={() => navigate('/products')}
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) return null;

  const { name, description, price, category, image, stock } = product;

  return (
    <div className="product-details-page">
      <button 
        className="back-btn" 
        id="btn-back-to-products"
        onClick={() => navigate('/products')}
      >
        <ArrowLeft size={18} /> Back to Products
      </button>

      <div className="product-details-card">
        {/* Product Image */}
        <div className="product-details-img-wrap">
          <img
            src={image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800'}
            alt={name || 'Product'}
            className="product-details-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800';
            }}
          />
          {stock === 0 ? (
            <span className="out-of-stock-badge">Out of Stock</span>
          ) : stock <= 5 ? (
            <span className="low-stock-badge">Low Stock: Only {stock} remaining!</span>
          ) : null}

          {/* Floating Heart Button */}
          <button
            className={`wishlist-heart-btn details-heart-float ${isWishlisted ? 'is-saved' : ''}`}
            onClick={handleWishlistToggle}
            disabled={wishlistSaving}
            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          >
            <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : 'currentColor'} />
          </button>
        </div>

        {/* Product Info */}
        <div className="product-details-info">
          <div className="details-category-pill">
            <Tag size={14} />
            <span>{category || 'General'}</span>
          </div>

          <h1 className="product-details-name" id="product-name">{name || 'Unnamed Product'}</h1>

          <div className="product-price-section">
            <span className="product-details-price" id="product-price">
              ₹{(price ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="inclusive-tax-text">Inclusive of all taxes</span>
          </div>

          <div className="product-details-desc-box">
            <h4 className="desc-heading">Description</h4>
            <p className="product-details-desc" id="product-description">{description}</p>
          </div>

          <div className="product-stock-banner">
            <Package size={18} />
            <span id="product-stock">
              {stock > 0 ? (
                <>Status: <strong style={{ color: '#16a34a' }}>{stock} units left in stock</strong></>
              ) : (
                <strong style={{ color: '#dc2626' }}>Currently Out of Stock</strong>
              )}
            </span>
          </div>

          {/* Quantity Selector & Dual Actions: Add to Cart + Add to Wishlist */}
          <div className="purchase-actions-area">
            {stock > 0 && (
              <div className="quantity-selector">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={quantity >= stock}
                >
                  +
                </button>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              id="add-to-cart-button"
              className={`btn btn-primary btn-large ${addedSuccess ? 'btn-added' : ''}`}
              disabled={stock === 0 || isAdding}
              onClick={handleAddToCart}
            >
              {isAdding ? (
                <>
                  <span className="btn-spinner" />
                  <span>Adding to Cart...</span>
                </>
              ) : addedSuccess ? (
                <>
                  <Check size={20} />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>{stock > 0 ? (inCartQty > 0 ? `Add More (${inCartQty} in cart)` : 'Add to Cart') : 'Out of Stock'}</span>
                </>
              )}
            </button>

            {/* Add to Wishlist Button */}
            <button
              id="details-wishlist-button"
              className={`btn btn-secondary btn-large btn-details-wishlist ${isWishlisted ? 'btn-wishlist-saved' : ''}`}
              onClick={handleWishlistToggle}
              disabled={wishlistSaving}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              <span>{wishlistSaving ? 'Saving...' : isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
            </button>
          </div>

          {addedSuccess && (
            <div className="cart-feedback-pill">
              <Sparkles size={16} /> Added {quantity} unit(s) of {name} to your persistent cart!
            </div>
          )}

          {/* Realistic Store Guarantees */}
          <div className="product-perks-grid">
            <div className="perk-box">
              <Truck size={18} className="perk-icon" />
              <div>
                <strong>Free Delivery</strong>
                <p>Standard delivery in 2-4 business days</p>
              </div>
            </div>
            <div className="perk-box">
              <RotateCcw size={18} className="perk-icon" />
              <div>
                <strong>7 Days Replacement</strong>
                <p>Hassle-free return & replacement policy</p>
              </div>
            </div>
            <div className="perk-box">
              <ShieldCheck size={18} className="perk-icon" />
              <div>
                <strong>100% Authentic</strong>
                <p>Genuine products verified by ShopKart</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
