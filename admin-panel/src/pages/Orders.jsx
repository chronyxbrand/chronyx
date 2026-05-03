import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CaretDown, DownloadSimple, Lightning, MagnifyingGlass, Printer, StackSimple } from '@phosphor-icons/react';
import { pdf } from '@react-pdf/renderer';
import { supabase } from '../lib/supabase';
import PackingSlipPDF from '../components/pdf/PackingSlipPDF';
import PackingSlipBatchPDF from '../components/pdf/PackingSlipBatchPDF';
import AuthenticityCertificatePDF from '../components/pdf/AuthenticityCertificatePDF';
import AuthenticityQrSheetPDF from '../components/pdf/AuthenticityQrSheetPDF';

const ORDER_STATUSES = ['all', 'processing', 'shipped', 'delivered', 'cancelled'];

function SummaryCard({ label, value }) {
  return (
    <div className="orders-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div ref={menuRef} className={`orders-status-menu ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className={`orders-status-trigger is-${value}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value}</span>
        <CaretDown size={14} className="orders-status-caret" />
      </button>

      {open ? (
        <div className="orders-status-popover">
          {ORDER_STATUSES.filter((status) => status !== 'all').map((status) => (
            <button
              key={status}
              type="button"
              className={status === value ? 'is-active' : ''}
              onClick={() => {
                onChange(status);
                setOpen(false);
              }}
            >
              {status}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [downloadingAuthFor, setDownloadingAuthFor] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    supabase.from('products').select('id, name, summary').then(({ data, error }) => {
      if (error) {
        console.error('Error fetching products for authenticity downloads:', error.message);
        return;
      }

      setProducts(data || []);
    });
  }, []);

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

  const printDocument = async (documentNode) => {
    const blob = await pdf(documentNode).toBlob();
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 60000);
    };
  };

  const downloadDocument = async (documentNode, fileName) => {
    const blob = await pdf(documentNode).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getOrderAuthUnits = async (orderId) => {
    const { data, error } = await supabase
      .from('product_auth_units')
      .select('*')
      .eq('order_id', orderId)
      .order('serial_number', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const handlePrintSlip = async (order) => {
    try {
      await printDocument(<PackingSlipPDF order={order} />);
    } catch (error) {
      console.error('Error generating print slip:', error);
      alert('Failed to generate packing slip');
    }
  };

  const handlePrintBatch = async (batchOrders, label) => {
    if (!batchOrders.length) return;

    try {
      await printDocument(<PackingSlipBatchPDF orders={batchOrders} />);
    } catch (error) {
      console.error(`Error generating ${label} slips:`, error);
      alert(`Failed to generate ${label} slips`);
    }
  };

  const handleDownloadCertificates = async (order) => {
    setDownloadingAuthFor(`${order.id}:cert`);

    try {
      const units = await getOrderAuthUnits(order.id);
      if (!units.length) {
        alert('No assigned authenticity certificates were found for this order yet.');
        return;
      }

      await downloadDocument(
        <AuthenticityCertificatePDF order={order} units={units} products={products} />,
        `CHRONYX_Authenticity_Certificates_${order.id.slice(0, 8).toUpperCase()}.pdf`,
      );
    } catch (error) {
      console.error('Error downloading authenticity certificates:', error.message);
      alert(`Failed to download authenticity certificates: ${error.message}`);
    } finally {
      setDownloadingAuthFor('');
    }
  };

  const handleDownloadQrSheet = async (order) => {
    setDownloadingAuthFor(`${order.id}:qr`);

    try {
      const units = await getOrderAuthUnits(order.id);
      if (!units.length) {
        alert('No assigned QR labels were found for this order yet.');
        return;
      }

      await downloadDocument(
        <AuthenticityQrSheetPDF order={order} units={units} />,
        `CHRONYX_QR_Sheet_${order.id.slice(0, 8).toUpperCase()}.pdf`,
      );
    } catch (error) {
      console.error('Error downloading authenticity QR sheet:', error.message);
      alert(`Failed to download QR sheet: ${error.message}`);
    } finally {
      setDownloadingAuthFor('');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find((item) => item.id === orderId);
      const oldStatus = order.status;

      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;

      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of order.items || []) {
          const { error: stockErr } = await supabase.rpc('increment_stock', {
            product_id: item.id,
            quantity: item.quantity,
          });
          if (stockErr) console.error('Failed to restock:', stockErr);
        }
      } else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
        for (const item of order.items || []) {
          const { error: stockErr } = await supabase.rpc('decrement_stock', {
            product_id: item.id,
            quantity: item.quantity,
          });
          if (stockErr) console.error('Failed to un-restock:', stockErr);
        }
      }

      setOrders((current) =>
        current.map((item) => (item.id === orderId ? { ...item, status: newStatus } : item)),
      );
    } catch (error) {
      console.error('Error updating status:', error.message);
      alert('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Amount', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...orders.map((order) =>
        [order.id, `"${order.customer_name}"`, order.customer_email, order.total_amount, order.status, order.created_at].join(','),
      ),
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

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = useMemo(() => {
    const processing = orders.filter((order) => order.status === 'processing').length;
    const shipped = orders.filter((order) => order.status === 'shipped').length;
    const delivered = orders.filter((order) => order.status === 'delivered').length;
    return { processing, shipped, delivered };
  }, [orders]);

  const latestOrder = orders[0] || null;
  const untouchedOrders = orders.filter((order) => order.status === 'processing');
  const latestFiveOrders = orders.slice(0, 5);

  return (
    <div className="orders-page">
      <div className="page-header orders-header">
        <div>
          <p className="settings-page-eyebrow">Operations</p>
          <h2>Orders</h2>
          <p className="orders-subtitle">A focused order queue for quick daily handling, status updates, and packing slip prints.</p>
        </div>
        <button className="btn-secondary orders-export-btn" onClick={handleExportCSV}>
          <DownloadSimple size={16} />
          Export CSV
        </button>
      </div>

      <div className="orders-summary-grid">
        <SummaryCard label="Visible Orders" value={orders.length} />
        <SummaryCard label="Processing" value={stats.processing} />
        <SummaryCard label="Shipped" value={stats.shipped} />
        <SummaryCard label="Delivered" value={stats.delivered} />
      </div>

      <div className="orders-quick-strip">
        <div className="orders-quick-copy">
          <p className="settings-page-eyebrow">Quick Slip Actions</p>
          <h3>Print common batches in one go</h3>
          <p>Use this for the newest order or untouched processing orders without opening each row manually.</p>
        </div>
        <div className="orders-quick-actions">
          <button
            className="btn-secondary orders-quick-btn"
            onClick={() => latestOrder && handlePrintSlip(latestOrder)}
            disabled={!latestOrder}
          >
            <Printer size={16} />
            Latest Slip
          </button>
          <button
            className="btn-secondary orders-quick-btn"
            onClick={() => handlePrintBatch(untouchedOrders, 'processing')}
            disabled={!untouchedOrders.length}
          >
            <Lightning size={16} />
            Print Processing
          </button>
          <button
            className="btn-secondary orders-quick-btn"
            onClick={() => handlePrintBatch(latestFiveOrders, 'latest')}
            disabled={!latestFiveOrders.length}
          >
            <StackSimple size={16} />
            Print Latest 5
          </button>
        </div>
      </div>

      <div className="card orders-list-card">
        <div className="orders-toolbar">
          <div className="orders-filter-row">
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={filter === status ? 'orders-filter-chip is-active' : 'orders-filter-chip'}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="orders-search">
            <MagnifyingGlass size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty-state">
            <p>No orders found for this view.</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <article key={order.id} className="orders-row">
                <div className="orders-row-main">
                  <div className="orders-id-block">
                    <small>Order</small>
                    <strong>{order.id.slice(0, 8)}</strong>
                  </div>

                  <div className="orders-customer-block">
                    <strong>{order.customer_name}</strong>
                    <span>{order.customer_email}</span>
                  </div>

                  <div className="orders-meta-block">
                    <small>Amount</small>
                    <strong>INR {Number(order.total_amount || order.total || 0).toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="orders-meta-block">
                    <small>Date</small>
                    <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
                  </div>
                </div>

                <div className="orders-row-side">
                  <StatusMenu value={order.status} onChange={(nextStatus) => handleStatusChange(order.id, nextStatus)} />

                  <div className="orders-row-actions">
                    <button
                      className="btn-secondary orders-print-btn"
                      onClick={() => handleDownloadCertificates(order)}
                    >
                      <DownloadSimple size={16} />
                      {downloadingAuthFor === `${order.id}:cert` ? 'Certificates...' : 'Certificates'}
                    </button>
                    <button
                      className="btn-secondary orders-print-btn"
                      onClick={() => handleDownloadQrSheet(order)}
                    >
                      <DownloadSimple size={16} />
                      {downloadingAuthFor === `${order.id}:qr` ? 'QR Sheet...' : 'QR Sheet'}
                    </button>
                  </div>

                  <button className="btn-secondary orders-print-btn" onClick={() => handlePrintSlip(order)}>
                    <Printer size={16} />
                    Print Slip
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
