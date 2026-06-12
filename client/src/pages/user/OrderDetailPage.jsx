import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiMapPin, FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './UserPages.css';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).catch(() => {});
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      setOrder(res.data.order);
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    setCancelling(false);
  };

  if (!order) return <div className="page-loader"><div className="spinner" /></div>;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const canCancel = !['shipped','delivered','cancelled'].includes(order.orderStatus);

  return (
    <div className="user-page">
      <div className="container" style={{maxWidth:900}}>
        <Link to="/orders" className="btn btn-outline btn-sm" style={{marginBottom:20}}><FiArrowLeft size={14} /> Back to Orders</Link>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12}}>
          <div>
            <h1 style={{fontSize:22, fontWeight:800}}>Order #{order.orderNumber}</h1>
            <p style={{fontSize:13, color:'var(--text-muted)'}}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
          <div style={{display:'flex', gap:10}}>
            <span className={`order-status status-${order.orderStatus}`}>{order.orderStatus}</span>
            {canCancel && <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Cancel Order'}</button>}
          </div>
        </div>

        {/* Progress Tracker */}
        {!['cancelled','returned'].includes(order.orderStatus) && (
          <div className="order-progress">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className={`progress-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}>
                <div className="progress-dot" />
                <span>{step.charAt(0).toUpperCase()+step.slice(1)}</span>
                {i < STATUS_STEPS.length - 1 && <div className={`progress-line ${i < currentStep ? 'filled' : ''}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="order-detail-grid">
          {/* Items */}
          <div className="order-items-section">
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:14}}>Items Ordered</h3>
            {order.items?.map((item, i) => (
              <div key={i} className="order-detail-item">
                <img src={item.image || `https://placehold.co/64x64/e8f5ee/1a8f4c?text=Med`} alt={item.name} />
                <div style={{flex:1}}>
                  <p style={{fontWeight:600,fontSize:14}}>{item.name}</p>
                  {item.packSize && <p style={{fontSize:12,color:'var(--text-muted)'}}>{item.packSize}</p>}
                  <p style={{fontSize:13,color:'var(--text-secondary)'}}>Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                </div>
                <p style={{fontWeight:700}}>₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Summary sidebar */}
          <div>
            <div className="info-block">
              <h4><FiMapPin size={14} /> Delivery Address</h4>
              <p>{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p>📞 {order.shippingAddress?.phone}</p>
            </div>
            <div className="info-block">
              <h4><FiCreditCard size={14} /> Payment</h4>
              <p><strong>Method:</strong> {order.paymentMethod?.toUpperCase()}</p>
              <p><strong>Status:</strong> <span style={{color:'var(--success)',fontWeight:600}}>{order.paymentStatus}</span></p>
            </div>
            <div className="info-block">
              <h4><FiPackage size={14} /> Price Summary</h4>
              <div style={{fontSize:14,display:'flex',flexDirection:'column',gap:6}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><span>Items</span><span>₹{order.itemsPrice?.toFixed(2)}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span>Shipping</span><span>{order.shippingPrice===0?'FREE':`₹${order.shippingPrice}`}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span>Tax</span><span>₹{order.taxPrice?.toFixed(2)}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:16,paddingTop:8,borderTop:'1px solid var(--border)'}}><span>Total</span><span>₹{order.totalPrice?.toFixed(2)}</span></div>
              </div>
            </div>
            {order.estimatedDelivery && (
              <div className="info-block">
                <h4>🚚 Estimated Delivery</h4>
                <p>{new Date(order.estimatedDelivery).toDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
