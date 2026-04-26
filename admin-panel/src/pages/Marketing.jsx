import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Tag, EnvelopeSimple } from '@phosphor-icons/react';

const Marketing = () => {
  const [coupons, setCoupons] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      const { data: couponsData } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      const { data: waitlistData } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false });
      
      setCoupons(couponsData || []);
      setWaitlist(waitlistData || []);
    } catch (error) {
      console.error('Error fetching marketing data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Marketing & Promotions</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Discount Codes */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Discount Codes</h3>
            <button className="btn-secondary" onClick={() => alert('Coupon generator coming soon.')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}>
              <Plus size={16} /> New Coupon
            </button>
          </div>
          
          {coupons.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No active coupons.</p>
          ) : (
            <table style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr key={coupon.id}>
                    <td style={{ fontWeight: 'bold' }}><Tag size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{coupon.code}</td>
                    <td>{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</td>
                    <td>
                      <span style={{ color: coupon.is_active ? 'var(--success)' : 'var(--danger)' }}>
                        {coupon.is_active ? 'Active' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Waitlist / Newsletter */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Waitlist & Newsletter</h3>
            <button className="btn-secondary" onClick={() => alert('Email integration coming soon.')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}>
              <EnvelopeSimple size={16} /> Send Email Blast
            </button>
          </div>
          
          {waitlist.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No subscribers yet.</p>
          ) : (
            <table style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Date Joined</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map(subscriber => (
                  <tr key={subscriber.id}>
                    <td>{subscriber.email}</td>
                    <td>
                      <span style={{ padding: '2px 6px', background: 'var(--bg-base)', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {subscriber.is_newsletter ? 'Newsletter' : 'Product Waitlist'}
                      </span>
                    </td>
                    <td>{new Date(subscriber.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default Marketing;
