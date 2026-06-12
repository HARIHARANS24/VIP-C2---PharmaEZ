import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiAlertCircle, FiPackage, FiShield, FiTruck, FiChevronRight } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartLoading } = useCart();
  const { isLoggedIn, user, refreshProfile } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch { navigate('/products'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleAddToCart = async () => {
    const ok = await addToCart(product._id, qty);
    if (ok && product.prescriptionRequired) {
      toast('⚠️ This is a prescription medicine. Please upload your prescription.', { duration: 5000, icon: '📋' });
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    await addToCart(product._id, qty);
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) { toast.error('Please login'); return; }
    await api.post(`/auth/wishlist/${product._id}`);
    refreshProfile();
    toast.success('Wishlist updated!');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      toast.success('Review submitted!');
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
      setReview({ rating: 5, comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSubmittingReview(false);
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!product) return null;

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> <FiChevronRight size={12} />
          <Link to="/products">Products</Link> <FiChevronRight size={12} />
          <Link to={`/products?category=${product.category}`}>{product.category}</Link> <FiChevronRight size={12} />
          <span>{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-image-wrap">
              <img src={product.images?.[activeImg] || `https://placehold.co/500x500/e8f5ee/1a8f4c?text=${encodeURIComponent(product.name.substring(0,12))}`} alt={product.name} className="main-image" />
              {hasDiscount && <span className="detail-discount-badge">{product.discountPercent}% OFF</span>}
              {product.prescriptionRequired && <span className="detail-rx-badge">Rx Required</span>}
            </div>
            {product.images?.length > 1 && (
              <div className="thumbnail-list">
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt={`${product.name} ${i}`} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <p className="detail-category">{product.category}{product.subcategory && ` › ${product.subcategory}`}</p>
            <h1 className="detail-name">{product.name}</h1>
            {product.genericName && <p className="detail-generic">Generic: <strong>{product.genericName}</strong></p>}
            {product.manufacturer && <p className="detail-mfr">by {product.manufacturer}</p>}

            <div className="detail-rating">
              <div className="stars">
                {[1,2,3,4,5].map(s => <FiStar key={s} size={16} fill={s <= Math.round(product.rating) ? '#f59e0b' : 'transparent'} color={s <= Math.round(product.rating) ? '#f59e0b' : '#d1d5db'} />)}
              </div>
              <span>{product.rating?.toFixed(1)}</span>
              <span className="text-muted">({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="detail-price-wrap">
              <span className="detail-price">₹{price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="detail-mrp">MRP ₹{product.price.toFixed(2)}</span>
                  <span className="detail-saving">Save ₹{(product.price - price).toFixed(2)}</span>
                </>
              )}
            </div>

            {product.packSize && <p className="detail-pack"><FiPackage size={14} /> Pack Size: <strong>{product.packSize}</strong></p>}
            {product.saltComposition && <p className="detail-salt">Salt: {product.saltComposition}</p>}

            {product.prescriptionRequired && (
              <div className="rx-notice">
                <FiAlertCircle size={16} />
                <div>
                  <strong>Prescription Required (Rx)</strong>
                  <p>A valid doctor's prescription is required to purchase this medicine. Please upload your prescription.</p>
                  <Link to="/prescriptions" className="rx-upload-link">Upload Prescription →</Link>
                </div>
              </div>
            )}

            {/* Stock */}
            <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
              {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : '❌ Out of Stock'}
            </div>

            {/* Quantity & Actions */}
            {product.stock > 0 && (
              <>
                <div className="qty-selector">
                  <span>Qty:</span>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>-</button>
                  <span className="qty-val">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
                </div>
                <div className="detail-actions">
                  <button className="btn btn-secondary" onClick={handleAddToCart} disabled={cartLoading}>
                    <FiShoppingCart size={18} /> Add to Cart
                  </button>
                  <button className="btn btn-primary" onClick={handleBuyNow} disabled={cartLoading}>
                    Buy Now
                  </button>
                  <button className="btn btn-outline" onClick={handleWishlist} title="Wishlist"><FiHeart size={18} /></button>
                </div>
              </>
            )}

            {/* Trust */}
            <div className="detail-trust">
              <div className="trust-item"><FiShield size={14} /> Genuine Products</div>
              <div className="trust-item"><FiTruck size={14} /> Free delivery above ₹499</div>
              <div className="trust-item">🔄 Easy returns within 7 days</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tab-nav">
            {['description','usage','reviews'].map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${product.numReviews})`}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-panel">
                <p>{product.description}</p>
                <div className="detail-grid-2">
                  {product.dosageForm && <div><strong>Dosage Form:</strong> {product.dosageForm}</div>}
                  {product.strength && <div><strong>Strength:</strong> {product.strength}</div>}
                  {product.manufacturer && <div><strong>Manufacturer:</strong> {product.manufacturer}</div>}
                  {product.storageInstructions && <div><strong>Storage:</strong> {product.storageInstructions}</div>}
                </div>
                {product.sideEffects?.length > 0 && (
                  <div className="side-effects">
                    <strong>⚠️ Side Effects:</strong>
                    <ul>{product.sideEffects.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="tab-panel">
                {product.usageInstructions ? <p>{product.usageInstructions}</p> : <p className="text-muted">Usage instructions not available. Please consult your doctor or pharmacist.</p>}
                <div className="usage-disclaimer">
                  <FiAlertCircle size={16} />
                  <p>This information is for general guidance only. Always follow your doctor's prescription and advice.</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-panel">
                {/* Review Form */}
                {isLoggedIn && (
                  <form onSubmit={handleReview} className="review-form">
                    <h4>Write a Review</h4>
                    <div className="star-selector">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}>
                          <FiStar size={24} fill={s <= review.rating ? '#f59e0b' : 'transparent'} color={s <= review.rating ? '#f59e0b' : '#d1d5db'} />
                        </button>
                      ))}
                    </div>
                    <textarea className="form-control" rows="3" placeholder="Share your experience with this product..." value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} required />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {product.reviews?.length === 0 ? (
                    <p className="text-muted">No reviews yet. Be the first to review!</p>
                  ) : (
                    product.reviews.map((r, i) => (
                      <div key={i} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-avatar">{r.name?.charAt(0)?.toUpperCase()}</div>
                          <div>
                            <strong>{r.name}</strong>
                            <div className="stars" style={{ fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                          </div>
                          <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
