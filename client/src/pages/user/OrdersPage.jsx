import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './UserPages.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusClass = (s) => `order-status status-${s}`;

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="user-page">
      <div className="container">
        <h1 className="page-title">My Orders ({orders.length})</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div style={{fontSize:64}}>📦</div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <Link to="/products" className="btn btn-primary mt-3">Browse Products</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
                <div className="order-card-header">
                  <div>
                    <p className="order-number">#{order.orderNumber}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                  </div>
                  <span className={statusClass(order.orderStatus)}>{order.orderStatus}</span>
                </div>
                <div className="order-items-preview">
                  {order.items?.slice(0,3).map((item, i) => (
                    <span key={i} className="order-item-name">{item.name.substring(0,20)}</span>
                  ))}
                  {order.items?.length > 3 && <span className="order-item-name">+{order.items.length-3} more</span>}
                </div>
                <div className="order-card-footer">
                  <span className="order-total">₹{order.totalPrice?.toFixed(2)}</span>
                  <span style={{fontSize:13, color:'var(--text-secondary)'}}>
                    {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
