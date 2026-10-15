const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ─── Task 2: POST /wishlist/:productId ────────────────────────────────────────
// Add a product to the authenticated user's wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id; // From auth middleware – never from body

    // Validate productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Load the customer document (not just req.user which may be stale)
    const customer = await Customer.findById(userId);

    // Check for duplicate – prevent adding same product twice
    const alreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    // Add Product ObjectId (reference, not embedded document)
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Task 3: GET /wishlist ─────────────────────────────────────────────────────
// Get the authenticated user's wishlist with populated product data
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    // Find customer and populate wishlist product references
    // The server decides which user – the client cannot choose
    const customer = await Customer.findById(userId).populate({
      path: "wishlist",
      select: "name description price category image stock",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Task 4: DELETE /wishlist/:productId ──────────────────────────────────────
// Remove a product from the authenticated user's wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(userId);

    // Check if product is actually in wishlist
    const itemIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in your wishlist",
      });
    }

    // Remove the product reference
    customer.wishlist.splice(itemIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Bonus: PATCH /wishlist/:productId/toggle ─────────────────────────────────
// Toggle product in wishlist (add if not present, remove if present)
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(userId);
    const itemIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved;
    if (itemIndex === -1) {
      // Not in wishlist → add it
      customer.wishlist.push(productId);
      saved = true;
    } else {
      // Already in wishlist → remove it
      customer.wishlist.splice(itemIndex, 1);
      saved = false;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      saved,
      message: saved ? "Product added to wishlist" : "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
