import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CurrencyInr, ShoppingCart, Users, TrendUp } from '@phosphor-icons/react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    lowStockItems: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total revenue & orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, status');
        
      const validOrders = ordersData?.filter(o => o.status !== 'cancelled') || [];
      const totalRevenue = validOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      
      // Fetch low stock items (less than 5)
      const { data: productsData } = await supabase
        .from('products')
        .select('id')
        .lt('stock_quantity', 5);

      // Fetch recent orders feed
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        revenue: totalRevenue,
        orders: validOrders.length,
        lowStockItems: productsData?.length || 0
      });
      
      setRecentOrders(recentOrdersData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Revenue</span>
            <CurrencyInr size={24} color="var(--accent-color)" />
          </div>
          <h3 style={{ fontSize: '1.8rem' }}>₹{stats.revenue.toLocaleString()}</h3>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Orders</span>
            <ShoppingCart size={24} color="var(--accent-color)" />
          </div>
          <h3 style={{ fontSize: '1.8rem' }}>{stats.orders}</h3>
        </div>

        <div className="card" style={{ border: stats.lowStockItems > 0 ? '1px solid var(--danger)' : '' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Low Stock Alerts</span>
            <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Action Required</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', color: stats.lowStockItems > 0 ? 'var(--danger)' : 'inherit' }}>
            {stats.lowStockItems} Items
          </h3>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Conversion Rate</span>
            <TrendUp size={24} color="var(--success)" />
          </div>
          <h3 style={{ fontSize: '1.8rem' }}>4.2%</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>+1.1% from last month</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '24px' }}>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{order.id.slice(0, 8)}...</td>
                  <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>₹{Number(order.total_amount).toLocaleString()}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: order.status === 'delivered' ? 'var(--success)' : 'inherit'
                    }}>
                      {order.status.toUpperCase()}
                    </span>
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

export default Dashboard;
