const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Also support Authorization header Bearer token (bulletproof fallback)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Customer account not found",
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid or expired token",
    });
  }
};

module.exports = protect;