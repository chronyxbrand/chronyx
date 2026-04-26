import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MagnifyingGlass, DownloadSimple } from '@phosphor-icons/react';
import { pdf } from '@react-pdf/renderer';
import PackingSlipPDF from '../components/pdf/PackingSlipPDF';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const handlePrintSlip = async (order) => {
    try {
      const blob = await pdf(<PackingSlipPDF order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Optionally clean up after some time
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 60000); // 1 min buffer for print dialog
      };
    } catch (err) {
      console.error('Error generating print slip:', err);
      alert('Failed to generate packing slip');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const oldStatus = order.status;

      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      
      // Handle stock adjustments for cancellations
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of order.items || []) {
          const { error: stockErr } = await supabase.rpc('increment_stock', { product_id: item.id, quantity: item.quantity });
          if (stockErr) console.error('Failed to restock:', stockErr);
        }
      } else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
        for (const item of order.items || []) {
          const { error: stockErr } = await supabase.rpc('decrement_stock', { product_id: item.id, quantity: item.quantity });
          if (stockErr) console.error('Failed to un-restock:', stockErr);
        }
      }

      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating status:', error.message);
      alert('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Amount', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...orders.map(o => 
        [o.id, `"${o.customer_name}"`, o.customer_email, o.total_amount, o.status, o.created_at].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DownloadSimple size={16} /> Export CSV
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button 
                key={status}
                onClick={() => setFilter(status)}
                className={filter === status ? 'btn-primary' : 'btn-secondary'}
                style={{ textTransform: 'capitalize', padding: '6px 12px', fontSize: '0.9rem' }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '250px' }}>
            <MagnifyingGlass size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            <p>No orders found for this view.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{order.id.slice(0, 8)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.customer_email}</div>
                  </td>
                  <td>₹{Number(order.total_amount).toLocaleString()}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ 
                        padding: '4px 8px', 
                        width: 'auto',
                        fontSize: '0.8rem',
                        background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-base)',
                        borderColor: 'transparent',
                        color: order.status === 'delivered' ? 'var(--success)' : 'inherit'
                      }}
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-primary" onClick={() => handlePrintSlip(order)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                        Print Slip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;
