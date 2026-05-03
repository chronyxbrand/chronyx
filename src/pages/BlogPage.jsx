import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { fallbackArticles, formatArticleDate } from '../lib/journal';

function BlogPage() {
  const [articles, setArticles] = useState(fallbackArticles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (!error && data?.length && isMounted) {
          setArticles(data);
        }
      } catch (error) {
        console.error('Failed to load journal articles:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredArticle = useMemo(
    () => articles.find((article) => article.is_featured) || articles[0] || null,
    [articles],
  );
  const secondaryArticles = useMemo(
    () => articles.filter((article) => !featuredArticle || article.slug !== featuredArticle.slug),
    [articles, featuredArticle],
  );

  return (
    <div className="page-stack">
      <SEO
        title="Journal"
        description="Stories from CHRONYX on craft, wood, interiors, and the rituals of time."
        path="/blog"
      />
      <section className="page-header-panel">
        <p className="label">Journal</p>
        <h1>CHRONYX Journal</h1>
      </section>

      {featuredArticle ? (
        <section className="journal-hero-panel">
          <div className="journal-hero-copy">
            <p className="label">{formatArticleDate(featuredArticle.published_at)}</p>
            <h2>{featuredArticle.title}</h2>
            <p>{featuredArticle.excerpt}</p>
            <Link to={`/journal/${featuredArticle.slug}`} className="primary-btn">
              Read Featured Story <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="home-story">
        <div className="section-heading split-heading">
          <div>
            <h2>Stories on craft, design, and time.</h2>
            <p className="hero-text">
              {loading ? 'Loading journal entries...' : 'Read the ideas, materials, and interior stories behind the pieces.'}
            </p>
          </div>
        </div>

        <div className="story-grid journal-grid" style={{ marginTop: '24px' }}>
          {secondaryArticles.map((article) => (
            <article
              key={article.id}
              className="story-card journal-card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <p className="label" style={{ marginBottom: '12px' }}>
                  {formatArticleDate(article.published_at)}
                </p>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
              </div>
              <div style={{ marginTop: '24px' }}>
                <Link to={`/journal/${article.slug}`} className="secondary-btn" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
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
