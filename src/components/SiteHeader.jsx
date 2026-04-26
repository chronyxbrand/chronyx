import React, { useState } from 'react';
import { Moon, ShoppingBagOpen, SunDim, List, X, MagnifyingGlass, Heart, User } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';

function SiteHeader({ cartCount, theme, setTheme, notice, setNotice, wishlistCount, user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="header-left">
          <button className="icon-btn mobile-only hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={18} /> : <List size={18} />}
          </button>
          <Link className="brand-wordmark" to="/" aria-label="Chronyx Home">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" width="120" height="24">
              <text x="0" y="30" font-family="var(--font-display)" font-size="28" font-weight="bold" fill="currentColor" letter-spacing="4">CHRONYX</text>
            </svg>
          </Link>
        </div>

        <nav className={`site-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/blog" onClick={() => setIsMenuOpen(false)}>Journal</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
        </nav>
        
        <div className="header-actions">
          <button className="icon-btn search-toggle" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <MagnifyingGlass size={18} />
          </button>

          <Link className="icon-btn wishlist-toggle" to="/shop?wishlist=true">
             <Heart size={18} weight={wishlistCount > 0 ? 'fill' : 'regular'} />
             {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
          </Link>

          <Link to={user ? "/account" : "/auth"} className="icon-btn" aria-label="Account">
            <User size={22} weight="light" />
          </Link>

          <button
            className="icon-btn theme-toggle"
            aria-label="Toggle theme"
            onClick={() => setTheme((current) => (current === 'maple' ? 'night' : 'maple'))}
          >
            {theme === 'maple' ? <Moon size={18} weight="fill" /> : <SunDim size={18} weight="fill" />}
          </button>
          <Link className="cart-link" to="/cart">
            <ShoppingBagOpen size={18} />
            <span>{cartCount}</span>
          </Link>
        </div>

        {isSearchOpen && (
          <div className="search-bar-container">
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit"><MagnifyingGlass size={18} /></button>
            </form>
          </div>
        )}
      </header>
      {notice ? (
        <button className="notice-pill" onClick={() => setNotice('')}>
          {notice}
        </button>
      ) : null}
    </>
  );
}

export default SiteHeader;
