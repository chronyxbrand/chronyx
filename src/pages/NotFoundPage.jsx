import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';

function NotFoundPage() {
  return (
    <div className="page-stack">
      <section className="page-header-panel" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', color: 'var(--accent)' }}>404</h1>
        <h2 style={{ marginTop: '16px', fontSize: '1.8rem' }}>Page Not Found</h2>
        <p className="hero-text" style={{ maxWidth: '400px', margin: '16px auto 32px' }}>
          The page you are looking for has either moved or no longer exists.
        </p>
        <Link className="primary-btn" to="/">
          <ArrowLeft size={18} /> Return to Home
        </Link>
      </section>
    </div>
  );
}

export default NotFoundPage;
