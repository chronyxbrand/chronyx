import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

function BlogPage() {
  const articles = [
    {
      id: 1,
      title: 'The Art of Silent Sweeps',
      excerpt: 'Why the mechanism inside your clock matters just as much as the wood outside.',
      date: 'April 20, 2026',
    },
    {
      id: 2,
      title: 'Walnut vs. Maple: Choosing Your Finish',
      excerpt: 'A deep dive into the hardwoods we use and how they age over time.',
      date: 'March 15, 2026',
    },
    {
      id: 3,
      title: 'Minimalism in Interior Design',
      excerpt: 'How a single piece can redefine the warmth of an entire room.',
      date: 'February 28, 2026',
    }
  ];

  return (
    <div className="page-stack">
      <section className="page-header-panel">
        <p className="label">Journal</p>
        <h1>Chronyx Blog</h1>
      </section>

      <section className="home-story">
        <div className="section-heading split-heading">
          <div>
            <h2>Stories on craft, design, and time.</h2>
          </div>
        </div>
        
        <div className="story-grid" style={{ marginTop: '24px' }}>
          {articles.map(article => (
            <article key={article.id} className="story-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p className="label" style={{ marginBottom: '12px' }}>{article.date}</p>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
              </div>
              <div style={{ marginTop: '24px' }}>
                <Link to="#" className="secondary-btn" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  Read article <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BlogPage;
