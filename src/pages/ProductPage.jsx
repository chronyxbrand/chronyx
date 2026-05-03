import React, { useEffect, useState } from 'react';
import { Star } from '@phosphor-icons/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '../data/store';
import SEO from '../components/SEO';

const reviews = [
  {
    author: 'Rahul M.',
    text: 'Absolutely stunning. It completely transformed my living room.',
    rating: 5,
  },
  {
    author: 'Anjali D.',
    text: 'The silent sweep movement is perfect. A true piece of art.',
    rating: 5,
  },
  {
    author: 'Vikram S.',
    text: 'Beautiful finish and heavy wood. Feels like it will last generations.',
    rating: 4,
  },
];

const GIFT_WRAP_PRICE = 500;

function ProductPage({ addToCart, products = [] }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find((entry) => entry.id === productId) || products[0];

  const [activeImage, setActiveImage] = useState(product?.gallery?.[0] || '');
  const [timeLeft, setTimeLeft] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!product) return;
    setActiveImage(product.gallery?.[0] || '');
    setGiftWrap(false);
  }, [product]);

  useEffect(() => {
    if (!product?.dropDate) return undefined;

    const dropTime = new Date(product.dropDate).getTime();
    const interval = window.setInterval(() => {
      const now = new Date().getTime();
      const distance = dropTime - now;

      if (distance < 0) {
        window.clearInterval(interval);
        setTimeLeft('DROP ENDED');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [product?.dropDate]);

  if (!product) {
    return (
      <div className="missing-state">
        <h2>Product not found</h2>
        <Link to="/shop" className="primary-btn">
          Back to Shop
        </Link>
      </div>
    );
  }

  const relatedProducts = products.filter((entry) => entry.id !== product.id).slice(0, 3);
  const handleAddToCart = () => {
    addToCart(product.id);
    setNotice(`${product.name}${giftWrap ? ' (Gift Wrapped)' : ''} added to cart.`);
    window.setTimeout(() => setNotice(''), 3000);
  };

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.gallery,
    description: product.summary,
    brand: {
      '@type': 'Brand',
      name: 'CHRONYX',
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: 'INR',
      price: product.price,
      availability:
        product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="page-stack">
      <SEO title={`${product.name} | ${product.category}`} description={product.summary} schema={schema} />

      {notice ? <div className="notice-pill">{notice}</div> : null}

      <section className="product-page-hero">
        <div className="product-gallery">
          <div className="product-main-image">
            <img src={activeImage} alt={product.name} loading="lazy" />
          </div>
          <div className="product-thumbs">
            {(product.gallery || []).map((image) => (
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
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/shop">Shop</Link>
            <span>/</span>
            <span className="breadcrumbs-current">{product.name}</span>
          </nav>

          <div className="product-heading-row">
            <div className="product-heading-copy">
              <p className="label">{product.category}</p>
              <h1>{product.name}</h1>
              <h2 className="product-tagline">{product.tagline}</h2>
            </div>
            {product.dropDate ? (
              <div className="badge limited-badge">
                <span>Limited Drop</span>
                <strong>{timeLeft}</strong>
              </div>
            ) : null}
          </div>

          <p className="product-long-copy">{product.story}</p>

          <div className="stock-row product-stock-row">
            <div className="battery-bar">
              <div style={{ width: `${product.stockLevelPercent || 0}%` }} />
            </div>
            <small>Only {product.stockQuantity || 0} items remaining</small>
          </div>

          <div className="spec-list">
            <div>
              <span>Price</span>
              <strong className="product-price-value">{formatCurrency(product.price)}</strong>
            </div>
            <div>
              <span>Material</span>
              <strong>{product.material}</strong>
            </div>
            <div>
              <span>Size &amp; Finish</span>
              <strong>{product.size} / {product.finish}</strong>
            </div>
            <div>
              <span>Movement</span>
              <strong>{product.movementType}</strong>
            </div>
          </div>

          <label className="gift-wrap-row" htmlFor="giftWrap">
            <input
              type="checkbox"
              id="giftWrap"
              checked={giftWrap}
              onChange={(event) => setGiftWrap(event.target.checked)}
            />
            <span>Add Premium Gift Wrapping (+{formatCurrency(GIFT_WRAP_PRICE)})</span>
          </label>

          {product.stockQuantity === 0 ? (
            <div className="waitlist-panel">
              <h3>This edition is sold out.</h3>
              <p>
                Join the waitlist to be notified instantly when our artisans finish the next
                batch.
              </p>
              <form
                className="waitlist-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  window.alert('Added to waitlist!');
                }}
              >
                <input type="email" placeholder="Email address" required />
                <button type="submit" className="primary-btn">
                  Notify Me
                </button>
              </form>
            </div>
          ) : (
            <div className="detail-actions">
              <button className="primary-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="secondary-btn" onClick={() => navigate('/checkout')}>
                Buy Now
              </button>
            </div>
          )}

          {product.tags?.length ? (
            <div className="product-tags">
              <p className="label">Tags</p>
              <div className="tag-list">
                {product.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="product-extra-info">
        <div className="form-grid product-info-grid">
          <div className="info-block">
            <h3>Care Instructions</h3>
            <ul className="feature-list">
              {product.careInstructions?.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>

          <div className="info-block">
            <h3>Key Features</h3>
            <ul className="feature-list">
              {(product.features || []).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {product.videoEmbed ? (
        <section className="product-video-section">
          <div className="section-heading centered-heading">
            <p className="label">Craft in Motion</p>
            <h2>See it in motion.</h2>
          </div>
          <div className="video-frame">
            <iframe
              src={product.videoEmbed}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Product Video"
            />
          </div>
        </section>
      ) : null}

      <section className="catalog-section review-section">
        <div className="section-heading">
          <p className="label">Client Reviews</p>
          <h2>Collector feedback</h2>
          <div className="review-summary">
            <span className="review-stars" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={15} weight="fill" />
              ))}
            </span>
            <span>4.9/5 (12 reviews)</span>
          </div>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <article key={review.author} className="review-card">
              <div className="review-card-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={15} weight={index < review.rating ? 'fill' : 'regular'} />
                ))}
              </div>
              <p>"{review.text}"</p>
              <strong>{review.author}</strong>
            </article>
          ))}
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="catalog-section">
          <div className="section-heading">
            <p className="label">More From CHRONYX</p>
            <h2>You might also like</h2>
          </div>
          <div className="product-grid related-product-grid">
            {relatedProducts.map((related) => (
              <article className="product-card" key={related.id}>
                <Link className="product-image-link hover-zoom" to={`/products/${related.id}`}>
                  <img src={related.hero} alt={related.name} loading="lazy" />
                </Link>
                <div className="product-card-copy">
                  <div className="product-top">
                    <p className="label">{related.category}</p>
                  </div>
                  <h3>{related.name}</h3>
                  <p>{related.summary}</p>
                  <div className="product-bottom">
                    <div>
                      <strong>{formatCurrency(related.price)}</strong>
                    </div>
                    <Link className="secondary-btn" to={`/products/${related.id}`}>
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ProductPage;
