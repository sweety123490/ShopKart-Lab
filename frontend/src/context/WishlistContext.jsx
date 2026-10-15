import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getWishlist as apiGetWishlist,
  toggleWishlist as apiToggleWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  addToWishlist as apiAddToWishlist,
} from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children, user }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch / refresh wishlist from server
  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiGetWishlist();
      const list = data?.wishlist || [];
      setWishlist(list);
      setWishlistIds(new Set(list.map((item) => (item._id || item).toString())));
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      if (err.response?.status === 401) {
        setWishlist([]);
        setWishlistIds(new Set());
      } else {
        setError(err.response?.data?.message || 'Unable to load wishlist');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Synchronize on user login / logout
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // Instant Check if an ID is wishlisted
  const isWishlisted = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlistIds.has(productId.toString());
    },
    [wishlistIds]
  );

  // Toggle wishlist item with instant UI response
  const toggleWishlist = useCallback(
    async (productId, productData = null) => {
      if (!user) {
        return { requireAuth: true };
      }

      const idStr = productId.toString();
      const wasSaved = wishlistIds.has(idStr);
      const willBeSaved = !wasSaved;

      // 1. Optimistic instant local update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (willBeSaved) next.add(idStr);
        else next.delete(idStr);
        return next;
      });

      setWishlist((prev) => {
        if (willBeSaved) {
          if (productData && !prev.some((p) => (p._id || p).toString() === idStr)) {
            return [productData, ...prev];
          }
          return prev;
        } else {
          return prev.filter((p) => (p._id || p).toString() !== idStr);
        }
      });

      setActionLoading((prev) => ({ ...prev, [idStr]: true }));

      // 2. Perform server sync
      try {
        const data = await apiToggleWishlist(productId);
        const serverSaved = Boolean(data.saved);

        // Ensure server reality matches
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (serverSaved) next.add(idStr);
          else next.delete(idStr);
          return next;
        });

        return { success: true, saved: serverSaved };
      } catch (err) {
        // Revert optimistic update on failure
        console.error('Wishlist toggle failed, reverting:', err);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(idStr);
          else next.delete(idStr);
          return next;
        });
        setWishlist((prev) => {
          if (wasSaved && productData && !prev.some((p) => (p._id || p).toString() === idStr)) {
            return [productData, ...prev];
          }
          if (!wasSaved) {
            return prev.filter((p) => (p._id || p).toString() !== idStr);
          }
          return prev;
        });
        throw err;
      } finally {
        setActionLoading((prev) => {
          const next = { ...prev };
          delete next[idStr];
          return next;
        });
      }
    },
    [user, wishlistIds]
  );

  // Direct remove from wishlist with instant response
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!user) return { requireAuth: true };

      const idStr = productId.toString();
      const previousWishlist = wishlist;
      const previousIds = new Set(wishlistIds);

      // Instant optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(idStr);
        return next;
      });
      setWishlist((prev) => prev.filter((p) => (p._id || p).toString() !== idStr));
      setActionLoading((prev) => ({ ...prev, [idStr]: true }));

      try {
        await apiRemoveFromWishlist(productId);
        return { success: true };
      } catch (err) {
        // Revert on error
        console.error('Failed to remove from wishlist:', err);
        setWishlist(previousWishlist);
        setWishlistIds(previousIds);
        throw err;
      } finally {
        setActionLoading((prev) => {
          const next = { ...prev };
          delete next[idStr];
          return next;
        });
      }
    },
    [user, wishlist, wishlistIds]
  );

  const wishlistCount = wishlistIds.size;

  const value = useMemo(
    () => ({
      wishlist,
      wishlistIds,
      wishlistCount,
      loading,
      error,
      actionLoading,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      refreshWishlist,
    }),
    [
      wishlist,
      wishlistIds,
      wishlistCount,
      loading,
      error,
      actionLoading,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      refreshWishlist,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
