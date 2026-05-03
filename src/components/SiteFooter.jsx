import React from 'react';
import { Link } from 'react-router-dom';

function SiteFooter({ storeName = 'CHRONYX' }) {
  return (
    <footer className="site-footer site-footer-v2">
      <div className="site-footer-shell">
        <div className="site-footer-brand">
          <Link to="/" className="brand-wordmark" aria-label={`${storeName} Home`}>
            {storeName}
          </Link>
        </div>

        <div className="site-footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <a href="https://instagram.com/chronyx.studio" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>

        <div className="site-footer-meta">
          <span>&copy; {new Date().getFullYear()} {storeName}</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
