import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateQuantity,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
} from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // actionLoading tracks per-product operation: e.g. { [productId]: 'adding' | 'updating' | 'removing' }
  const [actionLoading, setActionLoading] = useState({});
  // Toast notifications for ultra-delightful feedback
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Fetch / refresh cart from backend
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      if (data && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      // If 401 unauth, just clear cart
      if (err.response?.status === 401) {
        setCartItems([]);
      } else {
        setError(err.response?.data?.message || 'Unable to load your cart.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync cart whenever the authenticated user changes
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
      setError(null);
    }
  }, [user, refreshCart]);

  // Add to cart API mutation
  const addToCart = useCallback(
    async (productId) => {
      if (!user) {
        showToast('Please login to add items to your cart', 'error');
        return { success: false, requireAuth: true };
      }

      setActionLoading((prev) => ({ ...prev, [productId]: 'adding' }));
      try {
        const data = await apiAddToCart(productId);
        if (data.cart) {
          setCartItems(data.cart);
        }
        showToast('Added to cart! 🛍️', 'success');
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not add product to cart';
        showToast(msg, 'error');
        return { success: false, message: msg };
      } finally {
        setActionLoading((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    },
    [user, showToast]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (productId, newQuantity) => {
      if (!user) return { success: false };
      if (newQuantity < 1) return { success: false };

      setActionLoading((prev) => ({ ...prev, [productId]: 'updating' }));
      try {
        const data = await apiUpdateQuantity(productId, newQuantity);
        if (data.cart) {
          setCartItems(data.cart);
        }
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not update quantity';
        showToast(msg, 'error');
        return { success: false, message: msg };
      } finally {
        setActionLoading((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    },
    [user, showToast]
  );

  // Remove product from cart
  const removeFromCart = useCallback(
    async (productId) => {
      if (!user) return { success: false };

      setActionLoading((prev) => ({ ...prev, [productId]: 'removing' }));
      try {
        const data = await apiRemoveFromCart(productId);
        if (data.cart) {
          setCartItems(data.cart);
        }
        showToast('Item removed from cart', 'info');
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not remove item';
        showToast(msg, 'error');
        return { success: false, message: msg };
      } finally {
        setActionLoading((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    },
    [user, showToast]
  );

  // Clear entire cart
  const clearUserCart = useCallback(async () => {
    if (!user) return;
    try {
      await apiClearCart();
      setCartItems([]);
      showToast('Cart cleared', 'info');
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  }, [user, showToast]);

  // Derived values — calculated directly from cartItems
  // Task 15: Do NOT store these in MongoDB or separate state
  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  const uniqueItemCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  // Shipping rule: Free for orders over ₹999, else ₹99
  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 999 ? 0 : 99;
  }, [subtotal]);

  // Estimated GST / Tax (Included in price or estimated breakdown)
  const estimatedTax = useMemo(() => {
    return Math.round(subtotal * 0.05); // 5% standard GST representation
  }, [subtotal]);

  const grandTotal = useMemo(() => {
    return subtotal + shippingFee;
  }, [subtotal, shippingFee]);

  // Check if a specific product is in the cart and its quantity
  const getProductCartQuantity = useCallback(
    (productId) => {
      const found = cartItems.find(
        (item) => item.product?._id === productId || item.product === productId
      );
      return found ? found.quantity : 0;
    },
    [cartItems]
  );

  // Clear cart state synchronously (used immediately after payment verification)
  const clearCartState = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = {
    cartItems,
    loading,
    error,
    actionLoading,
    totalItems,
    uniqueItemCount,
    subtotal,
    shippingFee,
    estimatedTax,
    grandTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearUserCart,
    clearCartState,
    refreshCart,
    getProductCartQuantity,
    showToast,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Dynamic Toast Feedback Pill */}
      {toast && (
        <div className={`global-toast-pill toast-${toast.type}`} role="status">
          <span>{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
