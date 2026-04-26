import React, { useState } from 'react';
import { Package, Truck, CheckCircle } from '@phosphor-icons/react';

function TrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [tracking, setTracking] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    setTracking(true);
  };

  return (
    <div className="page-stack">
      <section className="page-header-panel">
        <p className="label">Order Status</p>
        <h1>Track Your Delivery</h1>
      </section>

      <section className="checkout-layout">
        <form className="checkout-form-panel" onSubmit={handleTrack}>
          <div className="section-heading">
            <h2>Enter your details</h2>
            <p className="hero-text">Find your order number in your confirmation email.</p>
          </div>
          <div className="form-grid">
            <label className="full-span">
              Order ID
              <input type="text" required placeholder="e.g. CX-12345" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            </label>
            <button type="submit" className="primary-btn full-span">Track Order</button>
          </div>
        </form>

        {tracking && (
          <aside className="summary-panel">
            <p className="label">Status for {orderId.toUpperCase()}</p>
            <h3 style={{ marginTop: '8px' }}>In Transit</h3>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', background: 'var(--line)', zIndex: 0 }} />
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', zIndex: 1 }}>
                <div style={{ background: 'var(--accent)', color: '#000', borderRadius: '50%', padding: '4px' }}>
                  <CheckCircle size={16} weight="fill" />
                </div>
                <div>
                  <strong>Order Confirmed</strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>April 24, 10:00 AM</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', zIndex: 1 }}>
                <div style={{ background: 'var(--surface-3)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '50%', padding: '4px' }}>
                  <Truck size={16} />
                </div>
                <div>
                  <strong style={{ color: 'var(--accent)' }}>Out for Delivery</strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>April 26, 08:30 AM</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', zIndex: 1 }}>
                <div style={{ background: 'var(--surface-3)', border: '1px solid var(--line)', color: 'var(--muted)', borderRadius: '50%', padding: '4px' }}>
                  <Package size={16} />
                </div>
                <div style={{ opacity: 0.5 }}>
                  <strong>Delivered</strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Pending</p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </section>
    </div>
  );
}

export default TrackingPage;
