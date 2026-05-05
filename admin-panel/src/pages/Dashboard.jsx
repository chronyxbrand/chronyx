import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ChartLineUp,
  ChatCircleDots,
  ClockCounterClockwise,
  CurrencyInr,
  Package,
  ShoppingCart,
  WarningCircle,
} from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short' });
const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

function formatCurrency(value) {
  return `INR ${Number(value || 0).toLocaleString('en-IN')}`;
}

function StatCard({ label, value, meta, icon, tone = 'default' }) {
  return (
    <div className={`card dashboard-stat-card ${tone !== 'default' ? `is-${tone}` : ''}`}>
      <div className="dashboard-stat-top">
        <span>{label}</span>
        <div className="dashboard-stat-icon">{icon}</div>
      </div>
      <h3>{value}</h3>
      <p>{meta}</p>
    </div>
  );
}

function LineChart({ data }) {
  if (!data.length) return <div className="dashboard-chart-empty">No revenue data yet.</div>;

  const width = 520;
  const height = 220;
  const padding = 18;
  const max = Math.max(...data.map((item) => item.value), 1);
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data
    .map((item, index) => {
      const x = padding + stepX * index;
      const y = height - padding - (item.value / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="dashboard-chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} className="dashboard-line-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dashboardArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(200, 147, 90, 0.34)" />
            <stop offset="100%" stopColor="rgba(200, 147, 90, 0.02)" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#dashboardArea)" />
        <polyline points={points} fill="none" stroke="#c8935a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const x = padding + stepX * index;
          const y = height - padding - (item.value / max) * (height - padding * 2);
          return <circle key={item.label} cx={x} cy={y} r="4" fill="#f6efe4" stroke="#c8935a" strokeWidth="2" />;
        })}
      </svg>
      <div className="dashboard-chart-labels">
        {data.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{formatCurrency(item.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarList({ items, total }) {
  if (!items.length) return <div className="dashboard-chart-empty">No status data yet.</div>;

  return (
    <div className="dashboard-bar-list">
      {items.map((item) => {
        const percent = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <div key={item.label} className="dashboard-bar-row">
            <div className="dashboard-bar-copy">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="dashboard-bar-track">
              <div className="dashboard-bar-fill" style={{ width: `${Math.max(percent, item.value ? 8 : 0)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function safeNumber(...values) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersResult, productsResult, waitlistResult, subscribersResult, contactsResult] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('waitlist').select('*').order('created_at', { ascending: false }),
        supabase.from('subscribers').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      ]);

      if (!ordersResult.error) setOrders(ordersResult.data || []);
      if (!productsResult.error) setProducts(productsResult.data || []);
      if (!waitlistResult.error) setWaitlist(waitlistResult.data || []);
      if (!subscribersResult.error) setSubscribers(subscribersResult.data || []);
      if (!contactsResult.error) setContacts(contactsResult.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== 'cancelled');
    const revenue = activeOrders.reduce((sum, order) => sum + safeNumber(order.total_amount, order.total), 0);
    const averageOrderValue = activeOrders.length ? revenue / activeOrders.length : 0;

    const statusMap = activeOrders.reduce((acc, order) => {
      const key = order.status || 'processing';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusMap).map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
    }));

    const monthlyRevenueMap = new Map();
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyRevenueMap.set(key, {
        label: monthFormatter.format(date),
        value: 0,
      });
    }

    activeOrders.forEach((order) => {
      const createdAt = order.created_at ? new Date(order.created_at) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      if (!monthlyRevenueMap.has(key)) return;
      monthlyRevenueMap.get(key).value += safeNumber(order.total_amount, order.total);
    });

    const recentOrders = orders.slice(0, 6);

    const lowStockProducts = products
      .map((product) => ({
        id: product.id,
        name: product.name,
        stock: safeNumber(product.stock_quantity, product.stock),
        category: product.category || 'Uncategorised',
      }))
      .filter((product) => product.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);

    const unreadContacts = contacts.filter((message) => !message.is_read).length;
    const newsletterAudience = subscribers.length;
    const waitlistAudience = waitlist.length;
    const publishedProducts = products.filter((product) => product.is_live ?? product.is_visible ?? true).length;

    return {
      revenue,
      averageOrderValue,
      orders: activeOrders.length,
      monthlyRevenue: Array.from(monthlyRevenueMap.values()),
      statusData,
      lowStockProducts,
      unreadContacts,
      newsletterAudience,
      waitlistAudience,
      publishedProducts,
      recentOrders,
    };
  }, [orders, products, waitlist, subscribers, contacts]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="cms-page-subtitle">
            Live performance, order health, customer signals, and inventory pressure from your current store data.
          </p>
        </div>
      </div>

      <section className="dashboard-stat-grid">
        <StatCard
          label="Revenue"
          value={formatCurrency(analytics.revenue)}
          meta={`${analytics.orders} active order(s) tracked`}
          icon={<CurrencyInr size={18} />}
        />
        <StatCard
          label="Average Order Value"
          value={formatCurrency(analytics.averageOrderValue)}
          meta="Based on non-cancelled orders"
          icon={<ChartLineUp size={18} />}
        />
        <StatCard
          label="Unread Contacts"
          value={analytics.unreadContacts}
          meta="Messages needing follow-up from the storefront"
          icon={<ChatCircleDots size={18} />}
          tone={analytics.unreadContacts > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Low Stock Alerts"
          value={analytics.lowStockProducts.length}
          meta={`${analytics.publishedProducts} product(s) currently live`}
          icon={<WarningCircle size={18} />}
          tone={analytics.lowStockProducts.length > 0 ? 'danger' : 'default'}
        />
      </section>

      <section className="dashboard-main-grid">
        <div className="card dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-eyebrow">Sales Trend</p>
              <h3>Revenue over the last 6 months</h3>
            </div>
            <span className="dashboard-chip">Live orders data</span>
          </div>
          <LineChart data={analytics.monthlyRevenue} />
        </div>

        <div className="card dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-eyebrow">Order Health</p>
              <h3>Status distribution</h3>
            </div>
            <span className="dashboard-chip">{analytics.orders} total</span>
          </div>
          <BarList items={analytics.statusData} total={analytics.orders} />
        </div>
      </section>

      <section className="dashboard-secondary-grid">
        <div className="card dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-eyebrow">Audience Signals</p>
              <h3>Customer interest snapshot</h3>
            </div>
          </div>
          <div className="dashboard-audience-grid">
            <div className="dashboard-mini-metric">
              <span>Newsletter</span>
              <strong>{analytics.newsletterAudience}</strong>
            </div>
            <div className="dashboard-mini-metric">
              <span>Waitlist</span>
              <strong>{analytics.waitlistAudience}</strong>
            </div>
            <div className="dashboard-mini-metric">
              <span>Unread contacts</span>
              <strong>{analytics.unreadContacts}</strong>
            </div>
          </div>
        </div>

        <div className="card dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-eyebrow">Inventory Pressure</p>
              <h3>Products needing attention</h3>
            </div>
          </div>
          {analytics.lowStockProducts.length === 0 ? (
            <div className="dashboard-chart-empty">No low-stock products right now.</div>
          ) : (
            <div className="dashboard-alert-list">
              {analytics.lowStockProducts.map((product) => (
                <div key={product.id} className="dashboard-alert-row">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>
                  <b>{product.stock} left</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-main-grid">
        <div className="card dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-eyebrow">Recent Orders</p>
              <h3>Latest customer activity</h3>
            </div>
          </div>
          {analytics.recentOrders.length === 0 ? (
            <div className="dashboard-chart-empty">No orders yet.</div>
          ) : (
            <div className="dashboard-order-list">
              {analytics.recentOrders.map((order) => (
                <div key={order.id} className="dashboard-order-row">
                  <div>
                    <strong>{order.customer_name || 'Guest checkout'}</strong>
                    <span>{dateFormatter.format(new Date(order.created_at))}</span>
                  </div>
                  <div className="dashboard-order-side">
                    <b>{formatCurrency(safeNumber(order.total_amount, order.total))}</b>
                    <span className={`dashboard-status-pill is-${order.status || 'processing'}`}>
                      {String(order.status || 'processing').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-eyebrow">Operations Pulse</p>
              <h3>What matters right now</h3>
            </div>
          </div>
          <div className="dashboard-activity-list">
            <div className="dashboard-activity-item">
              <div className="dashboard-activity-icon"><ShoppingCart size={16} /></div>
              <div>
                <strong>{analytics.orders} confirmed order(s)</strong>
                <span>Current non-cancelled order count across the store.</span>
              </div>
            </div>
            <div className="dashboard-activity-item">
              <div className="dashboard-activity-icon"><Package size={16} /></div>
              <div>
                <strong>{analytics.publishedProducts} visible product(s)</strong>
                <span>Products currently available or visible from product data.</span>
              </div>
            </div>
            <div className="dashboard-activity-item">
              <div className="dashboard-activity-icon"><ClockCounterClockwise size={16} /></div>
              <div>
                <strong>{analytics.waitlistAudience + analytics.newsletterAudience} audience leads</strong>
                <span>Combined waitlist and subscriber interest waiting for the next drop.</span>
              </div>
            </div>
            <div className="dashboard-activity-item">
              <div className="dashboard-activity-icon"><ArrowUpRight size={16} /></div>
              <div>
                <strong>{analytics.unreadContacts} unresolved message(s)</strong>
                <span>Customer service follow-ups waiting in the new contact inbox.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
