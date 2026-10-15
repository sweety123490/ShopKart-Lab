const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
} = require("../controllers/customer.controller");

const protect = require("../middlewares/auth.middleware");

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Customer routes working" });
});

// Required APIs
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", protect, getMyProfile);
router.post("/logout", protect, logoutCustomer);

module.exports = router;