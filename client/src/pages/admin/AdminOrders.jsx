import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const STATUSES = ['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter !== 'all') params.set('status', filter);
      if (search) params.set('search', search);
      const res = await api.get(`/orders/admin/all?${params}`);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter, page]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await api.put(`/orders/admin/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(res.data.order);
      toast.success(`Order status updated to "${status}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setUpdatingId(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Orders</h1>
        <p>Manage all customer orders ({total} total)</p>
      </div>

      {/* Filters */}
      <div className="orders-filter-bar">
        {STATUSES.map(s => (
          <button key={s} className={`filter-pill ${filter === s ? 'active' : ''}`} onClick={() => { setFilter(s); setPage(1); }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="admin-toolbar" style={{ marginBottom: 16 }}>
        <form className="admin-search" onSubmit={e => { e.preventDefault(); fetchOrders(); }}>
          <input placeholder="Search by order number..." value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit">🔍</button>
        </form>
      </div>

      <div className="admin-grid-2" style={{ gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr' }}>
        {/* Orders Table */}
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer', background: selectedOrder?._id === order._id ? 'var(--primary-light)' : '' }}>
                      <td><span style={{ color: 'var(--primary)', fontWeight: 700 }}>#{order.orderNumber}</span></td>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{order.user?.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.user?.email}</p>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize: 13 }}>{order.items?.length} items</td>
                      <td style={{ fontWeight: 700 }}>₹{order.totalPrice?.toFixed(2)}</td>
                      <td>
                        <span style={{ fontSize: 12, background: order.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7', color: order.paymentStatus === 'paid' ? '#065f46' : '#92400e', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          {order.paymentMethod?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <select
                          value={order.orderStatus}
                          onChange={e => { e.stopPropagation(); handleStatusUpdate(order._id, e.target.value); }}
                          disabled={updatingId === order._id}
                          className={`badge-status status-${order.orderStatus}`}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
                          onClick={e => e.stopPropagation()}
                        >
                          {['placed','confirmed','processing','shipped','delivered','cancelled','returned'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); setSelectedOrder(selectedOrder?._id === order._id ? null : order); }}>
                          {selectedOrder?._id === order._id ? 'Close' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No orders found</p>}
              {pages > 1 && (
                <div className="pagination" style={{ marginTop: 16 }}>
                  <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {pages}</span>
                  <button className="page-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div className="admin-card order-detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>#{selectedOrder.orderNumber}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="info-block" style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>Customer</h4>
              <p style={{ fontWeight: 600 }}>{selectedOrder.user?.name}</p>
              <p style={{ fontSize: 13 }}>{selectedOrder.user?.email}</p>
              <p style={{ fontSize: 13 }}>📞 {selectedOrder.user?.phone}</p>
            </div>

            <div className="info-block" style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>Delivery Address</h4>
              <p style={{ fontSize: 13 }}>{selectedOrder.shippingAddress?.fullName}</p>
              <p style={{ fontSize: 13 }}>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
              <p style={{ fontSize: 13 }}>{selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
            </div>

            <div className="info-block" style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>Items ({selectedOrder.items?.length})</h4>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{item.name} ×{item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Subtotal</span><span>₹{selectedOrder.itemsPrice?.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Shipping</span><span>{selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice}`}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span>Tax</span><span>₹{selectedOrder.taxPrice?.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, paddingTop: 10, borderTop: '2px solid var(--border)' }}><span>Total</span><span>₹{selectedOrder.totalPrice?.toFixed(2)}</span></div>
            </div>

            {selectedOrder.prescriptionStatus !== 'not_required' && (
              <div style={{ marginTop: 14, background: '#fef3c7', borderRadius: 8, padding: 12, fontSize: 13, color: '#92400e' }}>
                📋 Prescription Status: <strong>{selectedOrder.prescriptionStatus}</strong>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Update Status</label>
              <select
                className="form-control"
                value={selectedOrder.orderStatus}
                onChange={e => handleStatusUpdate(selectedOrder._id, e.target.value)}
                disabled={updatingId === selectedOrder._id}
              >
                {['placed','confirmed','processing','shipped','delivered','cancelled','returned'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
