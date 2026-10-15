const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const razorpay = require("../config/razorpay");

/**
 * 💳 Lab 06 — Order Controller
 * Checkout, Razorpay Payment Order, Signature Verification & Orders Retrieval
 */

// Helper to validate phone number (e.g. 10 digits)
const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
  return /^\d{10,12}$/.test(cleaned);
};

// Helper to validate Indian 6-digit pincode
const isValidPincode = (pincode) => {
  if (!pincode) return false;
  return /^\d{6}$/.test(pincode.trim());
};

// ─── Task 4: POST /orders/create-payment-order (also supports POST /orders) ───
const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // 1. Validate Shipping Details
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: "Full Name is required" });
    }
    if (!phone || !phone.trim() || !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: "Valid 10-digit phone number is required" });
    }
    if (!addressLine1 || !addressLine1.trim()) {
      return res.status(400).json({ success: false, message: "Address line 1 is required" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, message: "State is required" });
    }
    if (!pincode || !pincode.trim() || !isValidPincode(pincode)) {
      return res.status(400).json({ success: false, message: "Pincode must contain 6 digits" });
    }

    // 2. Load Customer with Cart
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Cannot checkout an empty cart.",
      });
    }

    // 3. Re-verify products and stock against latest database records
    const orderItems = [];
    let calculatedTotal = 0;

    for (const cartItem of customer.cart) {
      if (!cartItem.product) {
        continue;
      }

      const product = await Product.findById(cartItem.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart no longer exist.",
        });
      }

      // Check current stock
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}.`,
        });
      }

      // Create snapshot of purchase-time data
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      calculatedTotal += product.price * cartItem.quantity;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart contains no valid items",
      });
    }

    // 4. Create pending ShopKart order
    // Never trust req.body.totalAmount from client
    const shopKartOrder = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount: calculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    await shopKartOrder.save();

    // 5. Create Razorpay Order in Paise (1 INR = 100 Paise)
    const amountInPaise = Math.round(calculatedTotal * 100);
    let razorpayOrderId = null;

    try {
      const rpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: shopKartOrder._id.toString(),
      });
      razorpayOrderId = rpOrder.id;
    } catch (rpErr) {
      console.warn("Razorpay API order creation notice (falling back to test simulator ID):", rpErr.message);
      razorpayOrderId = `order_test_${shopKartOrder._id.toString().slice(-8)}_${Date.now().toString().slice(-6)}`;
    }

    shopKartOrder.razorpayOrderId = razorpayOrderId;
    await shopKartOrder.save();

    // NOTE: Cart is NOT cleared here! Only cleared after verified payment.

    const isRealRazorpay = !razorpayOrderId.startsWith("order_test_");

    return res.status(201).json({
      success: true,
      message: "Order initialized and Razorpay order created",
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: shopKartOrder.razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkartKeyId123",
      isRealRazorpay,
      order: shopKartOrder,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

// ─── Task 5 & Step 11: POST /orders/verify-payment ────────────────────────────
// Mandatory HMAC SHA256 Signature Verification
const verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters (shopKartOrderId, payment ID, or signature)",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ShopKart order ID",
      });
    }

    // 1. Find ShopKart Order
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not own this order.",
      });
    }

    // 2. Verify Razorpay Signature
    // Use the database-persisted razorpayOrderId as the trusted source of truth
    const trustedOrderId = order.razorpayOrderId || razorpay_order_id;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "shopkart_test_secret_key_12345";

    const signatureBody = `${trustedOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(signatureBody)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Signature mismatch: Mark payment FAILED, keep cart intact!
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Verification failed.",
      });
    }

    // 3. Signature is Valid: Mark Order as PAID & PLACED
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 4. Deduct Stock for purchased items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 5. Clear User Cart ONLY NOW after verified payment
    const customer = await Customer.findById(userId);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified and order placed!",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
    });
  }
};

// ─── Task 7: GET /orders — Current User's Orders ──────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// ─── Task 17: GET /orders/:id — Single Order by ID ────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent a user from viewing someone else's order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: you do not own this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get single order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order details",
    });
  }
};

// ─── Bonus Challenge: PATCH /orders/:id/status ────────────────────────────────
// Update order status progression (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Owner or admin check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access forbidden" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating status",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
