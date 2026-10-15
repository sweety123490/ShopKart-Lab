const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

const protect = require("../middlewares/auth.middleware");

// 🛒 All Cart endpoints require JWT Authentication
// Section 5 API Contract:
// POST   /cart/:productId  — Add product to cart (or increment quantity)
// GET    /cart             — Get current user's cart (with populated product)
// PATCH  /cart/:productId  — Update quantity { quantity: Number }
// DELETE /cart/:productId  — Remove product from cart
// DELETE /cart             — Clear entire cart

router.post("/:productId", protect, addToCart);
router.get("/", protect, getCart);
router.patch("/:productId", protect, updateCartQuantity);
router.delete("/:productId", protect, removeFromCart);
router.delete("/", protect, clearCart);

module.exports = router;
