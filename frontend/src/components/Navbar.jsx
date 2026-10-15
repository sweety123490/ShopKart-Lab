import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Heart, ShoppingBag, LogOut, Sun, Moon } from 'lucide-react';
import { logoutUser } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = ({ user, setUser, darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Task 16: Read cart totals directly from Global Cart State
  const { totalItems } = useCart();

  // Instant global wishlist count
  const { wishlistCount } = useWishlist();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  const isCartActive = location.pathname === '/cart';

  return (
    <nav className="navbar">
      {/* Brand Logo */}
      <Link to={user ? '/home' : '/login'} className="navbar-brand">
        <div className="brand-icon">
          <ShoppingBag size={18} />
        </div>
        <span>ShopKart</span>
      </Link>

      {/* Center Navigation Links (Task 16: Products | Wishlist | Cart (3)) */}
      <div className="navbar-menu">
        <Link to="/home" className={`menu-item ${location.pathname === '/home' ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/products" className={`menu-item ${location.pathname === '/products' ? 'active' : ''}`}>
          Products
        </Link>

        {user && (
          <>
            <Link
              to="/wishlist"
              className={`menu-item wishlist-nav-link ${location.pathname === '/wishlist' ? 'active' : ''}`}
              id="nav-wishlist"
            >
              <Heart size={14} />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="wishlist-count-badge" id="wishlist-count-badge">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Task 16 — Dynamic Cart Link updating without refresh */}
            <Link
              to="/cart"
              className={`menu-item cart-nav-link ${isCartActive ? 'active' : ''}`}
              id="nav-cart"
            >
              <ShoppingBag size={14} />
              <span>Cart</span>
              <span className={`cart-count-badge ${totalItems > 0 ? 'has-items' : ''}`} id="nav-cart-count">
                ({totalItems})
              </span>
            </Link>

            {/* Lab 06: My Orders Link */}
            <Link
              to="/orders"
              className={`menu-item ${location.pathname === '/orders' ? 'active' : ''}`}
              id="nav-orders"
            >
              <span>My Orders</span>
            </Link>
          </>
        )}
      </div>

      {/* Right Actions */}
      <div className="navbar-actions">
        {/* 🌙 / ☀️ Dark / Light Mode Toggle Button */}
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="theme-toggle-btn"
          id="theme-toggle-btn"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark/light mode"
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {user ? (
          <>
            <span className="user-greeting">Hi, {user.fullName ? user.fullName.split(' ')[0] : 'Customer'}</span>
            <button className="icon-btn" title="Account">
              <User size={20} />
            </button>

            {/* Wishlist icon with badge */}
            <Link
              to="/wishlist"
              className="icon-btn wishlist-icon-btn"
              id="nav-wishlist-icon"
              title={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ''}`}
              style={{ position: 'relative', display: 'inline-flex' }}
            >
              <Heart size={20} fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
              {wishlistCount > 0 && (
                <span className="icon-count-dot">{wishlistCount}</span>
              )}
            </Link>

            {/* Task 16: Cart icon with live derived count badge */}
            <Link
              to="/cart"
              className={`icon-btn cart-icon-btn ${isCartActive ? 'active-icon' : ''}`}
              id="nav-cart-icon"
              title={`Cart (${totalItems} items)`}
              style={{ position: 'relative', display: 'inline-flex' }}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="icon-count-dot cart-count-dot" id="nav-cart-icon-badge">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn-logout-clean"
              id="logout-button"
              title="Logout"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="menu-item" id="nav-login">Login</Link>
            <Link to="/register" className="menu-item" style={{ fontWeight: 700 }} id="nav-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
