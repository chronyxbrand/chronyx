import React, { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

const POPUP_STORAGE_KEY = 'chronyx-popup-dismissed';
const POPUP_COOLDOWN_DAYS = 7; // Don't show again for 7 days after dismissal
const POPUP_DELAY_MS = 45000; // Wait 45 seconds before enabling the popup

function ExitIntentPopup({ user }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check if the popup was recently dismissed (within cooldown period)
  const wasRecentlyDismissed = () => {
    try {
      const dismissedAt = localStorage.getItem(POPUP_STORAGE_KEY);
      if (!dismissedAt) return false;
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      return daysSince < POPUP_COOLDOWN_DAYS;
    } catch {
      return false;
    }
  };

  // Wait 45 seconds before the popup can even trigger
  useEffect(() => {
    if (user || wasRecentlyDismissed()) return;

    const delayTimer = setTimeout(() => {
      setIsReady(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(delayTimer);
  }, [user]);

  // Only listen for exit intent after the delay has passed
  useEffect(() => {
    if (!isReady || user) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isReady, user]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsReady(false); // Prevent re-triggering in same session
    try {
      localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
    } catch {}
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    if (email) {
      try {
        await supabase.from('subscribers').insert([{ email, source: 'popup' }]);
      } catch (err) {
        console.error('Failed to subscribe:', err);
      }
      handleDismiss();
    }
  };

  if (!isVisible || user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content exit-intent">
        <button className="close-btn" onClick={handleDismiss}>
          <X size={24} />
        </button>
        <h2>Wait! Before you go...</h2>
        <p>Get 10% off your first luxury clock. Enter your email to receive your exclusive promo code.</p>
        <form className="newsletter-form" style={{ marginTop: '20px' }} onSubmit={handleSubscribe}>
          <input type="email" placeholder="Email address" required style={{ width: '100%' }} />
          <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center' }}>Reveal Code</button>
        </form>
      </div>
    </div>
  );
}

export default ExitIntentPopup;
