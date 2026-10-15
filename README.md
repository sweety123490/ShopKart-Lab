# 🛒 ShopKart — E-Commerce Platform

A full-stack e-commerce application built using the MERN stack with authentication, product browsing, cart, wishlist, Razorpay payments, and order management.

## 🚀 Features

- User registration and login with JWT authentication
- Product search, filtering, and sorting
- Add, update, and remove cart items
- Wishlist management
- Secure Razorpay payment verification
- Order history and tracking
- MongoDB database integration

## 🛠️ Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Payments:** Razorpay

## 📁 Project Structure

```text
ShopKart-Lab/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

## ⚙️ Installation

**1. Clone the repository**

```bash
git clone https://github.com/sweety123490/ShopKart-Lab.git
cd ShopKart-Lab
```

**2. Start the backend**

```bash
cd backend
npm install
```

Create a `.env` file with your MongoDB URI, JWT secret, and Razorpay test credentials.

```bash
npm start
```

**3. Start the frontend**

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## 🔐 Environment Variables

Configure these variables in `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Note:** Never commit your `.env` file or secret credentials to GitHub.

## 🧪 Run Tests

Run the backend tests with the server running:

```bash
node testLab03.js
node testLab05.js
node testLab06.js
```


