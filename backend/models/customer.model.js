const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // Task 1 (Lab 04) — Wishlist: Array of Product ObjectId references
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Task 1 (Lab 05) — Cart: Array of items with product ref and quantity
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product reference is required"],
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity cannot be less than 1"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);