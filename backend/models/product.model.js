const mongoose = require("mongoose");

// Task 1: Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      validate: {
        validator: function (val) {
          return typeof val === "number" && val > 0;
        },
        message: "Price must be greater than 0",
      },
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      validate: {
        validator: function (val) {
          return typeof val === "number" && val >= 0;
        },
        message: "Stock cannot be negative",
      },
    },
  },
  {
    timestamps: true, // Automatically generates createdAt and updatedAt
  }
);

module.exports = mongoose.model("Product", productSchema);
