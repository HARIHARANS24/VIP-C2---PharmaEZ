import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUsers, FiPackage, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import api from '../../utils/api';
import './AdminPages.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/admin/stats').then(r => setStats(r.data.stats)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!stats) return <p>Failed to load stats</p>;

  const statusColors = { placed:'#2196f3',confirmed:'#3f51b5',processing:'#ff9800',shipped:'#00bcd4',delivered:'#4caf50',cancelled:'#f44336' };
  const orderStatusMap = {};
  stats.ordersByStatus?.forEach(s => { orderStatusMap[s._id] = s.count; });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with PharmaEZ today.</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: <FiPackage size={22}/>, color: '#e3f2fd', iconColor: '#1565c0' },
          { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toFixed(2)}`, icon: <FiTrendingUp size={22}/>, color: '#e8f5e9', iconColor: '#2e7d32' },
          { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers size={22}/>, color: '#f3e5f5', iconColor: '#7b1fa2' },
          { label: 'Total Products', value: stats.totalProducts, icon: <FiShoppingBag size={22}/>, color: '#fff3e0', iconColor: '#e65100' },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card" style={{'--kpi-bg': kpi.color}}>
            <div className="kpi-icon" style={{background: kpi.color, color: kpi.iconColor}}>{kpi.icon}</div>
            <div>
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="admin-grid-2">
        <div className="admin-card">
          <h3 className="admin-card-title">Orders by Status</h3>
          <div className="status-bars">
            {Object.entries(orderStatusMap).map(([status, count]) => (
              <div key={status} className="status-bar-row">
                <span className="status-bar-label" style={{color: statusColors[status] || '#333'}}>{status}</span>
                <div className="status-bar-track">
                  <div className="status-bar-fill" style={{width:`${(count/stats.totalOrders*100)||0}%`, background: statusColors[status] || '#333'}} />
                </div>
                <span className="status-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart (7 days) */}
        <div className="admin-card">
          <h3 className="admin-card-title">Revenue (Last 7 Days)</h3>
          <div className="revenue-bars">
            {stats.revenueByDay?.map((day, i) => {
              const maxRev = Math.max(...stats.revenueByDay.map(d=>d.revenue), 1);
              return (
                <div key={i} className="rev-bar-col">
                  <span className="rev-bar-amount">₹{Math.round(day.revenue)}</span>
                  <div className="rev-bar-track">
                    <div className="rev-bar-fill" style={{height:`${(day.revenue/maxRev*100)||2}%`}} />
                  </div>
                  <span className="rev-bar-date">{day._id?.slice(5)}</span>
                </div>
              );
            })}
            {stats.revenueByDay?.length === 0 && <p className="text-muted">No revenue data yet</p>}
          </div>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* Recent Orders */}
        <div className="admin-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 className="admin-card-title" style={{marginBottom:0}}>Recent Orders</h3>
            <Link to="/admin/orders" style={{fontSize:13,color:'var(--primary)',fontWeight:600}}>View All →</Link>
          </div>
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentOrders?.map(order => (
                <tr key={order._id}>
                  <td><Link to={`/admin/orders`} style={{color:'var(--primary)',fontWeight:600}}>#{order.orderNumber}</Link></td>
                  <td>{order.user?.name}</td>
                  <td>₹{order.totalPrice?.toFixed(2)}</td>
                  <td><span className={`badge-status status-${order.orderStatus}`}>{order.orderStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alert */}
        <div className="admin-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 className="admin-card-title" style={{marginBottom:0}}><FiAlertTriangle size={15} style={{color:'#f59e0b',marginRight:6}} />Low Stock Alert</h3>
            <Link to="/admin/inventory" style={{fontSize:13,color:'var(--primary)',fontWeight:600}}>View All →</Link>
          </div>
          {stats.lowStock?.length === 0 ? (
            <p className="text-muted">All products are well-stocked! ✅</p>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Category</th><th>Stock</th></tr></thead>
              <tbody>
                {stats.lowStock?.map(p => (
                  <tr key={p._id}>
                    <td>{p.name.substring(0,24)}...</td>
                    <td><span style={{fontSize:12,color:'var(--text-muted)'}}>{p.category}</span></td>
                    <td><span style={{color:p.stock===0?'var(--danger)':'#f59e0b',fontWeight:700}}>{p.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
