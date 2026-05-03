import React, { useEffect, useMemo, useState } from 'react';
import { NotePencil, Plus, Trash } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

const defaultCollectionForm = {
  id: '',
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  image_url: '',
  is_visible: true,
  is_featured_home: false,
  is_featured_shop: false,
  sort_order: 0,
  productIds: [],
};

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

function OverviewCard({ label, value, body }) {
  return (
    <div className="card marketing-overview-card">
      <p className="marketing-overview-label">{label}</p>
      <h3>{value}</h3>
      <p>{body}</p>
    </div>
  );
}

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [formData, setFormData] = useState(defaultCollectionForm);

  useEffect(() => {
    fetchCollectionsData();
  }, []);

  const fetchCollectionsData = async () => {
    setLoading(true);
    try {
      const [collectionsResult, productsResult] = await Promise.all([
        supabase
          .from('collections')
          .select('*, collection_products(product_id, sort_order)')
          .order('sort_order', { ascending: true }),
        supabase.from('products').select('id, name, category, is_live').order('name', { ascending: true }),
      ]);

      if (collectionsResult.error) throw collectionsResult.error;
      if (productsResult.error) throw productsResult.error;

      setCollections(collectionsResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error) {
      console.error('Error fetching collections:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const visible = collections.filter((collection) => collection.is_visible).length;
    const featuredHome = collections.filter((collection) => collection.is_featured_home).length;
    const featuredShop = collections.filter((collection) => collection.is_featured_shop).length;
    return { visible, featuredHome, featuredShop };
  }, [collections]);

  const openNewEditor = () => {
    setFormData(defaultCollectionForm);
    setEditorOpen(true);
  };

  const openEditEditor = (collection) => {
    setFormData({
      id: collection.id,
      title: collection.title || '',
      slug: collection.slug || '',
      subtitle: collection.subtitle || '',
      description: collection.description || '',
      image_url: collection.image_url || '',
      is_visible: Boolean(collection.is_visible),
      is_featured_home: Boolean(collection.is_featured_home),
      is_featured_shop: Boolean(collection.is_featured_shop),
      sort_order: collection.sort_order ?? 0,
      productIds: (collection.collection_products || [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((entry) => entry.product_id),
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setFormData(defaultCollectionForm);
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'title' && !prev.id) next.slug = slugify(value);
      return next;
    });
  };

  const toggleProductSelection = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      alert('Collection title and slug are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: slugify(formData.slug),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim(),
        is_visible: formData.is_visible,
        is_featured_home: formData.is_featured_home,
        is_featured_shop: formData.is_featured_shop,
        sort_order: Number(formData.sort_order || 0),
      };

      let collectionId = formData.id;

      if (formData.id) {
        const { error } = await supabase.from('collections').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('collections').insert(payload).select('id').single();
        if (error) throw error;
        collectionId = data.id;
      }

      const { error: deleteLinksError } = await supabase.from('collection_products').delete().eq('collection_id', collectionId);
      if (deleteLinksError) throw deleteLinksError;

      if (formData.productIds.length > 0) {
        const rows = formData.productIds.map((productId, index) => ({
          collection_id: collectionId,
          product_id: productId,
          sort_order: index,
        }));
        const { error: insertLinksError } = await supabase.from('collection_products').insert(rows);
        if (insertLinksError) throw insertLinksError;
      }

      await fetchCollectionsData();
      closeEditor();
      alert(formData.id ? 'Collection updated successfully.' : 'Collection created successfully.');
    } catch (error) {
      alert(`Error saving collection: ${error.message}. Run create_collections.sql in Supabase first if needed.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (collection) => {
    const confirmed = window.confirm(`Delete "${collection.title}"?`);
    if (!confirmed) return;

    setDeletingId(collection.id);
    try {
      const { error } = await supabase.from('collections').delete().eq('id', collection.id);
      if (error) throw error;
      await fetchCollectionsData();
    } catch (error) {
      alert(`Error deleting collection: ${error.message}`);
    } finally {
      setDeletingId('');
    }
  };

  if (loading) return <div>Loading collections...</div>;

  return (
    <div className="marketing-page">
      <div className="page-header">
        <div>
          <h2>Collections Manager</h2>
          <p className="cms-page-subtitle">
            Curate product groups for the homepage and shop experience without changing individual product records.
          </p>
        </div>
        <button className="btn-primary marketing-action-btn" onClick={openNewEditor}>
          <Plus size={16} />
          New Collection
        </button>
      </div>

      <section className="marketing-overview-grid">
        <OverviewCard label="Collections" value={collections.length} body={`${stats.visible} currently visible to customers.`} />
        <OverviewCard label="Homepage" value={stats.featuredHome} body="Collection(s) featured on the homepage curation area." />
        <OverviewCard label="Shop" value={stats.featuredShop} body="Collection(s) highlighted for shop discovery and filters." />
      </section>

      {editorOpen ? (
        <form className="marketing-editor-card journal-editor-card" onSubmit={handleSave}>
          <div className="marketing-editor-header">
            <div>
              <h4>{formData.id ? 'Edit Collection' : 'Create Collection'}</h4>
              <p>Define the collection details and choose which products belong inside it.</p>
            </div>
          </div>

          <div className="marketing-form-grid">
            <div className="marketing-form-two-col">
              <div>
                <label className="settings-label">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleFieldChange} />
              </div>
              <div>
                <label className="settings-label">Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleFieldChange} />
              </div>
            </div>

            <div>
              <label className="settings-label">Subtitle</label>
              <input type="text" name="subtitle" value={formData.subtitle} onChange={handleFieldChange} />
            </div>

            <div>
              <label className="settings-label">Description</label>
              <textarea rows={4} name="description" value={formData.description} onChange={handleFieldChange} />
            </div>

            <div className="marketing-form-two-col">
              <div>
                <label className="settings-label">Image URL</label>
                <input type="text" name="image_url" value={formData.image_url} onChange={handleFieldChange} />
              </div>
              <div>
                <label className="settings-label">Sort Order</label>
                <input type="number" name="sort_order" value={formData.sort_order} onChange={handleFieldChange} />
              </div>
            </div>

            <div className="journal-toggle-grid">
              <label className="settings-toggle">
                <div className="settings-toggle-copy">
                  <span>Visible</span>
                  <small>Collections must be visible to show up on the storefront.</small>
                </div>
                <input className="admin-toggle-input" type="checkbox" name="is_visible" checked={formData.is_visible} onChange={handleFieldChange} />
              </label>

              <label className="settings-toggle">
                <div className="settings-toggle-copy">
                  <span>Feature on homepage</span>
                  <small>Show this collection in the homepage curation strip.</small>
                </div>
                <input className="admin-toggle-input" type="checkbox" name="is_featured_home" checked={formData.is_featured_home} onChange={handleFieldChange} />
              </label>

              <label className="settings-toggle">
                <div className="settings-toggle-copy">
                  <span>Feature in shop</span>
                  <small>Make this collection easier to find in the shop experience.</small>
                </div>
                <input className="admin-toggle-input" type="checkbox" name="is_featured_shop" checked={formData.is_featured_shop} onChange={handleFieldChange} />
              </label>
            </div>

            <div>
              <label className="settings-label">Products in this Collection</label>
              <div className="collection-product-picker">
                {products.map((product) => (
                  <label key={product.id} className="collection-product-row">
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.category || 'Uncategorised'} {product.is_live ? '• Live' : '• Draft'}</small>
                    </div>
                    <input
                      className="admin-toggle-input"
                      type="checkbox"
                      checked={formData.productIds.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="marketing-editor-actions">
              <button type="button" className="btn-secondary" onClick={closeEditor}>
                Cancel
              </button>
              <button type="submit" className="btn-primary marketing-action-btn" disabled={saving}>
                {saving ? 'Saving...' : formData.id ? 'Save Collection' : 'Create Collection'}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <section className="card marketing-card">
        <div className="marketing-section-header">
          <div>
            <h3>All Collections</h3>
            <p>Manage merchandising groups and where they appear across the storefront.</p>
          </div>
        </div>

        {collections.length === 0 ? (
          <p className="marketing-empty">
            No collections yet. Run `create_collections.sql` in Supabase first if saving fails, then create your first collection.
          </p>
        ) : (
          <div className="marketing-table-wrap">
            <table className="marketing-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Visibility</th>
                  <th>Homepage</th>
                  <th>Shop</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection) => (
                  <tr key={collection.id}>
                    <td style={{ fontWeight: 600 }}>{collection.title}</td>
                    <td>{collection.slug}</td>
                    <td>
                      <span className={`marketing-status ${collection.is_visible ? 'is-active' : 'is-inactive'}`}>
                        {collection.is_visible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td>{collection.is_featured_home ? 'Yes' : 'No'}</td>
                    <td>{collection.is_featured_shop ? 'Yes' : 'No'}</td>
                    <td>{collection.collection_products?.length || 0}</td>
                    <td>
                      <div className="marketing-row-actions">
                        <button type="button" className="btn-secondary marketing-mini-btn" onClick={() => openEditEditor(collection)}>
                          <NotePencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary marketing-mini-btn"
                          onClick={() => handleDelete(collection)}
                          disabled={deletingId === collection.id}
                        >
                          <Trash size={14} />
                          {deletingId === collection.id ? 'Deleting...' : 'Delete'}
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

export default Collections;
