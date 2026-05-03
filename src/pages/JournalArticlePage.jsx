import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { fallbackArticles, findFallbackArticle, formatArticleDate } from '../lib/journal';

function JournalArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(findFallbackArticle(slug) || fallbackArticles[0] || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

        if (!error && data && isMounted) {
          setArticle(data);
        }
      } catch (error) {
        console.error('Failed to load journal article:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (!article) {
    return (
      <div className="page-stack">
        <section className="page-header-panel">
          <p className="label">Journal</p>
          <h1>Article not found</h1>
          <Link to="/blog" className="secondary-btn">Back to Journal</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <SEO
        title={article.seo_title || `${article.title} | CHRONYX Journal`}
        description={article.seo_description || article.excerpt}
        path={`/journal/${article.slug}`}
      />
      <section className="journal-article-shell">
        <p className="label">Journal</p>
        <h1>{article.title}</h1>
        <p className="hero-text">{article.excerpt}</p>
        <div className="journal-article-meta">
          <span>{loading ? 'Loading...' : formatArticleDate(article.published_at)}</span>
          <Link to="/blog" className="secondary-btn">Back to Journal</Link>
        </div>
      </section>

      <section className="journal-article-body">
        {String(article.content || '')
          .split('\n')
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={`${article.slug}-${index}`}>{paragraph}</p>
          ))}
      </section>
    </div>
  );
}

export default JournalArticlePage;
