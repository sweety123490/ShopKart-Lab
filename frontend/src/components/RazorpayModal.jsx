import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

/**
 * 💳 Razorpay Interactive Test Mode Payment Dialog
 * Emulates the Razorpay Standard Checkout in test mode for testing both
 * successful verification and failure/cancellation scenarios (Evaluation Test D).
 */
const RazorpayModal = ({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
  onFailure,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !paymentData) return null;

  const { amount, currency, razorpayOrderId, shopKartOrderId } = paymentData;
  const amountInRupees = (amount / 100).toLocaleString('en-IN');

  const handleSimulateSuccess = async () => {
    setProcessing(true);
    // Simulate Razorpay network response delay
    setTimeout(() => {
      const mockPaymentId = `pay_test_${Date.now()}`;
      onSuccess({
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
      });
      setProcessing(false);
    }, 900);
  };

  const handleSimulateFailure = () => {
    onFailure({
      error: {
        code: 'PAYMENT_FAILED',
        description: 'Payment was cancelled or rejected by user in Razorpay Test Mode.',
        reason: 'payment_failed',
      },
    });
  };

  return (
    <div className="razorpay-modal-backdrop" onClick={onClose}>
      <div className="razorpay-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="rp-header">
          <div className="rp-brand">
            <div className="rp-logo-badge">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="rp-brand-title">ShopKart Payments</div>
              <div className="rp-test-mode-tag">Razorpay Test Mode (Sandbox)</div>
            </div>
          </div>
          <button className="rp-close-btn" onClick={onClose} disabled={processing}>
            <X size={18} />
          </button>
        </div>

        {/* Order Info Strip */}
        <div className="rp-order-strip">
          <div className="rp-order-meta">
            <span className="rp-meta-label">Order Ref:</span>
            <span className="rp-meta-val">{razorpayOrderId}</span>
          </div>
          <div className="rp-amount-badge">
            <span className="rp-curr">{currency}</span>
            <span className="rp-num">₹{amountInRupees}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="rp-body">
          <div className="rp-methods-tabs">
            <button
              type="button"
              className={`rp-method-tab ${selectedMethod === 'card' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <CreditCard size={15} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`rp-method-tab ${selectedMethod === 'upi' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('upi')}
            >
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              className={`rp-method-tab ${selectedMethod === 'netbanking' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('netbanking')}
            >
              <span>NetBanking</span>
            </button>
          </div>

          <div className="rp-method-content">
            {selectedMethod === 'card' && (
              <div className="rp-card-preview">
                <div className="rp-card-chip" />
                <div className="rp-card-number">4111 •••• •••• 1111</div>
                <div className="rp-card-footer">
                  <span>TEST CARD</span>
                  <span>12/28</span>
                </div>
              </div>
            )}

            {selectedMethod === 'upi' && (
              <div className="rp-upi-box">
                <p>Virtual Payment Address:</p>
                <code>success@razorpay</code>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="rp-upi-box">
                <p>Simulated Bank:</p>
                <code>HDFC / ICICI / SBI (Test Gateway)</code>
              </div>
            )}
          </div>

          {/* Evaluation Action Buttons */}
          <div className="rp-actions">
            <button
              type="button"
              className="rp-btn-success"
              onClick={handleSimulateSuccess}
              disabled={processing}
            >
              {processing ? (
                <span>Verifying with Server...</span>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Simulate Successful Payment</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              className="rp-btn-fail"
              onClick={handleSimulateFailure}
              disabled={processing}
            >
              <AlertCircle size={16} />
              <span>Simulate Payment Failure / Cancel (Test D)</span>
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="rp-footer">
          <ShieldCheck size={14} className="text-emerald" />
          <span>Secured by Razorpay Payments • 256-bit Encryption</span>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
