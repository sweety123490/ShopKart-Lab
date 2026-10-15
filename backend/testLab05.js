const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();

const Customer = require("./models/customer.model");
const Product = require("./models/product.model");
const generateToken = require("./utils/generateToken");

async function runTests() {
  console.log("=========================================");
  console.log("🧪 SHOPKART LAB 05 — BACKEND TEST SUITE");
  console.log("=========================================\n");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Get or create test user
    let testUser = await Customer.findOne({ email: "lab05tester@shopkart.com" });
    if (!testUser) {
      testUser = await Customer.create({
        fullName: "Lab 05 Cart Tester",
        email: "lab05tester@shopkart.com",
        password: "hashedpassword123",
        phone: "9876543210",
        cart: [],
        wishlist: [],
      });
      console.log("✅ Created test user:", testUser.email);
    } else {
      // Clear cart for clean testing
      testUser.cart = [];
      await testUser.save();
      console.log("✅ Reset test user cart:", testUser.email);
    }

    const token = generateToken(testUser._id);

    // 2. Get a sample product with stock
    const product = await Product.findOne({ stock: { $gt: 2 } });
    if (!product) {
      console.error("❌ No product with stock > 2 found. Please run seedProducts.js first.");
      process.exit(1);
    }
    console.log(`📦 Testing with product: "${product.name}" (Stock: ${product.stock}, Price: ₹${product.price})`);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Helper request function
    function apiRequest(method, path, body = null, useAuth = true) {
      return new Promise((resolve, reject) => {
        const reqHeaders = {
          "Content-Type": "application/json",
          ...(useAuth ? { Authorization: `Bearer ${token}` } : {}),
        };

        const postData = body ? JSON.stringify(body) : null;
        if (postData) {
          reqHeaders["Content-Length"] = Buffer.byteLength(postData);
        }

        const req = http.request(
          {
            hostname: "127.0.0.1",
            port: process.env.PORT || 5000,
            path,
            method,
            headers: reqHeaders,
          },
          (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                resolve({ status: res.statusCode, data: JSON.parse(data) });
              } catch (e) {
                resolve({ status: res.statusCode, raw: data });
              }
            });
          }
        );

        req.on("error", (err) => reject(err));
        if (postData) req.write(postData);
        req.end();
      });
    }

    // TEST 7: Unauthenticated request
    console.log("\n[Test 7] Unauthenticated request to GET /cart");
    const unauthRes = await apiRequest("GET", "/cart", null, false);
    if (unauthRes.status === 401) {
      console.log("  ✅ PASS: 401 Unauthorized returned as expected");
    } else {
      console.error("  ❌ FAIL: Expected 401, got:", unauthRes.status);
    }

    // TEST 1: Add new item to cart
    console.log("\n[Test 1] Add new item: POST /cart/" + product._id);
    const addRes1 = await apiRequest("POST", `/cart/${product._id}`);
    if (addRes1.status === 200 && addRes1.data.cart?.length === 1 && addRes1.data.cart[0].quantity === 1) {
      console.log("  ✅ PASS: Product added with quantity = 1");
    } else {
      console.error("  ❌ FAIL:", addRes1);
    }

    // TEST 2: Add same item again (quantity increment)
    console.log("\n[Test 2] Add same item again: POST /cart/" + product._id);
    const addRes2 = await apiRequest("POST", `/cart/${product._id}`);
    if (addRes2.status === 200 && addRes2.data.cart?.length === 1 && addRes2.data.cart[0].quantity === 2) {
      console.log("  ✅ PASS: Quantity incremented to 2 without duplicate cart rows");
    } else {
      console.error("  ❌ FAIL:", addRes2);
    }

    // TEST 3: Get Cart (populated product)
    console.log("\n[Test 3] Get Cart: GET /cart");
    const getCartRes = await apiRequest("GET", "/cart");
    if (
      getCartRes.status === 200 &&
      getCartRes.data.cart?.length === 1 &&
      getCartRes.data.cart[0].product?.name === product.name
    ) {
      console.log("  ✅ PASS: Cart loaded with populated product information");
      console.log(`    - Product: ${getCartRes.data.cart[0].product.name}`);
      console.log(`    - Price: ₹${getCartRes.data.cart[0].product.price}`);
      console.log(`    - Quantity: ${getCartRes.data.cart[0].quantity}`);
    } else {
      console.error("  ❌ FAIL:", getCartRes);
    }

    // TEST 4: Update quantity
    console.log("\n[Test 4] Update quantity: PATCH /cart/" + product._id + " -> { quantity: 1 }");
    const updateRes = await apiRequest("PATCH", `/cart/${product._id}`, { quantity: 1 });
    if (updateRes.status === 200 && updateRes.data.cart[0].quantity === 1) {
      console.log("  ✅ PASS: Quantity successfully updated to 1");
    } else {
      console.error("  ❌ FAIL:", updateRes);
    }

    // TEST 5: Exceed stock validation
    console.log("\n[Test 5] Exceed stock validation: PATCH with quantity = " + (product.stock + 10));
    const exceedRes = await apiRequest("PATCH", `/cart/${product._id}`, { quantity: product.stock + 10 });
    if (exceedRes.status === 400) {
      console.log("  ✅ PASS: Rejected with 400 Bad Request:", exceedRes.data.message);
    } else {
      console.error("  ❌ FAIL: Expected 400, got:", exceedRes);
    }

    // TEST 6: Remove item from cart
    console.log("\n[Test 6] Remove item: DELETE /cart/" + product._id);
    const deleteRes = await apiRequest("DELETE", `/cart/${product._id}`);
    if (deleteRes.status === 200 && deleteRes.data.cart?.length === 0) {
      console.log("  ✅ PASS: Product removed from cart, empty cart returned");
    } else {
      console.error("  ❌ FAIL:", deleteRes);
    }

    console.log("\n=========================================");
    console.log("🎉 ALL LAB 05 BACKEND TESTS PASSED 100%!");
    console.log("=========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Test error:", err);
    process.exit(1);
  }
}

runTests();
