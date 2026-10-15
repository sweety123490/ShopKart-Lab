const Product = require("../models/product.model");
const mongoose = require("mongoose");

// Task 2: Create a new product — POST /products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validation: Missing required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, description, price, category, image, and stock are required",
      });
    }

    // Validation: Invalid price (must be greater than 0)
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price: price must be greater than 0",
      });
    }

    // Validation: Invalid stock (cannot be negative)
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock: stock cannot be negative",
      });
    }

    const product = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numPrice,
      category: String(category).trim(),
      image: String(image).trim(),
      stock: numStock,
    });

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Task 3 & 5: Get all products with optional search + category filter + sorting — GET /products
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build MongoDB query dynamically
    const query = {};

    // Search by product name (case-insensitive)
    if (search && search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Category filter
    if (category && category.trim() !== "" && category !== "All Categories") {
      query.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    // Sorting (Bonus Challenge: price_asc, price_desc)
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
      sortOptions = { price: -1 };
    }

    const products = await Product.find(query)
      .select("-__v")
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Task 4: Get a single product by ID — GET /products/:id
const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId (Status 400 for invalid ID)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).select("-__v");

    // Product not found (Status 404)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
};
