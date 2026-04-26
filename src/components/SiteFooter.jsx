import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function SiteFooter() {
  const [footerEmail, setFooterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleFooterSubscribe = async (e) => {
    e.preventDefault();
    if (!footerEmail.trim()) return;
    
    try {
      await supabase.from('subscribers').insert([{ email: footerEmail, source: 'footer' }]);
      setSubscribed(true);
      setFooterEmail('');
    } catch (err) {
      // Might fail if already subscribed (unique constraint)
      setSubscribed(true);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand-wordmark" aria-label="Chronyx Home">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" width="120" height="24">
              <text x="0" y="30" fontFamily="var(--font-display)" fontSize="28" fontWeight="bold" fill="currentColor" letterSpacing="4">CHRONYX</text>
            </svg>
          </Link>
          <p style={{ marginTop: '16px' }}>Luxury clocks crafted like heirloom objects.</p>
        </div>
        
        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/shop">Shop All</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/blog">Journal</Link>
          <Link to="/contact">Contact</Link>
        </div>
        
        <div className="footer-links">
          <h4>Legal</h4>
          <Link to="/policies">Privacy & Policies</Link>
          <Link to="/track">Track Order</Link>
          <Link to="/account">My Account</Link>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Join our waitlist for new drops and exclusive editions.</p>
          {subscribed ? (
            <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>✓ You're on the list!</p>
          ) : (
            <form className="newsletter-form" onSubmit={handleFooterSubscribe}>
              <input 
                type="email" 
                placeholder="Your email address" 
                required 
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
              />
              <button type="submit" className="primary-btn">Subscribe</button>
            </form>
          )}
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Chronyx. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default SiteFooter;
