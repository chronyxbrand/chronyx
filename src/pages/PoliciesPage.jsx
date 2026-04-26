import React from 'react';
import SEO from '../components/SEO';

function PoliciesPage() {
  return (
    <div className="page-stack">
      <SEO 
        title="Store Policies" 
        description="Refund, return, shipping, and privacy policies for CHRONYX." 
      />
      <section className="page-header-panel">
        <p className="label">Legal</p>
        <h1>Store Policies</h1>
      </section>

      <section className="story-grid" style={{ maxWidth: '800px', margin: '0 auto', gap: '48px', display: 'flex', flexDirection: 'column' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Privacy Policy</h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
            Chronyx ("we", "our", or "us") respects your privacy. We collect minimal personal data required to process orders and improve your shopping experience. We do not sell your data to third parties. All payment information is securely processed via encrypted gateways.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Terms & Conditions</h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
            By accessing and using this website, you agree to our Terms of Service. Product availability, prices, and delivery timelines are subject to change without notice. All intellectual property, including logos and imagery, belongs exclusively to Chronyx.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Refund & Return Policy</h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
            We stand behind the quality of every Chronyx piece. If you are not entirely satisfied with your purchase, you may return it within 30 days of delivery for a full refund, provided it is in original, undamaged condition with all packaging intact. 
            <br /><br />
            Custom orders and limited edition drops are final sale and cannot be returned unless they arrive damaged or defective.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Shipping Policy</h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
            All standard domestic orders are shipped free of charge and typically arrive within 5-7 business days. Express White-Glove shipping is available for a flat rate of ₹1,500, delivering your clock via premium courier within 1-2 business days with careful handling.
            <br /><br />
            You will receive a tracking number via email as soon as your order is dispatched from our workshop.
          </p>
        </div>
      </section>
    </div>
  );
}

export default PoliciesPage;
