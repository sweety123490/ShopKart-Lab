const Razorpay = require("razorpay");

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_shopkartKeyId123";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_test_secret_key_12345";

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
} catch (err) {
  console.warn("Razorpay instance initialization notice:", err.message);
  razorpay = {
    orders: {
      create: async () => {
        throw new Error("Razorpay credentials not initialized");
      },
    },
  };
}

module.exports = razorpay;
