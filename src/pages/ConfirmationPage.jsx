import React, { useEffect } from 'react';
import { CheckCircle, DownloadSimple } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../components/pdf/InvoicePDF';

function ConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order || {};

  useEffect(() => {
    // Simulate email sending toast/notification
    const event = new CustomEvent('chronyx-notice', { detail: 'Order confirmation email sent to your inbox.' });
    window.dispatchEvent(event);
  }, []);

  const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : 'XXXX';
  const displayId = `KRX-2025-${shortId}`;

  return (
    <div className="page-stack">
      <section className="confirmation-panel" style={{ padding: '64px 24px' }}>
        <CheckCircle size={64} weight="duotone" />
        <h1 style={{ margin: '24px auto 16px' }}>Order Confirmed</h1>
        <p style={{ maxWidth: '400px', margin: '0 auto 32px' }}>
          Thank you for choosing Chronyx. Your order #{displayId} is now being prepared for dispatch.
          We have sent a confirmation email with your receipt.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {order.id ? (
            <PDFDownloadLink
              document={<InvoicePDF order={order} />}
              fileName={`Chronyx_Invoice_${displayId}.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {({ blob, url, loading, error }) => (
                <button className="primary-btn" disabled={loading}>
                  <DownloadSimple size={18} /> {loading ? 'Generating PDF...' : 'Download GST Invoice'}
                </button>
              )}
            </PDFDownloadLink>
          ) : (
            <button className="primary-btn" disabled>
              <DownloadSimple size={18} /> Invoice Unavailable
            </button>
          )}

          <Link className="secondary-btn" to="/track">
            Track Order
          </Link>
        </div>
      </section>
    </div>
  );
}

export default ConfirmationPage;
