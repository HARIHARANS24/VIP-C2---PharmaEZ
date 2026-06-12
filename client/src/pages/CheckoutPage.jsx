import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'upi', label: 'UPI / QR Code', icon: '📱' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
];

export default function CheckoutPage() {
  const { cart, cartSubtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    user?.addresses?.findIndex(a => a.isDefault) >= 0
      ? user.addresses.findIndex(a => a.isDefault)
      : 0
  );
  const [addingNew, setAddingNew] = useState(user?.addresses?.length === 0);
  const [newAddr, setNewAddr] = useState({ fullName: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');

  const items = cart.items || [];
  const shipping = cartSubtotal >= 499 ? 0 : 49;
  const tax = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const total = cartSubtotal + shipping + tax;

  const getAddress = () => {
    if (addingNew) return newAddr;
    return user.addresses?.[selectedAddress];
  };

  const handlePlaceOrder = async () => {
    const addr = getAddress();
    if (!addr?.street || !addr?.city || !addr?.pincode) { toast.error('Please fill in complete address'); return; }
    setPlacing(true);
    try {
      const res = await api.post('/orders', { shippingAddress: addr, paymentMethod, notes });
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-confirmation/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order placement failed');
    }
    setPlacing(false);
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        {/* Steps */}
        <div className="checkout-steps">
          {['Address', 'Payment', 'Review'].map((s, i) => (
            <div key={i} className={`checkout-step ${step >= i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <div className="step-circle">{step > i + 1 ? <FiCheckCircle size={16} /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {/* Step 1: Address */}
            {step === 1 && (
              <div className="checkout-section">
                <h2 className="section-h2"><FiMapPin size={18} /> Delivery Address</h2>
                {user?.addresses?.length > 0 && !addingNew && (
                  <div className="address-list">
                    {user.addresses.map((addr, i) => (
                      <label key={i} className={`address-option ${selectedAddress === i ? 'selected' : ''}`}>
                        <input type="radio" name="addr" checked={selectedAddress === i} onChange={() => setSelectedAddress(i)} />
                        <div>
                          <strong>{addr.fullName}</strong> {addr.isDefault && <span className="badge badge-primary">Default</span>}
                          <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p>📞 {addr.phone}</p>
                        </div>
                      </label>
                    ))}
                    <button className="btn btn-outline btn-sm" onClick={() => setAddingNew(true)}>+ Add New Address</button>
                  </div>
                )}
                {addingNew && (
                  <div className="new-addr-form">
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="form-control" value={newAddr.fullName} onChange={e => setNewAddr({...newAddr, fullName: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input className="form-control" value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Street Address *</label>
                      <input className="form-control" value={newAddr.street} onChange={e => setNewAddr({...newAddr, street: e.target.value})} placeholder="House No., Street, Area" />
                    </div>
                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input className="form-control" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input className="form-control" value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Pincode *</label>
                        <input className="form-control" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} />
                      </div>
                    </div>
                    {user?.addresses?.length > 0 && (
                      <button className="btn btn-outline btn-sm" onClick={() => setAddingNew(false)}>← Back to saved addresses</button>
                    )}
                  </div>
                )}
                <button className="btn btn-primary" style={{marginTop:20}} onClick={() => setStep(2)}>Continue to Payment →</button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="checkout-section">
                <h2 className="section-h2"><FiCreditCard size={18} /> Payment Method</h2>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map(m => (
                    <label key={m.value} className={`payment-option ${paymentMethod === m.value ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                      <span className="pay-icon">{m.icon}</span>
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
                {paymentMethod !== 'cod' && (
                  <div className="payment-note">
                    <p>🔒 Payment gateway integration placeholder. In production, integrate Razorpay/Stripe SDK here.</p>
                  </div>
                )}
                <div className="form-group" style={{marginTop:20}}>
                  <label className="form-label">Order Notes (Optional)</label>
                  <textarea className="form-control" rows="2" placeholder="Any special instructions for your order..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <div className="step-btns">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="checkout-section">
                <h2 className="section-h2">📋 Review Your Order</h2>
                <div className="review-block">
                  <h4>Delivery Address</h4>
                  {(() => { const a = getAddress(); return a ? <p>{a.fullName}, {a.street}, {a.city}, {a.state} - {a.pincode}. Tel: {a.phone}</p> : null; })()}
                </div>
                <div className="review-block">
                  <h4>Payment</h4>
                  <p>{PAYMENT_METHODS.find(m => m.value === paymentMethod)?.icon} {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}</p>
                </div>
                <div className="review-block">
                  <h4>Items ({items.length})</h4>
                  {items.map((item, i) => {
                    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
                    return (
                      <div key={i} className="review-item-row">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{(price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="step-btns">
                  <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? 'Placing Order...' : `Place Order · ₹${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="checkout-summary card">
            <h3>Price Details</h3>
            <div className="summary-rows">
              {items.map((item, i) => {
                const price = item.discountPrice > 0 ? item.discountPrice : item.price;
                return <div key={i} className="summary-row"><span>{item.name.substring(0,22)}... ×{item.quantity}</span><span>₹{(price * item.quantity).toFixed(2)}</span></div>;
              })}
            </div>
            <div className="checkout-divider" />
            <div className="summary-row"><span>Subtotal</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span className={shipping===0?'text-primary':''}>{shipping===0?'FREE':`₹${shipping}`}</span></div>
            <div className="summary-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="checkout-divider" />
            <div className="checkout-total"><span>Total Amount</span><span>₹{total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
