import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../data/store';
import { Heart } from '@phosphor-icons/react';
import SEO from '../components/SEO';

function ShopPage({ addToCart, setNotice, toggleWishlist, wishlist, products = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const showWishlistOnly = searchParams.get('wishlist') === 'true';
  
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Fake network delay for skeleton loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [query, showWishlistOnly, filterCategory, sortBy]);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    let result = products;

    if (showWishlistOnly) {
      result = result.filter(p => wishlist.includes(p.id));
    }

    if (query) {
      const lowerQ = query.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.category.toLowerCase().includes(lowerQ) ||
        p.tags?.some(tag => tag.toLowerCase().includes(lowerQ))
      );
    }

    if (filterCategory !== 'All') {
      result = result.filter(p => p.category === filterCategory);
    }

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [query, showWishlistOnly, filterCategory, sortBy, wishlist]);

  return (
    <div className="page-stack">
      <SEO 
        title="Full Collection" 
        description="Shop the entire CHRONYX collection of luxury wooden wall clocks." 
      />
      <section className="page-header-panel">
        <p className="label">{showWishlistOnly ? 'Your Saved Items' : 'Collection'}</p>
        <h1>{showWishlistOnly ? 'Wishlist' : (query ? `Search: ${query}` : 'All Products')}</h1>
      </section>

      <section className="catalog-section">
        {!showWishlistOnly && (
          <div className="shop-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div className="filter-group">
              <label htmlFor="categoryFilter" className="label" style={{ marginRight: '8px' }}>Category:</label>
              <select 
                id="categoryFilter" 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)', padding: '6px 12px', borderRadius: '8px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="sort-group">
              <label htmlFor="sortFilter" className="label" style={{ marginRight: '8px' }}>Sort by:</label>
              <select 
                id="sortFilter" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)', padding: '6px 12px', borderRadius: '8px' }}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="product-grid">
            {[1, 2, 3].map(n => (
              <article className="product-card skeleton" key={n} style={{ minHeight: '400px', background: 'var(--surface-3)', borderRadius: '18px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-panel" style={{ padding: '64px', textAlign: 'center' }}>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters.</p>
            {(query || showWishlistOnly || filterCategory !== 'All') && (
              <button 
                className="secondary-btn" 
                style={{ marginTop: '16px', display: 'inline-block' }}
                onClick={() => {
                  setSearchParams({});
                  setFilterCategory('All');
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div style={{ position: 'relative' }}>
                  <Link className="product-image-link hover-zoom" to={`/products/${product.id}`}>
                    <img src={product.hero} alt={product.name} loading="lazy" />
                  </Link>
                  <button 
                    className="icon-btn wishlist-floating-btn"
                    onClick={() => {
                      toggleWishlist(product.id);
                      setNotice(wishlist.includes(product.id) ? 'Removed from wishlist' : 'Added to wishlist');
                    }}
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--surface)', border: 'none' }}
                  >
                    <Heart size={20} weight={wishlist.includes(product.id) ? 'fill' : 'regular'} color={wishlist.includes(product.id) ? 'var(--accent)' : 'var(--text)'} />
                  </button>
                </div>
                <div className="product-card-copy">
                  <div className="product-top">
                    <p className="label">{product.category}</p>
                    <span>{product.size}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <div className="stock-row">
                    <div className="battery-bar">
                      <div style={{ width: `${product.stockPercent}%` }} />
                    </div>
                    <small>{product.stockPercent}% stock remaining</small>
                  </div>
                  <div className="product-bottom" style={{ marginTop: 'auto' }}>
                    <div>
                      <strong>{formatCurrency(product.price)}</strong>
                    </div>
                    <div className="product-actions">
                      <button
                        className="primary-btn"
                        onClick={() => {
                          addToCart(product.id);
                          setNotice(`${product.name} added to cart.`);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ShopPage;
