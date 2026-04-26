import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('contact_messages').insert([{ name, email, message }]);
    } catch (err) {
      console.error('Failed to save message:', err);
    }
    setSubmitted(true);
  };

  return (
    <div className="page-stack">
      <section className="page-header-panel">
        <p className="label">Contact</p>
        <h1>Get in Touch</h1>
      </section>

      <section className="checkout-layout">
        <div className="checkout-form-panel">
          <div className="section-heading">
            <h2>Send us a message</h2>
            <p className="hero-text">
              Have questions about a product, order, or custom request? Fill out the form below
              and our team will get back to you within 24 hours.
            </p>
          </div>

          {submitted ? (
            <div className="confirmation-panel" style={{ textAlign: 'left', padding: '24px' }}>
              <h3>Message Sent</h3>
              <p>Thank you for reaching out. We will be in touch shortly.</p>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="full-span">
                Name
                <input type="text" required placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="full-span">
                Email
                <input type="email" required placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="full-span">
                Message
                <textarea required rows="5" placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
              </label>
              <button type="submit" className="primary-btn full-width-btn">
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="summary-panel">
          <h3>Customer Support</h3>
          <p>
            Our studio hours are Monday to Friday, 9am to 6pm IST.
          </p>
          <div style={{ marginTop: '24px' }}>
            <p className="label">Email</p>
            <strong>support@chronyx.in</strong>
          </div>
          <div style={{ marginTop: '16px' }}>
            <p className="label">Studio</p>
            <strong>
              124 Craft Avenue<br />
              Bangalore, 560001<br />
              India
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
