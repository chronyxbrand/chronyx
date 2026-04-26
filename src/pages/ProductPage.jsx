import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { formatCurrency } from '../data/store';
import SEO from '../components/SEO';

function ProductPage({ addToCart, products = [] }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find((entry) => entry.id === productId) || products[0];

  if (!product) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="primary-btn" style={{ marginTop: '24px', display: 'inline-block' }}>Back to Shop</Link>
      </div>
    );
  }
  
  const [activeImage, setActiveImage] = useState(product.gallery[0]);
  const [timeLeft, setTimeLeft] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setActiveImage(product.gallery[0]);
    setGiftWrap(false);
  }, [product.id]);

  useEffect(() => {
    if (!product.dropDate) return;
    const dropTime = new Date(product.dropDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = dropTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('DROP ENDED');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [product.dropDate]);

  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product.id);
    // Optional: could save gift wrap preference here
    setNotice(`${product.name} ${giftWrap ? '(Gift Wrapped) ' : ''}added to cart.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.gallery,
    "description": product.summary,
    "brand": {
      "@type": "Brand",
      "name": "Chronyx"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stockPercent > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="page-stack">
      <SEO 
        title={`${product.name} | ${product.category}`} 
        description={product.summary}
        schema={schema}
      />
      {notice && (
        <div className="notice-pill">
          {notice}
        </div>
      )}

      <section className="product-page-hero">
        <div className="product-gallery">
          <div className="product-main-image">
            <img src={activeImage} alt={product.name} loading="lazy" />
          </div>
          <div className="product-thumbs">
            {product.gallery.map((image) => (
              <button
                key={image}
                className={image === activeImage ? 'thumb-button active' : 'thumb-button'}
                onClick={() => setActiveImage(image)}
              >
                <img src={image} alt={product.name} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
        
        <div className="product-detail-panel">
          <nav className="breadcrumbs" style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '16px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link to="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>Shop</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--text)' }}>{product.name}</span>
          </nav>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="label">{product.category}</p>
              <h1>{product.name}</h1>
              <h2 className="product-tagline">{product.tagline}</h2>
            </div>
            {product.dropDate && (
              <div className="badge limited-badge">
                <span>Limited Drop</span>
                <strong>{timeLeft}</strong>
              </div>
            )}
          </div>
          
          <p className="product-long-copy">{product.story}</p>
          
          <div className="stock-row" style={{ marginTop: '8px' }}>
            <div className="battery-bar">
              <div style={{ width: `${Math.min(100, product.stockPercent * 10)}%` }} />
            </div>
            <small>Only {product.stockPercent} items remaining</small>
          </div>

          <div className="spec-list" style={{ marginTop: '24px' }}>
            <div>
              <span>Price</span>
              <strong style={{ fontSize: '1.4rem' }}>{formatCurrency(product.price)}</strong>
            </div>
            <div>
              <span>Material</span>
              <strong>{product.material}</strong>
            </div>
            <div>
              <span>Size & Finish</span>
              <strong>{product.size} &bull; {product.finish}</strong>
            </div>
            <div>
              <span>Movement</span>
              <strong>{product.movementType}</strong>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input 
              type="checkbox" 
              id="giftWrap" 
              checked={giftWrap} 
              onChange={(e) => setGiftWrap(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="giftWrap" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
              Add Premium Gift Wrapping (+₹500)
            </label>
          </div>

          {product.stockPercent === 0 ? (
            <div className="waitlist-panel" style={{ marginTop: '24px', padding: '24px', background: 'var(--surface-3)', borderRadius: '16px', border: '1px solid var(--line)' }}>
              <h3 style={{ margin: '0 0 8px' }}>This edition is sold out.</h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--muted)' }}>Join the waitlist to be notified instantly when our artisans finish the next batch.</p>
              <form style={{ display: 'flex', gap: '8px' }} onSubmit={(e) => { e.preventDefault(); alert('Added to waitlist!'); }}>
                <input type="email" placeholder="Email address" required style={{ flex: 1 }} />
                <button type="submit" className="primary-btn">Notify Me</button>
              </form>
            </div>
          ) : (
            <div className="detail-actions" style={{ marginTop: '24px' }}>
              <button className="primary-btn" onClick={handleAddToCart}>
                Add to cart
              </button>
              <button className="secondary-btn" onClick={() => navigate('/checkout')}>
                Buy now
              </button>
            </div>
          )}
          
          <div className="product-tags" style={{ marginTop: '24px' }}>
            <p className="label">Tags</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {product.tags?.map(tag => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs / Extra Info Section */}
      <section className="product-extra-info" style={{ padding: '32px' }}>
        <div className="form-grid">
          <div className="info-block">
            <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Care Instructions</h3>
            <ul className="feature-list" style={{ marginTop: '16px' }}>
              {product.careInstructions?.map((instruction, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{instruction}</li>
              ))}
            </ul>
          </div>
          
          <div className="info-block">
             <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Key Features</h3>
             <ul className="feature-list" style={{ marginTop: '16px' }}>
              {product.features.map((feature) => (
                <li key={feature} style={{ marginBottom: '8px' }}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Video Embed */}
      {product.videoEmbed && (
        <section className="product-video-section" style={{ padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '24px' }}>See it in Motion</h2>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '18px' }}>
            <iframe 
              src={product.videoEmbed} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
              allow="autoplay; encrypted-media" 
              allowFullScreen 
              title="Product Video"
            />
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="catalog-section" style={{ borderTop: '1px solid var(--line)', paddingTop: '64px' }}>
        <div className="section-heading">
          <h2>Customer Reviews</h2>
          <div style={{ display: 'flex', gap: '4px', color: 'var(--accent)', marginTop: '8px' }}>
            {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
            <span style={{ color: 'var(--text)', marginLeft: '8px', fontSize: '0.9rem' }}>4.9/5 (12 reviews)</span>
          </div>
        </div>
        <div className="review-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { author: 'Rahul M.', text: 'Absolutely stunning. It completely transformed my living room.', rating: 5 },
            { author: 'Anjali D.', text: 'The silent sweep movement is perfect. A true piece of art.', rating: 5 },
            { author: 'Vikram S.', text: 'Beautiful finish and heavy wood. Feels like it will last generations.', rating: 4 }
          ].map((review, i) => (
            <div key={i} style={{ padding: '24px', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: '4px', color: 'var(--accent)', marginBottom: '12px' }}>
                 {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <p style={{ margin: '0 0 16px', fontStyle: 'italic', color: 'var(--muted)' }}>"{review.text}"</p>
              <strong>{review.author}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="catalog-section">
          <div className="section-heading">
            <h2>You might also like</h2>
          </div>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {relatedProducts.map(rel => (
              <article className="product-card" key={rel.id}>
                <Link className="product-image-link" to={`/products/${rel.id}`}>
                  <img src={rel.hero} alt={rel.name} loading="lazy" />
                </Link>
                <div className="product-card-copy">
                  <div className="product-top">
                    <p className="label">{rel.category}</p>
                  </div>
                  <h3>{rel.name}</h3>
                  <div className="product-bottom" style={{ marginTop: 'auto' }}>
                    <div>
                      <strong>{formatCurrency(rel.price)}</strong>
                    </div>
                    <Link className="secondary-btn" to={`/products/${rel.id}`}>
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;
