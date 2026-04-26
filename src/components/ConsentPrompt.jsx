import React, { useState, useEffect } from 'react';

function ConsentPrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('chronyx-cookie-consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('chronyx-cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        </p>
        <div className="cookie-actions">
          <button className="primary-btn" onClick={handleAccept}>Accept All</button>
          <button className="secondary-btn" onClick={() => setIsVisible(false)}>Decline</button>
        </div>
      </div>
    </div>
  );
}

export default ConsentPrompt;
