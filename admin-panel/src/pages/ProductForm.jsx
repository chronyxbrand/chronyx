import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ImageUpload from '../components/ImageUpload';
import { CaretLeft, FloppyDisk } from '@phosphor-icons/react';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Wall Clocks',
    tags: '',
    stock_quantity: 10,
    is_live: false,
    is_limited_drop: false,
    drop_date: '',
    tagline: '',
    size: '',
    finish: '',
    material: '',
    movement_type: '',
    summary: '',
    story: '',
    care_instructions: '',
    features: ''
  });
  
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (productError) throw productError;

      const { data: productImages, error: imagesError } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', id)
        .order('sort_order', { ascending: true });

      if (imagesError) throw imagesError;

      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category || '',
        tags: product.tags ? product.tags.join(', ') : '',
        stock_quantity: product.stock_quantity,
        is_live: product.is_live,
        is_limited_drop: product.is_limited_drop,
        drop_date: product.drop_date ? new Date(product.drop_date).toISOString().slice(0, 16) : '',
        tagline: product.tagline || '',
        size: product.size || '',
        finish: product.finish || '',
        material: product.material || '',
        movement_type: product.movement_type || '',
        summary: product.summary || '',
        story: product.story || '',
        care_instructions: product.care_instructions ? product.care_instructions.join('\n') : '',
        features: product.features ? product.features.join('\n') : ''
      });
      
      setImages(productImages.map(img => img.image_url));

    } catch (error) {
      console.error('Error fetching product:', error.message);
      alert('Error loading product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Prepare product data
      const productPayload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        stock_quantity: Number(formData.stock_quantity),
        is_live: formData.is_live,
        is_limited_drop: formData.is_limited_drop,
        drop_date: formData.is_limited_drop && formData.drop_date ? new Date(formData.drop_date).toISOString() : null,
        tagline: formData.tagline,
        size: formData.size,
        finish: formData.finish,
        material: formData.material,
        movement_type: formData.movement_type,
        summary: formData.summary,
        story: formData.story,
        care_instructions: formData.care_instructions.split('\n').map(c => c.trim()).filter(Boolean),
        features: formData.features.split('\n').map(f => f.trim()).filter(Boolean)
      };

      let productId = id;

      // 2. Insert or Update Product
      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // 3. Update Images (Simple approach: delete all and re-insert)
      // Note: In production with many users, syncing is better than wipe/replace
      if (isEditing) {
        await supabase.from('product_images').delete().eq('product_id', productId);
      }

      if (images.length > 0) {
        const imagePayload = images.map((url, index) => ({
          product_id: productId,
          image_url: url,
          is_hero: index === 0,
          sort_order: index
        }));

        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imagePayload);
          
        if (imageError) throw imageError;
      }

      alert('Product saved successfully!');
      navigate('/products');

    } catch (error) {
      console.error('Error saving product:', error.message);
      alert('Error saving product: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => navigate('/products')}>
            <CaretLeft size={20} />
          </button>
          <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FloppyDisk size={20} /> {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Left Column: Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>General Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. The Singularitas" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tagline</label>
                <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="e.g. The Ultimate Minimalist Statement" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Summary</label>
                <textarea name="summary" value={formData.summary} onChange={handleChange} rows={2} placeholder="Short summary for the product page..."></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Story / Description</label>
                <textarea name="story" value={formData.story} onChange={handleChange} rows={4} placeholder="Full product story..."></textarea>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Specifications</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Size</label>
                <input type="text" name="size" value={formData.size} onChange={handleChange} placeholder="e.g. 46 cm" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Finish</label>
                <input type="text" name="finish" value={formData.finish} onChange={handleChange} placeholder="e.g. Black Walnut" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Material</label>
                <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="e.g. Black walnut, brushed brass" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Movement Type</label>
                <input type="text" name="movement_type" value={formData.movement_type} onChange={handleChange} placeholder="e.g. Silent Sweep Quartz" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Features (one per line)</label>
                <textarea name="features" value={formData.features} onChange={handleChange} rows={4} placeholder="Silent sweep movement&#10;Hand-oiled finish"></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Care Instructions (one per line)</label>
                <textarea name="care_instructions" value={formData.care_instructions} onChange={handleChange} rows={4} placeholder="Dust gently with a cloth.&#10;Avoid direct sunlight."></textarea>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Media</h3>
            <ImageUpload images={images} onImagesChange={setImages} />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Pricing & Inventory</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Stock Quantity</label>
                <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} min="0" required />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Organization & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Visibility</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" name="is_live" checked={formData.is_live} onChange={handleChange} style={{ width: 'auto' }} />
              <span style={{ fontWeight: formData.is_live ? 'bold' : 'normal', color: formData.is_live ? 'var(--success)' : 'inherit' }}>
                {formData.is_live ? 'Live on Store' : 'Draft (Hidden)'}
              </span>
            </label>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Organization</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Wall Clocks">Wall Clocks</option>
                  <option value="Desk Clocks">Desk Clocks</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. minimalist, ash wood, new" />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Drops & Marketing</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" name="is_limited_drop" checked={formData.is_limited_drop} onChange={handleChange} style={{ width: 'auto' }} />
                <span>Mark as Limited Edition Drop</span>
              </label>
              
              {formData.is_limited_drop && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Drop Date & Time</label>
                  <input type="datetime-local" name="drop_date" value={formData.drop_date} onChange={handleChange} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>This will enable the countdown timer and waitlist signup on the product page.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductForm;
