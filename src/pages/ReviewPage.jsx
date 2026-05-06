import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Star, CaretLeft } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

function ReviewPage({ user }) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReviewId, setExistingReviewId] = useState('');
  const [loadingExistingReview, setLoadingExistingReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [wasUpdate, setWasUpdate] = useState(false);

  useEffect(() => {
    if (!user) return; // Will be redirected

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        
        if (data.customer_email !== user.email) {
          throw new Error('You are not authorized to review this order.');
        }

        if (data.status !== 'delivered') {
          throw new Error('You can only review delivered orders.');
        }

        setOrder(data);
        
        let parsedItems = [];
        try {
          parsedItems = typeof data.items === 'string' ? JSON.parse(data.items) : (data.items || []);
        } catch (e) {
          console.error('Failed to parse order items', e);
        }

        if (parsedItems.length === 1) {
          setSelectedProduct(parsedItems[0]);
        }

      } catch (err) {
        setError(err.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  useEffect(() => {
    if (!user || !selectedProduct?.id) {
      setExistingReviewId('');
      setRating(5);
      setComment('');
      return;
    }

    const fetchExistingReview = async () => {
      setLoadingExistingReview(true);
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('id, rating, comment')
          .eq('product_id', selectedProduct.id)
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setExistingReviewId(data.id);
          setRating(data.rating || 5);
          setComment(data.comment || '');
        } else {
          setExistingReviewId('');
          setRating(5);
          setComment('');
        }
      } catch (err) {
        console.error('Error loading existing review:', err);
        setExistingReviewId('');
      } finally {
        setLoadingExistingReview(false);
      }
    };

    fetchExistingReview();
  }, [selectedProduct?.id, user]);

  if (!user) {
    return <Navigate to={`/auth?returnTo=/review/${orderId}`} replace />;
  }

  if (loading) {
    return (
      <div className="page-stack" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--muted)' }}>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-stack" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ maxWidth: '500px', textAlign: 'center', padding: '40px', background: 'var(--surface-2)', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Cannot Load Review</h2>
          <p style={{ color: 'var(--danger)', marginBottom: '24px' }}>{error}</p>
          <Link to="/account" className="primary-btn" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            Return to Account
          </Link>
        </div>
      </div>
    );
  }

  const itemsToReview = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a product to review.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const { data: profileData } = await supabase
        .from('customers')
        .select('name')
        .eq('email', user.email)
        .maybeSingle();
      
      const customerName = profileData?.name || user.email.split('@')[0];

      const payload = {
        product_id: selectedProduct.id,
        customer_email: user.email,
        customer_name: customerName,
        rating: rating,
        comment: comment.trim() || null,
        status: 'approved'
      };

      const { error: saveError } = existingReviewId
        ? await supabase
            .from('product_reviews')
            .update(payload)
            .eq('id', existingReviewId)
            .eq('customer_email', user.email)
        : await supabase
            .from('product_reviews')
            .insert([payload]);

      if (saveError) throw saveError;

      setWasUpdate(Boolean(existingReviewId));
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="page-stack" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '48px 32px', background: 'var(--surface-2)', borderRadius: '24px' }}>
          <Star size={48} weight="fill" color="var(--accent)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>{wasUpdate ? 'Review Updated' : 'Thank You!'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
            Your review for the {selectedProduct?.name} has been {wasUpdate ? 'updated' : 'published'} successfully. We appreciate your feedback.
          </p>
          <Link to={`/products/${selectedProduct?.id}`} className="primary-btn" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            View Product Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack" style={{ alignItems: 'center', padding: '40px 24px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>
        <Link to="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '32px' }}>
          <CaretLeft size={16} /> Back to Orders
        </Link>
        
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Share your experience</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your feedback helps our artisans refine their craft and guides other collectors.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--surface-2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {itemsToReview.length > 1 && !selectedProduct && (
            <div>
              <label className="label" style={{ marginBottom: '16px', display: 'block' }}>Which piece would you like to review?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {itemsToReview.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedProduct(item)}
                    style={{ 
                      padding: '16px', 
                      border: '1px solid var(--line)', 
                      borderRadius: '16px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: 'var(--surface)'
                    }}
                  >
                    {item.hero && (
                      <div style={{ width: '56px', height: '56px', background: 'var(--surface-3)', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={item.hero} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <strong style={{ fontSize: '1.1rem' }}>{item.name}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedProduct && (
            <>
              {itemsToReview.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {selectedProduct.hero && (
                      <img src={selectedProduct.hero} alt={selectedProduct.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <strong style={{ fontSize: '1.1rem' }}>{selectedProduct.name}</strong>
                  </div>
                  <button type="button" onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Change
                  </button>
                </div>
              )}

              {loadingExistingReview ? (
                <p style={{ margin: 0, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Checking for your existing review...
                </p>
              ) : existingReviewId ? (
                <p style={{ margin: 0, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  You already reviewed this piece. Editing here will update your existing review.
                </p>
              ) : null}
              
              <div>
                <label className="label" style={{ marginBottom: '16px', display: 'block', textAlign: 'center' }}>Overall Rating</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 0.1s' }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Star 
                        size={48} 
                        weight={(hoverRating || rating) >= star ? 'fill' : 'regular'} 
                        color={(hoverRating || rating) >= star ? 'var(--accent)' : 'var(--muted)'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" style={{ marginBottom: '12px', display: 'block' }}>Your Review (Optional)</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What do you love about this piece? How does it look in your space?"
                  style={{ 
                    width: '100%', 
                    padding: '20px', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--line)', 
                    borderRadius: '16px', 
                    color: 'var(--text-primary)',
                    minHeight: '140px',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    resize: 'vertical',
                    lineHeight: '1.6'
                  }}
                />
              </div>

              <button type="submit" className="primary-btn" disabled={submitting || loadingExistingReview} style={{ width: '100%', padding: '18px', display: 'flex', justifyContent: 'center', fontSize: '1.05rem' }}>
                {submitting ? 'Saving Review...' : existingReviewId ? 'Update Review' : 'Publish Review'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default ReviewPage;
