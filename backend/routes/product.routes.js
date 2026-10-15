const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/product.controller");

// POST /products  — Create a product
router.post("/", createProduct);

// GET /products   — Get all products (with optional ?search= &category= &sort=)
router.get("/", getAllProducts);

// GET /products/:id — Get a single product
router.get("/:id", getSingleProduct);

module.exports = router;
