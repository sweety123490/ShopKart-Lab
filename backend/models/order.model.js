const mongoose = require("mongoose");

// Task 1: Order Schema with purchase-time snapshots
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Order must belong to a customer/user"],
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product reference is required"],
        },
        name: {
          type: String,
          required: [true, "Product name snapshot is required"],
        },
        price: {
          type: Number,
          required: [true, "Product price snapshot is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Item quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        image: {
          type: String,
        },
      },
    ],

    shippingAddress: {
      fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      addressLine1: {
        type: String,
        required: [true, "Address line 1 is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
      },
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING_PAYMENT",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
