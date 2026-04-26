import React from 'react';
import SEO from '../components/SEO';

function AboutPage() {
  return (
    <div className="page-stack">
      <SEO 
        title="The Atelier" 
        description="Learn about the master artisans behind CHRONYX." 
      />
      <section className="page-header-panel">
        <p className="label">About Us</p>
        <h1>The Chronyx Story</h1>
      </section>

      <section className="home-story">
        <div className="section-heading">
          <h2>Crafted like heirloom objects, not ordinary wall accessories.</h2>
          <p className="hero-text" style={{ marginTop: '14px', maxWidth: '800px' }}>
            We believe that a clock is more than a functional instrument; it is the heartbeat of a room.
            Founded with a passion for precision woodworking and minimalist design, Chronyx bridges the gap
            between traditional craftsmanship and modern aesthetics.
          </p>
        </div>
        
        <div className="story-grid" style={{ marginTop: '32px' }}>
          <article className="story-card">
            <h3>Our Materials</h3>
            <p>
              We source only the finest, sustainably harvested hardwoods. From rich walnut to
              blonde maple, every piece is selected for its unique grain and durability.
            </p>
          </article>
          <article className="story-card">
            <h3>Precision Engineering</h3>
            <p>
              Inside our handcrafted wooden frames lies a silent, sweep-movement quartz mechanism,
              ensuring perfect timekeeping without the distracting tick.
            </p>
          </article>
          <article className="story-card">
            <h3>Limited Production</h3>
            <p>
              We don't mass-produce. Every Chronyx clock is part of a limited run, hand-finished
              in our studio to ensure uncompromising quality.
            </p>
          </article>
        </div>
      </section>

      <section className="making-of-section" style={{ padding: '80px 0', borderTop: '1px solid var(--line)', marginTop: '48px' }}>
        <div className="section-heading" style={{ textAlign: 'center' }}>
          <p className="label">Behind The Scenes</p>
          <h2>The Art of Assembly.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '48px' }}>
          {[
            { img: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?auto=format&fit=crop&q=80&w=800', title: 'Sourcing the Timber', text: 'We work directly with sustainable lumber mills to select cuts with the most striking, unique grain patterns.' },
            { img: 'https://images.unsplash.com/photo-1598425237654-4c05ab483b45?auto=format&fit=crop&q=80&w=800', title: 'Precision Milling', text: 'Each clock body is CNC milled to within a fraction of a millimeter to perfectly house our silent movement hardware.' },
            { img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800', title: 'Hand Finishing', text: 'The final step involves hand-sanding and applying a natural wax finish to bring out the warmth of the wood.' }
          ].map((step, i) => (
             <div key={i} className="hover-zoom" style={{ background: 'var(--surface-2)', borderRadius: '16px', overflow: 'hidden' }}>
               <div style={{ aspectRatio: '4/3' }}>
                 <img src={step.img} alt={step.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
               <div style={{ padding: '24px' }}>
                 <h3>{step.title}</h3>
                 <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>{step.text}</p>
               </div>
             </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
