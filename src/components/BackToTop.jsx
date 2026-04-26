import React, { useState, useEffect } from 'react';
import { CaretUp } from '@phosphor-icons/react';

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
      <CaretUp size={24} weight="bold" />
    </button>
  );
}

export default BackToTop;
