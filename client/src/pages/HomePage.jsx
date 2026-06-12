import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiClock, FiStar } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './HomePage.css';

const CATEGORIES = [
  { name: 'OTC Medicines', icon: '💊', color: '#e8f5ee', border: '#1a8f4c' },
  { name: 'Vitamins & Supplements', icon: '🧴', color: '#fff3e0', border: '#f59e0b' },
  { name: 'Medical Devices', icon: '🩺', color: '#e8eaf6', border: '#3f51b5' },
  { name: 'Baby Care', icon: '👶', color: '#fce4ec', border: '#e91e63' },
  { name: 'Personal Care', icon: '🧴', color: '#f3e5f5', border: '#9c27b0' },
  { name: 'Ayurvedic & Herbal', icon: '🌿', color: '#e8f5e9', border: '#4caf50' },
  { name: 'Wellness Products', icon: '🏃', color: '#e3f2fd', border: '#2196f3' },
  { name: 'COVID Essentials', icon: '😷', color: '#fafafa', border: '#607d8b' },
];

const TRUST_BADGES = [
  { icon: <FiShield size={28} />, title: '100% Genuine', desc: 'All products verified & authenticated' },
  { icon: <FiTruck size={28} />, title: 'Fast Delivery', desc: 'Same-day delivery in select cities' },
  { icon: <FiClock size={28} />, title: '24/7 Support', desc: 'Pharmacist consultation available' },
  { icon: <FiStar size={28} />, title: '4.8★ Rated', desc: 'Trusted by 10 lakh+ customers' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products/featured');
        setFeatured(res.data.products);
      } catch {}
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="homepage">
      {/* Hero Banner */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-badge">🏥 India's Trusted Online Pharmacy</span>
            <h1>Your Health, <br /><span>Our Priority</span></h1>
            <p>Get genuine medicines, healthcare products & expert advice delivered to your doorstep. Fast, safe & reliable.</p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">Shop Now <FiArrowRight /></Link>
              <Link to="/products?category=Prescription Medicines" className="btn btn-secondary btn-lg">Upload Prescription</Link>
            </div>
            <div className="hero-stats">
              <div><strong>50,000+</strong><span>Products</span></div>
              <div><strong>10 Lakh+</strong><span>Customers</span></div>
              <div><strong>24 hrs</strong><span>Delivery</span></div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-visual">
              <div className="hero-pill hero-pill-1">💊 Paracetamol ₹35</div>
              <div className="hero-pill hero-pill-2">🩺 BP Monitor ₹2499</div>
              <div className="hero-pill hero-pill-3">🧴 Vitamin C ₹239</div>
              <div className="hero-main-icon">💊</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            {TRUST_BADGES.map((badge, i) => (
              <div key={i} className="trust-card">
                <div className="trust-icon">{badge.icon}</div>
                <div>
                  <h4>{badge.title}</h4>
                  <p>{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop By Category</h2>
            <Link to="/products" className="see-all">See All <FiArrowRight size={14} /></Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`} className="category-card" style={{ '--cat-color': cat.color, '--cat-border': cat.border }}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offer Banner */}
      <section className="offer-banner-section">
        <div className="container">
          <div className="offer-banners">
            <div className="offer-banner ob-1">
              <div>
                <h3>Up to 40% Off</h3>
                <p>On Vitamins & Supplements</p>
                <Link to="/products?category=Vitamins %26 Supplements" className="btn btn-primary btn-sm">Shop Now</Link>
              </div>
              <span className="ob-icon">🧴</span>
            </div>
            <div className="offer-banner ob-2">
              <div>
                <h3>Free Delivery</h3>
                <p>On orders above ₹499</p>
                <Link to="/products" className="btn btn-primary btn-sm">Shop Now</Link>
              </div>
              <span className="ob-icon">🚚</span>
            </div>
            <div className="offer-banner ob-3">
              <div>
                <h3>Prescription Medicines</h3>
                <p>Upload Rx & get medicines at doorstep</p>
                <Link to="/prescriptions" className="btn btn-primary btn-sm">Upload Now</Link>
              </div>
              <span className="ob-icon">📋</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked bestsellers for you</p>
            </div>
            <Link to="/products?sort=rating" className="see-all">View All <FiArrowRight size={14} /></Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Health Tips */}
      <section className="health-tips-section">
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: 24 }}>Health & Wellness Tips</h2>
          <div className="tips-grid">
            {[
              { emoji: '💧', tip: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water daily to maintain optimal health.' },
              { emoji: '🏃', tip: 'Exercise Daily', desc: '30 minutes of moderate exercise daily reduces chronic disease risk.' },
              { emoji: '😴', tip: 'Sleep Well', desc: '7-8 hours of quality sleep is essential for immune system function.' },
              { emoji: '🥦', tip: 'Eat Balanced', desc: 'Include vegetables, proteins, and whole grains in every meal.' },
            ].map((tip, i) => (
              <div key={i} className="tip-card">
                <span className="tip-emoji">{tip.emoji}</span>
                <h4>{tip.tip}</h4>
                <p>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
