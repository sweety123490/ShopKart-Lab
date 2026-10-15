const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require("../controllers/wishlist.controller");

const protect = require("../middlewares/auth.middleware");

// All wishlist routes require authentication
// The server identifies the user from the JWT – the client never sends userId

// GET    /wishlist              → Get current user's wishlist (with populated product data)
router.get("/", protect, getWishlist);

// POST   /wishlist/:productId   → Add a product to wishlist
router.post("/:productId", protect, addToWishlist);

// DELETE /wishlist/:productId   → Remove a product from wishlist
router.delete("/:productId", protect, removeFromWishlist);

// BONUS: PATCH /wishlist/:productId/toggle → Toggle add/remove
router.patch("/:productId/toggle", protect, toggleWishlist);

module.exports = router;
