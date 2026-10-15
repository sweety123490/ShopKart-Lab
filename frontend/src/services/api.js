import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage if available as bulletproof fallback alongside cookies
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopkart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth APIs ────────────────────────────────────────────────────────────────

export const registerUser = async (userData) => {
  const response = await api.post('/customers/register', userData);
  if (response.data?.token) {
    localStorage.setItem('shopkart_token', response.data.token);
  }
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/customers/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('shopkart_token', response.data.token);
  }
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/customers/logout');
    return response.data;
  } finally {
    localStorage.removeItem('shopkart_token');
  }
};

// ─── Product APIs ─────────────────────────────────────────────────────────────

// GET /products?search=&category=&sort=
export const getProducts = async ({ search = '', category = '', sort = '' } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  if (sort) params.sort = sort;

  const response = await api.get('/products', { params });
  return response.data;
};

// GET /products/:id
export const getSingleProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// POST /products
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// ─── Wishlist APIs (Lab 04) ───────────────────────────────────────────────────

// GET /wishlist  — Returns the authenticated user's wishlist with populated product data
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

// POST /wishlist/:productId — Add product to wishlist
export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

// DELETE /wishlist/:productId — Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

// BONUS: PATCH /wishlist/:productId/toggle — Toggle wishlist status
export const toggleWishlist = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

// ─── Cart APIs (Lab 05) ───────────────────────────────────────────────────────

// GET /cart — Get authenticated user's cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// POST /cart/:productId — Add product to cart (or increment quantity)
export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

// PATCH /cart/:productId — Update quantity { quantity: Number }
export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

// DELETE /cart/:productId — Remove product from cart
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// DELETE /cart — Clear entire cart
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

// ─── Order APIs (Lab 06) ──────────────────────────────────────────────────────

// POST /orders/create-payment-order — Validate cart, stock, create ShopKart order & Razorpay order
export const createPaymentOrder = async (shippingAddress) => {
  const response = await api.post('/orders/create-payment-order', {
    shippingAddress,
  });
  return response.data;
};

// POST /orders/verify-payment — Verify HMAC SHA256 signature and finalize order
export const verifyPayment = async (verificationData) => {
  const response = await api.post('/orders/verify-payment', verificationData);
  return response.data;
};

// GET /orders — Get list of orders for the authenticated user
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// GET /orders/:id — Get a single order by ID
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// PATCH /orders/:id/status — Bonus: update order progression status
export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export default api;


