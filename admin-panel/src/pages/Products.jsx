import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Package, PencilSimple, Plus, Sparkle, Trash } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { buildPublicProductId } from '../lib/productIdentity';

function ProductStat({ label, value, body }) {
  return (
    <div className="catalog-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{body}</p>
    </div>
  );
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(image_url, is_hero, sort_order)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error.message);
      alert('Error deleting product');
    }
  };

  const stats = useMemo(() => {
    const live = products.filter((product) => product.is_live).length;
    const draft = products.length - live;
    const lowStock = products.filter((product) => Number(product.stock_quantity || 0) <= 5).length;
    return { live, draft, lowStock };
  }, [products]);

  return (
    <div className="catalog-page">
      <div className="page-header catalog-header">
        <div>
          <p className="settings-page-eyebrow">Catalog</p>
          <h2>Products</h2>
          <p className="catalog-subtitle">
            Manage the storefront assortment, review inventory health, and jump into editing with visual context.
          </p>
        </div>
        <button className="btn-primary catalog-create-btn" onClick={() => navigate('/products/new')}>
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="catalog-stat-grid">
        <ProductStat label="Total Products" value={products.length} body="Every item currently stored in the catalog." />
        <ProductStat label="Live on Store" value={stats.live} body="Visible to customers on the storefront." />
        <ProductStat label="Draft Items" value={stats.draft} body="Still hidden while you continue refining them." />
        <ProductStat label="Low Stock" value={stats.lowStock} body="Products with five units or fewer remaining." />
      </div>

      <div className="card catalog-list-card">
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <div className="catalog-empty-state">
            <p>No products found.</p>
            <p>Click “Add Product” to create your first item.</p>
          </div>
        ) : (
          <div className="catalog-product-list">
            {products.map((product) => {
              const images = [...(product.product_images || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
              const heroImage =
                images.find((image) => image.is_hero)?.image_url ||
                images[0]?.image_url ||
                '';

              return (
                <article key={product.id} className="catalog-product-row">
                  <div className="catalog-product-main">
                    <div className="catalog-product-thumb">
                      {heroImage ? (
                        <img src={heroImage} alt={product.name} />
                      ) : (
                        <div className="catalog-product-thumb-empty">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    <div className="catalog-product-copy">
                      <div className="catalog-product-head">
                        <h3>{product.name}</h3>
                        <span className={`catalog-status-pill ${product.is_live ? 'is-live' : 'is-draft'}`}>
                          {product.is_live ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <div className="catalog-product-id">{buildPublicProductId(product.id)}</div>
                      <p>{product.summary || product.description || 'No short summary added yet.'}</p>
                      <div className="catalog-product-meta">
                        <span>{product.category || 'Uncategorized'}</span>
                        <span>INR {Number(product.price || 0).toLocaleString('en-IN')}</span>
                        <span>{product.stock_quantity} in stock</span>
                        <span>{images.length} image{images.length === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="catalog-product-side">
                    <div className="catalog-chip-list">
                      <span className="catalog-chip">
                        <Eye size={14} />
                        {product.is_live ? 'Storefront visible' : 'Hidden from storefront'}
                      </span>
                      <span className={`catalog-chip ${Number(product.stock_quantity || 0) <= 5 ? 'is-warning' : ''}`}>
                        <Sparkle size={14} />
                        {Number(product.stock_quantity || 0) <= 5 ? 'Low stock' : 'Healthy stock'}
                      </span>
                    </div>

                    <div className="catalog-actions">
                      <button className="btn-secondary" onClick={() => navigate(`/products/${product.id}`)}>
                        <PencilSimple size={18} />
                        Edit
                      </button>
                      <button className="btn-secondary catalog-delete-btn" onClick={() => deleteProduct(product.id)}>
                        <Trash size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
