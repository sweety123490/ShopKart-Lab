const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * 🛒 Lab 05 — Cart Controller
 * Implements Tasks 2, 3, 4, 5
 */

// ─── Task 2: POST /cart/:productId ──────────────────────────────────────────
// Add a product to the authenticated user's cart.
// If already present: increase quantity by 1.
// If not present: add with quantity = 1.
// Validates stock limit before saving.
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Find Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if out of stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // 3. Load Customer
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    // 4. Check if already in cart
    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    let targetQuantity = 1;
    if (itemIndex > -1) {
      targetQuantity = customer.cart[itemIndex].quantity + 1;
    }

    // 5. Stock Validation
    if (targetQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot exceed available stock. Only ${product.stock} units available.`,
      });
    }

    // 6. Update cart
    if (itemIndex > -1) {
      customer.cart[itemIndex].quantity = targetQuantity;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await customer.save();

    // 7. Return populated cart
    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const populatedCart = customer.cart.filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
    });
  }
};

// ─── Task 3: GET /cart ──────────────────────────────────────────────────────
// Load authenticated user's cart with populated product data.
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const customer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const populatedCart = (customer.cart || []).filter(
      (item) => item.product != null
    );

    return res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

// ─── Task 4: PATCH /cart/:productId ─────────────────────────────────────────
// Update product quantity in authenticated user's cart.
// Request body: { quantity: number }
// Rules:
// - Quantity must be a number
// - Quantity must be at least 1
// - Quantity must not exceed Product stock
// - Product must already exist in cart
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // 1. Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Validate quantity format & value
    if (quantity === undefined || quantity === null || typeof quantity !== "number" || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // 3. Find Product & validate existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 4. Validate stock limit
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (only ${product.stock} available)`,
      });
    }

    // 5. Load Customer & check if item exists in cart
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const itemIndex = (customer.cart || []).findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // 6. Update quantity and save
    customer.cart[itemIndex].quantity = quantity;
    await customer.save();

    // 7. Return populated cart
    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const populatedCart = customer.cart.filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating cart quantity",
    });
  }
};

// ─── Task 5: DELETE /cart/:productId ────────────────────────────────────────
// Remove a product from the authenticated user's cart.
// Returns updated cart after removal.
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Load Customer
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 3. Find item in cart
    const itemIndex = (customer.cart || []).findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // 4. Remove item
    customer.cart.splice(itemIndex, 1);
    await customer.save();

    // 5. Populate and return updated cart
    await customer.populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    const populatedCart = (customer.cart || []).filter(
      (item) => item.product != null
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing product from cart",
    });
  }
};

// ─── Optional Bonus: DELETE /cart (Clear Cart) ──────────────────────────────
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: [],
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ success: false, message: "Server error while clearing cart" });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
