import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

export default function CartPage() {
  const { cart, cartSubtotal, updateItem, removeItem, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const items = cart.items || [];
  const shipping = cartSubtotal >= 499 ? 0 : 49;
  const tax = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const total = cartSubtotal + shipping + tax;
  const hasPrescriptionItems = items.some(i => i.prescriptionRequired);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Browse our wide range of medicines and healthcare products</p>
            <Link to="/products" className="btn btn-primary btn-lg">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        {hasPrescriptionItems && (
          <div className="cart-rx-notice">
            <FiAlertCircle size={18} />
            <div>
              <strong>Prescription Required</strong>
              <p>Your cart contains prescription medicines. Please <Link to="/prescriptions">upload a valid prescription</Link> before placing your order.</p>
            </div>
          </div>
        )}

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map(item => {
              const price = item.discountPrice > 0 ? item.discountPrice : item.price;
              const hasDiscount = item.discountPrice > 0 && item.discountPrice < item.price;
              return (
                <div key={item._id} className="cart-item">
                  <Link to={`/products/${item.product?._id || item.product}`}>
                    <img src={item.image || `https://placehold.co/80x80/e8f5ee/1a8f4c?text=Med`} alt={item.name} className="cart-item-img" />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/products/${item.product?._id || item.product}`}>
                      <h3 className="cart-item-name">{item.name}</h3>
                    </Link>
                    {item.packSize && <p className="cart-item-pack">{item.packSize}</p>}
                    {item.prescriptionRequired && <span className="rx-badge">Rx Required</span>}
                    <div className="cart-item-price">
                      <span className="item-price">₹{price.toFixed(2)}</span>
                      {hasDiscount && <span className="item-original">₹{item.price.toFixed(2)}</span>}
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-ctrl">
                      <button onClick={() => item.quantity <= 1 ? removeItem(item._id) : updateItem(item._id, item.quantity - 1)}>{item.quantity <= 1 ? <FiTrash2 size={14} /> : <FiMinus size={14} />}</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(item._id, item.quantity + 1)}><FiPlus size={14} /></button>
                    </div>
                    <p className="cart-item-total">₹{(price * item.quantity).toFixed(2)}</p>
                    <button className="remove-btn" onClick={() => removeItem(item._id)}><FiTrash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
            <div className="cart-actions">
              <Link to="/products" className="btn btn-outline btn-sm"><FiShoppingBag size={15} /> Continue Shopping</Link>
              <button className="btn btn-outline btn-sm" onClick={clearCart}><FiTrash2 size={15} /> Clear Cart</button>
            </div>
          </div>

          {/* Summary */}
          <div className="cart-summary card">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} items)</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'text-primary' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="summary-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
            </div>
            {cartSubtotal < 499 && (
              <div className="free-shipping-bar">
                <p>Add ₹{(499 - cartSubtotal).toFixed(2)} more for <strong>FREE delivery</strong></p>
                <div className="shipping-progress"><div style={{ width: `${(cartSubtotal / 499) * 100}%` }} /></div>
              </div>
            )}
            <div className="summary-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            <div className="summary-saving">
              {items.some(i => i.discountPrice > 0) && <p className="saving-text">🎉 You're saving ₹{items.reduce((s,i) => i.discountPrice > 0 ? s + (i.price - i.discountPrice) * i.quantity : s, 0).toFixed(2)} on this order!</p>}
            </div>
            {isLoggedIn ? (
              <button className="btn btn-primary btn-lg" style={{width:'100%'}} onClick={() => navigate('/checkout')}>
                Proceed to Checkout <FiArrowRight />
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-lg" style={{width:'100%', justifyContent:'center'}}>
                Login to Checkout
              </Link>
            )}
            <div className="summary-trust">
              <span>🔒 Secure Checkout</span>
              <span>💊 Genuine Products</span>
              <span>🚚 Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
