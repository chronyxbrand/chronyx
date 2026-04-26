import React, { useState } from 'react';
import { CaretLeft } from '@phosphor-icons/react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { formatCurrency } from '../data/store';
import { supabase } from '../lib/supabase';

function CheckoutPage({ cartItems, cartTotal, shipping, setShipping, user }) {
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [storeSettings, setStoreSettings] = useState(null);

  React.useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'store_settings').single().then(({ data }) => {
      if (data) {
        setStoreSettings(data.value);
        if (!data.value.express_shipping_enabled) {
          setShippingMethod('standard');
        }
      }
    });
  }, []);

  if (!user) {
    return <Navigate to="/auth" state={{ returnTo: '/checkout' }} />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="page-stack">
        <section className="page-header-panel">
          <h1>Your cart is empty.</h1>
          <Link className="primary-btn" style={{ marginTop: '14px' }} to="/">
            Return home
          </Link>
        </section>
      </div>
    );
  }

  const handlePincodeChange = (e) => {
    const val = e.target.value;
    setShipping({ ...shipping, pincode: val });
    if (val.length === 6) {
      setDeliveryEstimate('Estimated delivery: ' + new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString());
    } else {
      setDeliveryEstimate('');
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    // Pass the selected shipping method fee to next stage or global state
    // Let's just navigate for prototype
    navigate('/payment', { state: { shippingMethod } });
  };

  const shippingFee = shippingMethod === 'express' ? (storeSettings?.express_shipping_fee || 1500) : 0;
  const finalTotal = cartTotal + shippingFee;

  return (
    <div className="page-stack">
      <section className="page-header-panel">
        <p className="label">Step 1 of 2</p>
        <h1>Shipping Details</h1>
      </section>
      <section className="checkout-layout">
        <form className="checkout-form-panel" onSubmit={handleNext}>
          <div className="section-heading">
            <h2>Where are we sending this?</h2>
          </div>
          <div className="form-grid">
            <label>
              First Name
              <input
                type="text"
                required
                value={shipping.name}
                onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
              />
            </label>
            <label>
              Last Name
              <input type="text" required />
            </label>
            <label className="full-span">
              Email Address
              <input
                type="email"
                required
                value={shipping.email}
                onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
              />
            </label>
            <label className="full-span">
              Phone Number
              <input
                type="tel"
                required
                value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
              />
            </label>
            <label className="full-span">
              Street Address
              <input
                type="text"
                required
                value={shipping.address}
                onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
              />
            </label>
            <label>
              City
              <input
                type="text"
                required
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              />
            </label>
            <label>
              PIN Code
              <input
                type="text"
                required
                maxLength="6"
                value={shipping.pincode}
                onChange={handlePincodeChange}
              />
            </label>
            {deliveryEstimate && (
              <div className="full-span" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                {deliveryEstimate}
              </div>
            )}
          </div>

          <div className="section-heading" style={{ marginTop: '24px' }}>
            <h2>Shipping Method</h2>
          </div>
          <div className="shipping-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--line)', borderRadius: '12px', cursor: 'pointer', background: shippingMethod === 'standard' ? 'var(--surface-3)' : 'transparent' }}>
              <input type="radio" name="shippingMethod" value="standard" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
              <div style={{ flex: 1 }}>
                <strong>Standard Shipping</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>5-7 Business Days</p>
              </div>
              <strong>Free</strong>
            </label>
            
            {storeSettings?.express_shipping_enabled && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--line)', borderRadius: '12px', cursor: 'pointer', background: shippingMethod === 'express' ? 'var(--surface-3)' : 'transparent' }}>
                <input type="radio" name="shippingMethod" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                <div style={{ flex: 1 }}>
                  <strong>Express White-Glove</strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>1-2 Business Days</p>
                </div>
                <strong>{formatCurrency(storeSettings?.express_shipping_fee || 1500)}</strong>
              </label>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Link className="icon-btn" to="/cart">
              <CaretLeft size={18} />
            </Link>
            <button className="primary-btn" type="submit" style={{ flex: 1 }}>
              Proceed to payment
            </button>
          </div>
        </form>
        <aside className="summary-panel">
          <p className="label">Order Summary</p>
          <div className="cart-list-panel" style={{ margin: '16px 0' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src={item.hero} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Qty: {item.quantity}</span>
                </div>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <span>Subtotal</span>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span>Shipping</span>
            <strong>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: '1.2rem' }}>Total</span>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{formatCurrency(finalTotal)}</h3>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default CheckoutPage;
