import React from 'react';
import { User, Phone, MapPin, Building, Navigation, Hash, Sparkles } from 'lucide-react';

const SAMPLE_ADDRESS = {
  fullName: 'Aarav Sharma',
  phone: '9876543210',
  addressLine1: 'Flat 402, Sunshine Heights, MG Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
};

const CheckoutForm = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFillDemo = () => {
    setFormData(SAMPLE_ADDRESS);
    setErrors({});
  };

  return (
    <div className="checkout-form-card">
      <div className="form-card-header">
        <div className="form-header-text">
          <h2 className="form-title">Shipping & Delivery Details</h2>
          <p className="form-subtitle">Enter the address where you want your order delivered</p>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="btn-demo-fill"
          title="Auto-fill sample valid address"
        >
          <Sparkles size={14} />
          <span>Quick Fill Demo</span>
        </button>
      </div>

      <div className="checkout-fields-grid">
        {/* Full Name */}
        <div className={`form-group ${errors.fullName ? 'has-error' : ''}`}>
          <label htmlFor="fullName" className="field-label">
            Full Name <span className="req-star">*</span>
          </label>
          <div className="input-wrap">
            <User size={18} className="field-icon" />
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Aarav Sharma"
              className="field-input"
            />
          </div>
          {errors.fullName && <span className="field-error-msg">{errors.fullName}</span>}
        </div>

        {/* Phone Number */}
        <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
          <label htmlFor="phone" className="field-label">
            Phone Number <span className="req-star">*</span>
          </label>
          <div className="input-wrap">
            <Phone size={18} className="field-icon" />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className="field-input"
              maxLength={12}
            />
          </div>
          {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
        </div>

        {/* Address Line 1 */}
        <div className={`form-group full-width ${errors.addressLine1 ? 'has-error' : ''}`}>
          <label htmlFor="addressLine1" className="field-label">
            Street Address / House No. / Landmark <span className="req-star">*</span>
          </label>
          <div className="input-wrap">
            <MapPin size={18} className="field-icon" />
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="House/Flat No., Building, Street Name, Landmark"
              className="field-input"
            />
          </div>
          {errors.addressLine1 && <span className="field-error-msg">{errors.addressLine1}</span>}
        </div>

        {/* City */}
        <div className={`form-group ${errors.city ? 'has-error' : ''}`}>
          <label htmlFor="city" className="field-label">
            City <span className="req-star">*</span>
          </label>
          <div className="input-wrap">
            <Building size={18} className="field-icon" />
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Bengaluru"
              className="field-input"
            />
          </div>
          {errors.city && <span className="field-error-msg">{errors.city}</span>}
        </div>

        {/* State */}
        <div className={`form-group ${errors.state ? 'has-error' : ''}`}>
          <label htmlFor="state" className="field-label">
            State <span className="req-star">*</span>
          </label>
          <div className="input-wrap">
            <Navigation size={18} className="field-icon" />
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Karnataka"
              className="field-input"
            />
          </div>
          {errors.state && <span className="field-error-msg">{errors.state}</span>}
        </div>

        {/* Pincode */}
        <div className={`form-group ${errors.pincode ? 'has-error' : ''}`}>
          <label htmlFor="pincode" className="field-label">
            Pincode <span className="req-star">*</span>
          </label>
          <div className="input-wrap">
            <Hash size={18} className="field-icon" />
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
              className="field-input"
              maxLength={6}
            />
          </div>
          {errors.pincode && <span className="field-error-msg">{errors.pincode}</span>}
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
