import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { getProfile } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('shopkart-theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('shopkart-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('shopkart-theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await getProfile();
        if (data && (data._id || data.email)) {
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem('shopkart_token');
      } finally {
        setInitializing(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (initializing) {
    return (
      <div className="loading-wrapper" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <CartProvider user={user}>
        <WishlistProvider user={user}>
          <div className="app-container">
            <Navbar user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />
            <main className="main-content">
              <Routes>
                <Route path="/register" element={<Register setUser={setUser} />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/home" element={<Home user={user} setUser={setUser} />} />

                {/* Lab 03: Product Catalog */}
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />

                {/* Lab 04: Wishlist */}
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Lab 05: Shopping Cart */}
                <Route
                  path="/cart"
                  element={user ? <Cart user={user} /> : <Navigate to="/login" replace />}
                />

                {/* Lab 06: Checkout, Orders */}
                <Route
                  path="/checkout"
                  element={user ? <Checkout user={user} /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/order-success/:id"
                  element={user ? <OrderConfirmation /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/orders"
                  element={user ? <Orders user={user} /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/orders/:id"
                  element={user ? <OrderDetails /> : <Navigate to="/login" replace />}
                />

                <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
              </Routes>
            </main>
          </div>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
