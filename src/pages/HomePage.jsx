import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Lock, Truck, Star } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { founderQuote, formatCurrency, homeHighlights } from '../data/store';
import SEO from '../components/SEO';

function HomePage({ addToCart, deliveryDate, setNotice, products = [] }) {
  const [urgencyCount, setUrgencyCount] = useState(5);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setUrgencyCount(Math.floor(Math.random() * 6) + 3);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="page-stack">
      <SEO 
        title="Luxury Wooden Wall Clocks" 
        description="CHRONYX presents premium wooden clocks crafted like heirloom objects. Explore our exclusive collections." 
      />
      <section className="hero-section">
        <div className="hero-copy">
          <p className="label">Premium Wooden Wall Clocks</p>
          <h1>Luxury clocks crafted like heirloom objects, not ordinary wall accessories.</h1>
          <p className="hero-text">
            CHRONYX presents premium wooden clocks through a cleaner storefront flow with focused
            discovery, dedicated product pages, cart, checkout, payment, and confirmation.
          </p>
          <div className="hero-cta-group">
            {products.length > 0 && (
              <Link className="primary-btn" to={`/products/${products[0].id}`}>
                Explore Collection <ArrowRight size={18} />
              </Link>
            )}
            <Link className="secondary-btn" to="/shop">
              Open cart
            </Link>
          </div>
          <div className="hero-meta">
            <div>
              <span className="meta-label">Current demand</span>
              <strong>{urgencyCount} people are viewing this drop</strong>
            </div>
            <div>
              <span className="meta-label">Estimated delivery</span>
              <strong>{deliveryDate}</strong>
            </div>
          </div>
        </div>
        <div className="hero-image-pane">
          {products.length > 0 ? (
            <img src={products[0].hero} alt={products[0].name} loading="lazy" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No products yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Press Strip / As Seen On */}
      <section className="press-strip" style={{ padding: '32px 0', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>
        <p className="label" style={{ marginBottom: '16px' }}>As Featured In</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', opacity: 0.6, flexWrap: 'wrap' }}>
          {['Architectural Digest', 'Wallpaper*', 'Dwell', 'Vogue Living'].map(mag => (
            <span key={mag} style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 'bold' }}>{mag}</span>
          ))}
        </div>
      </section>

      <section className="trust-strip">
        <article>
          <Truck size={24} weight="duotone" />
          <div>
            <strong>Insured delivery</strong>
            <span>White-glove packaging and tracked dispatch.</span>
          </div>
        </article>
        <article>
          <Lock size={24} weight="duotone" />
          <div>
            <strong>Secure payment flow</strong>
            <span>Shipping and payment are handled on separate steps.</span>
          </div>
        </article>
        <article>
          <CheckCircle size={24} weight="duotone" />
          <div>
            <strong>Small-run finishing</strong>
            <span>Every edition is hand-finished before dispatch.</span>
          </div>
        </article>
      </section>

      <section className="catalog-section">
        <div className="section-heading split-heading">
          <div>
            <p className="label">Collection</p>
            <h2>Browse products from the homepage, then open dedicated detail pages.</h2>
          </div>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div style={{ position: 'relative' }}>
                <Link className="product-image-link hover-zoom" to={`/products/${product.id}`}>
                  <img src={product.hero} alt={product.name} loading="lazy" />
                </Link>
                {product.stockPercent === 0 && (
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--surface-3)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>SOLD OUT</div>
                )}
              </div>
              <div className="product-card-copy">
                <div className="product-top">
                  <p className="label">{product.category}</p>
                  <span>{product.size}</span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
                <div className="stock-row">
                  <div className="battery-bar">
                    <div style={{ width: `${product.stockPercent}%`, background: product.stockPercent === 0 ? 'var(--line)' : 'var(--text)' }} />
                  </div>
                  <small>{product.stockPercent === 0 ? 'Waitlist Open' : `${product.stockPercent}% stock remaining`}</small>
                </div>
                <div className="product-bottom">
                  <div>
                    <strong>{formatCurrency(product.price)}</strong>
                    <small>{product.finish}</small>
                  </div>
                  <div className="product-actions">
                    {product.stockPercent === 0 ? (
                      <Link className="primary-btn" to={`/products/${product.id}`} style={{ background: 'var(--surface-3)', color: 'var(--text)', border: '1px solid var(--line)' }}>
                        Notify Me
                      </Link>
                    ) : (
                      <>
                        <Link className="secondary-btn" to={`/products/${product.id}`}>
                          View
                        </Link>
                        <button
                          className="primary-btn"
                          onClick={() => {
                            addToCart(product.id);
                            setNotice(`${product.name} added to cart.`);
                          }}
                        >
                          Add
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" style={{ padding: '80px 24px', background: 'var(--surface-2)', margin: '0 -24px' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', textAlign: 'center' }}>
          <p className="label">Client Commissions</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '16px 0 48px' }}>What our collectors say.</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', textAlign: 'left' }}>
            {[
              { quote: "The attention to detail is staggering. It’s not just a clock, it’s a centerpiece that anchors my entire living room.", author: "James M.", location: "Mumbai" },
              { quote: "I waited three months for my pre-order and it was worth every second. The wood grain is absolutely beautiful.", author: "Priya K.", location: "Delhi" },
              { quote: "Flawless silent movement and the finish is exquisite. Chronyx has mastered the art of timekeeping.", author: "Arjun R.", location: "Bangalore" }
            ].map((t, i) => (
               <div key={i} style={{ padding: '32px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                 <div style={{ display: 'flex', gap: '4px', color: 'var(--accent)', marginBottom: '16px' }}>
                    {[1,2,3,4,5].map(s => <Star key={s} weight="fill" size={16} />)}
                 </div>
                 <p style={{ fontSize: '1.1rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '24px' }}>"{t.quote}"</p>
                 <div>
                   <strong>{t.author}</strong>
                   <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.9rem' }}>{t.location}</span>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      <section className="founder-panel">
        <p className="label">Founder Message</p>
        <blockquote>{founderQuote}</blockquote>
      </section>

      {/* Instagram Lifestyle Gallery */}
      <section className="social-gallery" style={{ paddingTop: '64px' }}>
         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
           <p className="label">Follow The Atelier</p>
           <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '8px 0' }}>@chronyx.studio</h2>
         </div>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1595526114101-10ce6b82504b?auto=format&fit=crop&q=80&w=600'
            ].map((src, i) => (
              <div key={i} className="hover-zoom" style={{ aspectRatio: '1', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={src} alt="Lifestyle interior" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}

export default HomePage;
