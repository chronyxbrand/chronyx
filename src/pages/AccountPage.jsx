import React, { useState, useEffect } from 'react';
import { User, Package, Heart, SignOut, DownloadSimple } from '@phosphor-icons/react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../components/pdf/InvoicePDF';

function AccountPage({ user }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      // Assuming user.email is used to track orders, or user.id
      // For now, let's just check the email against customer_email in orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="page-stack">
      <section className="page-header-panel">
        <p className="label">My Account</p>
        <h1>Welcome back.</h1>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className="secondary-btn" 
            style={{ justifyContent: 'flex-start', border: activeTab === 'orders' ? '1px solid var(--accent)' : '1px solid transparent', background: activeTab === 'orders' ? 'var(--surface-3)' : 'transparent' }}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} /> Order History
          </button>
          <button 
            className="secondary-btn" 
            style={{ justifyContent: 'flex-start', border: activeTab === 'profile' ? '1px solid var(--accent)' : '1px solid transparent', background: activeTab === 'profile' ? 'var(--surface-3)' : 'transparent' }}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile Settings
          </button>
          <Link className="secondary-btn" style={{ justifyContent: 'flex-start', border: '1px solid transparent', background: 'transparent' }} to="/shop?wishlist=true">
            <Heart size={18} /> Saved Items
          </Link>
          <button onClick={handleSignOut} className="secondary-btn" style={{ justifyContent: 'flex-start', border: '1px solid transparent', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}>
            <SignOut size={18} /> Sign Out
          </button>
        </aside>

        <section className="summary-panel" style={{ minHeight: '400px' }}>
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>Recent Orders</h2>
              
              {loadingOrders ? (
                <div style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ border: '1px solid var(--line)', borderRadius: '16px', padding: '32px', marginTop: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  You haven't placed any orders yet.
                </div>
              ) : (
                orders.map(order => {
                  const displayId = order.id ? `KRX-2025-${order.id.slice(0, 8).toUpperCase()}` : 'XXXX';
                  return (
                    <div key={order.id} style={{ border: '1px solid var(--line)', borderRadius: '16px', padding: '16px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '12px' }}>
                        <strong>Order #{displayId}</strong>
                        <span style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{order.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <strong>{order.items?.length || 1} Item(s)</strong>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <PDFDownloadLink
                          document={<InvoicePDF order={order} />}
                          fileName={`Chronyx_Invoice_${displayId}.pdf`}
                          style={{ textDecoration: 'none' }}
                        >
                          {({ loading }) => (
                            <button className="secondary-btn" style={{ fontSize: '0.8rem', padding: '6px 12px' }} disabled={loading}>
                              <DownloadSimple size={16} style={{ marginRight: '6px' }} /> {loading ? 'Loading...' : 'Invoice'}
                            </button>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 0 }}>Profile Details</h2>
              <form className="form-grid" style={{ marginTop: '24px' }} onSubmit={(e) => e.preventDefault()}>
                <label className="full-span">
                  Email Address (Verified)
                  <input type="email" value={user.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your email is managed by your authentication provider.</p>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AccountPage;
