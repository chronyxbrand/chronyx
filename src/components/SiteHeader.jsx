import React, { useEffect, useState } from 'react';
import { List, ShoppingBagOpen, X } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';

const navigationLinks = [
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

function SiteHeader({ cartCount, notice, setNotice, storeName = 'CHRONYX', user = null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`site-header site-header-v2 ${isScrolled ? 'scrolled' : 'top'}`}>
        <div className="header-left">
          <Link className="brand-wordmark" to="/" aria-label={`${storeName} Home`}>
            {storeName}
          </Link>
        </div>

        <div className="header-center" />

        <div className="header-right">
          <nav className="site-nav desktop-nav">
            {navigationLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link
              className="account-link"
              to={user ? '/account' : '/auth'}
              aria-label={user ? 'My Account' : 'Sign In'}
            >
              <span>{user ? 'Account' : 'Sign In'}</span>
            </Link>
            <Link className="cart-link" to="/cart" aria-label="Cart">
              <ShoppingBagOpen size={18} />
              <span>{cartCount}</span>
            </Link>
          </div>
        </div>

        <div className="header-mobile-actions">
          <button
            className="icon-btn mobile-only hamburger"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="mobile-nav-panel">
          <nav className="site-nav mobile-nav">
            {navigationLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.label}
              </Link>
            ))}
            <Link to={user ? '/account' : '/auth'}>
              {user ? 'Account' : 'Sign In'}
            </Link>
          </nav>
        </div>
      ) : null}

      {notice ? (
        <button className="notice-pill" onClick={() => setNotice('')}>
          {notice}
        </button>
      ) : null}
    </>
  );
}

export default SiteHeader;
