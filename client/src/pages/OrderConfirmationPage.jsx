// OrderConfirmationPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import api from '../utils/api';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => setOrder(res.data.order)).catch(() => {});
  }, [id]);

  if (!order) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ fontSize: 70, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: 'var(--primary)' }}>Order Placed Successfully!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Thank you for your order. We'll send you updates via email.</p>
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid var(--border)', textAlign: 'left', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div><p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>ORDER NUMBER</p><strong style={{ fontSize: 18 }}>{order.orderNumber}</strong></div>
            <div style={{ textAlign: 'right' }}><p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL</p><strong style={{ fontSize: 18, color: 'var(--primary)' }}>₹{order.totalPrice?.toFixed(2)}</strong></div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📦 Estimated Delivery: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toDateString() : 'Within 5 business days'}</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>💳 Payment: {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}</p>
          {order.prescriptionStatus === 'pending' && (
            <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12, marginTop: 12, fontSize: 13 }}>
              ⚠️ Your order contains prescription medicines. Please <Link to="/prescriptions" style={{ color: 'var(--primary)', fontWeight: 600 }}>upload your prescription</Link> to proceed.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/orders/${order._id}`} className="btn btn-primary"><FiPackage size={16} /> Track Order</Link>
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
