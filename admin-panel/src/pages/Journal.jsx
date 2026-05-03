import React, { useEffect, useMemo, useState } from 'react';
import { NotePencil, Plus, Trash } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

const defaultPostForm = {
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  seo_title: '',
  seo_description: '',
  is_published: false,
  is_featured: false,
  published_at: '',
};

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

function StatCard({ label, value, body }) {
  return (
    <div className="card marketing-overview-card">
      <p className="marketing-overview-label">{label}</p>
      <h3>{value}</h3>
      <p>{body}</p>
    </div>
  );
}

const Journal = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [formData, setFormData] = useState(defaultPostForm);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const published = posts.filter((post) => post.is_published).length;
    const featured = posts.filter((post) => post.is_featured).length;
    return { published, featured, drafts: posts.length - published };
  }, [posts]);

  const openNewEditor = () => {
    setFormData(defaultPostForm);
    setEditorOpen(true);
  };

  const openEditEditor = (post) => {
    setFormData({
      id: post.id,
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image: post.cover_image || '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      is_published: Boolean(post.is_published),
      is_featured: Boolean(post.is_featured),
      published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '',
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setFormData(defaultPostForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'title' && !prev.id) {
        next.slug = slugify(value);
      }

      return next;
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      alert('Title, slug, excerpt, and content are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: slugify(formData.slug),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        cover_image: formData.cover_image.trim(),
        seo_title: formData.seo_title.trim(),
        seo_description: formData.seo_description.trim(),
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
      };

      if (formData.id) {
        payload.id = formData.id;
      }

      const { error } = await supabase.from('blog_posts').upsert(payload);
      if (error) throw error;

      await fetchPosts();
      closeEditor();
      alert(formData.id ? 'Journal article updated successfully.' : 'Journal article created successfully.');
    } catch (error) {
      alert(
        `Error saving journal article: ${error.message}. If the table does not exist yet, run create_blog_posts.sql in Supabase first.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    const confirmed = window.confirm(`Delete "${post.title}"?`);
    if (!confirmed) return;

    setDeletingId(post.id);
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
      if (error) throw error;

      await fetchPosts();
    } catch (error) {
      alert(`Error deleting journal article: ${error.message}`);
    } finally {
      setDeletingId('');
    }
  };

  if (loading) return <div>Loading journal manager...</div>;

  return (
    <div className="marketing-page">
      <div className="page-header">
        <div>
          <h2>Journal Manager</h2>
          <p className="cms-page-subtitle">
            Create, edit, publish, and feature CHRONYX journal articles that feed the storefront.
          </p>
        </div>
        <button className="btn-primary marketing-action-btn" onClick={openNewEditor}>
          <Plus size={16} />
          New Article
        </button>
      </div>

      <section className="marketing-overview-grid">
        <StatCard label="Total Posts" value={posts.length} body="All journal articles in the system." />
        <StatCard label="Published" value={stats.published} body={`${stats.drafts} draft article(s) remain unpublished.`} />
        <StatCard label="Featured" value={stats.featured} body="Featured posts are prioritized on the journal landing page." />
      </section>

      {editorOpen ? (
        <form className="marketing-editor-card journal-editor-card" onSubmit={handleSave}>
          <div className="marketing-editor-header">
            <div>
              <h4>{formData.id ? 'Edit Journal Article' : 'Create Journal Article'}</h4>
              <p>Write the article once here and publish it directly to the customer-facing journal.</p>
            </div>
          </div>

          <div className="marketing-form-grid">
            <div className="marketing-form-two-col">
              <div>
                <label className="settings-label">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} />
              </div>
              <div>
                <label className="settings-label">Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="settings-label">Excerpt</label>
              <textarea rows={3} name="excerpt" value={formData.excerpt} onChange={handleChange} />
            </div>

            <div>
              <label className="settings-label">Article Body</label>
              <textarea rows={10} name="content" value={formData.content} onChange={handleChange} />
            </div>

            <div>
              <label className="settings-label">Cover Image URL</label>
              <input type="text" name="cover_image" value={formData.cover_image} onChange={handleChange} />
            </div>

            <div className="marketing-form-two-col">
              <div>
                <label className="settings-label">SEO Title</label>
                <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} />
              </div>
              <div>
                <label className="settings-label">Publish Date</label>
                <input type="datetime-local" name="published_at" value={formData.published_at} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="settings-label">SEO Description</label>
              <textarea rows={3} name="seo_description" value={formData.seo_description} onChange={handleChange} />
            </div>

            <div className="journal-toggle-grid">
              <label className="settings-toggle">
                <div className="settings-toggle-copy">
                  <span>Published</span>
                  <small>Visible on the storefront journal and article routes.</small>
                </div>
                <input
                  className="admin-toggle-input"
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                />
              </label>

              <label className="settings-toggle">
                <div className="settings-toggle-copy">
                  <span>Featured</span>
                  <small>Use this to prioritize one article in the journal hero area.</small>
                </div>
                <input
                  className="admin-toggle-input"
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="marketing-editor-actions">
              <button type="button" className="btn-secondary" onClick={closeEditor}>
                Cancel
              </button>
              <button type="submit" className="btn-primary marketing-action-btn" disabled={saving}>
                {saving ? 'Saving...' : formData.id ? 'Save Article' : 'Create Article'}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <section className="card marketing-card">
        <div className="marketing-section-header">
          <div>
            <h3>All Journal Articles</h3>
            <p>Manage publication status, featured priority, and storefront-facing content.</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="marketing-empty">
            No journal articles yet. Run `create_blog_posts.sql` in Supabase first if saving fails, then create your first post.
          </p>
        ) : (
          <div className="marketing-table-wrap">
            <table className="marketing-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td style={{ fontWeight: 600 }}>{post.title}</td>
                    <td>{post.slug}</td>
                    <td>
                      <span className={`marketing-status ${post.is_published ? 'is-active' : 'is-inactive'}`}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{post.is_featured ? 'Yes' : 'No'}</td>
                    <td>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not scheduled'}</td>
                    <td>
                      <div className="marketing-row-actions">
                        <button type="button" className="btn-secondary marketing-mini-btn" onClick={() => openEditEditor(post)}>
                          <NotePencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary marketing-mini-btn"
                          onClick={() => handleDelete(post)}
                          disabled={deletingId === post.id}
                        >
                          <Trash size={14} />
                          {deletingId === post.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Journal;
