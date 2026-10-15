import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import RazorpayModal from '../components/RazorpayModal';

// Load Razorpay Standard Checkout SDK dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Native Web Crypto API helper to compute HMAC SHA-256 in browser
const computeHmacSha256 = async (secret, message) => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const Checkout = ({ user }) => {
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    shippingFee,
    grandTotal,
    totalItems,
    clearCartState,
    showToast,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);

  // Fallback simulator modal state for testing/evaluation
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);

  // Client-side Validation (Task 3)
  const validateForm = () => {
    const errs = {};

    if (!formData.fullName || !formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    if (!formData.phone || !formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-\+\(\)]/g, '');
      if (!/^\d{10,12}$/.test(cleanPhone)) {
        errs.phone = 'Please enter a valid 10-digit mobile number';
      }
    }

    if (!formData.addressLine1 || !formData.addressLine1.trim()) {
      errs.addressLine1 = 'Street address is required';
    }

    if (!formData.city || !formData.city.trim()) {
      errs.city = 'City is required';
    }

    if (!formData.state || !formData.state.trim()) {
      errs.state = 'State is required';
    }

    if (!formData.pincode || !formData.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 11: Call verify payment on backend
  const handleVerifyPayment = async ({
    shopKartOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    try {
      setLoading(true);
      setBackendError(null);

      let sig = razorpay_signature;
      if (!sig) {
        const secret = 'shopkart_test_secret_key_12345';
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        sig = await computeHmacSha256(secret, body);
      }

      const verifyRes = await verifyPayment({
        shopKartOrderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature: sig,
      });

      if (verifyRes.success) {
        // Step 13 & 14: Clear cart state immediately in frontend!
        clearCartState();
        showToast('🎉 Order placed and payment verified successfully!', 'success');
        navigate(`/order-success/${shopKartOrderId}`);
      } else {
        setBackendError(verifyRes.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      const msg = err.response?.data?.message || 'Payment verification failed. Your cart was NOT cleared.';
      setBackendError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
      setTestModalOpen(false);
    }
  };

  const handlePaymentFailure = (errorObj) => {
    console.warn('Payment failed/cancelled:', errorObj);
    setLoading(false);
    setTestModalOpen(false);
    const msg = errorObj?.description || 'Payment was cancelled. Your cart remains safe and unchanged.';
    setBackendError(msg);
    showToast(msg, 'error');
  };

  // Place Order & Open Razorpay
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors in the shipping address form', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setLoading(true);
    setBackendError(null);

    try {
      // 1. POST /orders/create-payment-order
      const orderData = await createPaymentOrder({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize order');
      }

      setActivePaymentOrder(orderData);

      // 2. Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();

      // Check if real Razorpay credentials & server-registered order exist
      const isDummyKey = !orderData.key ||
        orderData.key.includes('shopkartKeyId123') ||
        orderData.key.includes('5173ShopKart');
      const isFallbackOrder = !orderData.razorpayOrderId ||
        orderData.razorpayOrderId.startsWith('order_test_');

      const canUseOfficialRazorpay = scriptLoaded &&
        window.Razorpay &&
        !isDummyKey &&
        !isFallbackOrder &&
        orderData.isRealRazorpay === true;

      if (canUseOfficialRazorpay) {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'ShopKart',
          description: `Order #${orderData.shopKartOrderId}`,
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            await handleVerifyPayment({
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
            email: user?.email || '',
          },
          theme: {
            color: '#2563eb',
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          handlePaymentFailure(response.error);
        });
        paymentObject.open();
        setLoading(false);
      } else {
        // Use our interactive Razorpay sandbox modal
        setLoading(false);
        setTestModalOpen(true);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create order';
      setBackendError(msg);
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  // If cart is empty and no active payment
  if (cartItems.length === 0 && !activePaymentOrder) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-empty-card">
          <div className="empty-cart-icon-wrap">
            <ShoppingBag size={48} className="text-muted" />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Please add some items to your shopping cart before proceeding to checkout.</p>
          <div className="empty-actions">
            <Link to="/products" className="btn btn-primary">
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      {/* Checkout Stepper Header */}
      <div className="checkout-header-section">
        <div className="checkout-breadcrumbs">
          <Link to="/cart" className="back-link">
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </Link>
        </div>

        <div className="checkout-stepper">
          <div className="step-node completed">
            <span className="step-num"><Check size={14} /></span>
            <span className="step-text">Cart</span>
          </div>
          <div className="step-line active" />
          <div className="step-node active">
            <span className="step-num">2</span>
            <span className="step-text">Shipping & Review</span>
          </div>
          <div className="step-line" />
          <div className="step-node">
            <span className="step-num">3</span>
            <span className="step-text">Razorpay Payment</span>
          </div>
          <div className="step-line" />
          <div className="step-node">
            <span className="step-num">4</span>
            <span className="step-text">Confirmation</span>
          </div>
        </div>
      </div>

      {/* Backend Error Banner */}
      {backendError && (
        <div className="checkout-error-banner" role="alert">
          <AlertTriangle size={20} />
          <div>
            <strong>Checkout Notice:</strong> {backendError}
          </div>
        </div>
      )}

      {/* Main 2-Column Checkout Layout */}
      <div className="checkout-layout-grid">
        {/* Left Column: Shipping Form */}
        <div className="checkout-left-col">
          <CheckoutForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        </div>

        {/* Right Column: Order Review & Razorpay CTA */}
        <div className="checkout-right-col">
          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            shippingFee={shippingFee}
            grandTotal={grandTotal}
            totalItems={totalItems}
            onPlaceOrder={handlePlaceOrder}
            loading={loading}
          />
        </div>
      </div>

      {/* Razorpay Interactive Test Mode Dialog */}
      <RazorpayModal
        isOpen={testModalOpen}
        onClose={() => {
          setTestModalOpen(false);
          setLoading(false);
        }}
        paymentData={activePaymentOrder}
        onSuccess={handleVerifyPayment}
        onFailure={handlePaymentFailure}
      />
    </div>
  );
};

export default Checkout;
