import React, { useState } from 'react';
import { X, Star } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

function ReviewModal({ order, user, onClose, onReviewSubmitted }) {
  let parsedItems = [];
  try {
    parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  } catch (e) {
    console.error('Failed to parse order items', e);
  }

  const [selectedProduct, setSelectedProduct] = useState(
    parsedItems.length === 1 ? parsedItems[0] : null
  );
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const itemsToReview = parsedItems;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a product to review.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      // Fetch customer profile to get the name
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
        status: 'approved' // Automatically approved for verified purchasers
      };

      const { error: insertError } = await supabase
        .from('product_reviews')
        .insert([payload]);

      if (insertError) throw insertError;

      onReviewSubmitted(selectedProduct.id);
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', width: '90%', padding: '32px' }}>
        <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Rate & Review</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Share your experience to help others choose their Chronyx piece.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'var(--danger)', color: '#fff', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {itemsToReview.length > 1 && !selectedProduct && (
            <div>
              <label className="label" style={{ marginBottom: '12px', display: 'block' }}>Select Product</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {itemsToReview.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedProduct(item)}
                    style={{ 
                      padding: '16px', 
                      border: '1px solid var(--line)', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', background: 'var(--surface-3)', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={item.hero} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <strong>{item.name}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedProduct && (
            <>
              {itemsToReview.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{selectedProduct.name}</strong>
                  <button type="button" onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Change
                  </button>
                </div>
              )}
              
              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block', textAlign: 'center' }}>Overall Rating</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star 
                        size={40} 
                        weight={(hoverRating || rating) >= star ? 'fill' : 'regular'} 
                        color={(hoverRating || rating) >= star ? 'var(--accent)' : 'var(--muted)'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Your Review (Optional)</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What do you love about this piece? How does it look in your space?"
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--line)', 
                    borderRadius: '12px', 
                    color: 'var(--text-primary)',
                    minHeight: '120px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button type="submit" className="primary-btn" disabled={submitting} style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
