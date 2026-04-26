import React from 'react';
import { CaretLeft, CaretRight, Truck } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../data/store';

function CartPage({ cartItems, cartTotal, updateCartQuantity, clearCart, user }) {
  const freeShippingThreshold = 50000;
  const amountToFreeShipping = freeShippingThreshold - cartTotal;
  const progressPercent = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  return (
    <div className="page-stack">
      <section className="page-header-panel">
        <p className="label">Cart</p>
        <h1>Review your selected CHRONYX pieces.</h1>
      </section>
      
      {cartItems.length > 0 && (
        <section className="shipping-banner" style={{ padding: '16px 24px', background: 'var(--surface-2)', borderRadius: '18px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Truck size={24} color="var(--accent)" />
            <strong>
              {amountToFreeShipping > 0 
                ? `Add ${formatCurrency(amountToFreeShipping)} more for FREE Express Shipping.` 
                : "You've unlocked FREE Express Shipping!"}
            </strong>
          </div>
          <div className="battery-bar" style={{ height: '8px', background: 'var(--surface-3)' }}>
            <div style={{ width: `${progressPercent}%`, transition: 'width 0.4s ease' }} />
          </div>
        </section>
      )}

      <section className="cart-page-layout">
        <div className="cart-list-panel">
          {cartItems.length === 0 ? (
            <div className="empty-panel">
              <h3>Your cart is empty.</h3>
              <p>Start from the homepage collection and open a product page to add a clock.</p>
              <Link className="primary-btn" to="/">
                Back to home
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <article className="cart-row" key={item.id}>
                <Link to={`/products/${item.id}`}>
                  <img src={item.hero} alt={item.name} />
                </Link>
                <div className="cart-row-copy">
                  <p className="label">{item.category}</p>
                  <h3>{item.name}</h3>
                  <span>{formatCurrency(item.price)}</span>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>
                    <CaretLeft size={16} />
                  </button>
                  <strong>{item.quantity}</strong>
                  <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>
                    <CaretRight size={16} />
                  </button>
                </div>
                <strong>{formatCurrency(item.lineTotal)}</strong>
              </article>
            ))
          )}
        </div>
        <aside className="summary-panel">
          <p className="label">Summary</p>
          <h3>{formatCurrency(cartTotal)}</h3>
          <p>Shipping and payment happen on dedicated next steps, not on the homepage.</p>
          <div className="summary-actions">
            {user ? (
              <Link className="primary-btn" to="/checkout">
                Continue to checkout
              </Link>
            ) : (
              <Link className="primary-btn" to="/auth" state={{ returnTo: '/checkout' }}>
                Login to Checkout
              </Link>
            )}
            <button className="secondary-btn" onClick={clearCart}>
              Clear cart
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default CartPage;
