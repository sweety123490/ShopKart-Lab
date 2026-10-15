const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

// All order endpoints are protected by JWT authentication
router.use(protect);

// Task 4: Create pending order & Razorpay order
router.post("/create-payment-order", createPaymentOrder);
router.post("/", createPaymentOrder); // Also accept POST /orders

// Task 5: Verify payment signature and finalize order
router.post("/verify-payment", verifyPayment);

// Task 7: Get all orders for authenticated user
router.get("/", getMyOrders);

// Task 17: Get single order by ID
router.get("/:id", getOrderById);

// Bonus: Order progression status update
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
