import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">💊 Pharma<span>EZ</span></div>
            <p>Your trusted online pharmacy and healthcare store. Genuine medicines, delivered fast to your doorstep.</p>
            <div className="footer-contact">
              <span><FiPhone size={14} /> +91-1800-000-0000 (24/7)</span>
              <span><FiMail size={14} /> support@pharmaez.com</span>
              <span><FiMapPin size={14} /> Pan India Delivery</span>
            </div>
          </div>

          <div>
            <h4>Shop By Category</h4>
            <ul>
              <li><Link to="/products?category=OTC Medicines">OTC Medicines</Link></li>
              <li><Link to="/products?category=Vitamins & Supplements">Vitamins & Supplements</Link></li>
              <li><Link to="/products?category=Medical Devices">Medical Devices</Link></li>
              <li><Link to="/products?category=Baby Care">Baby Care</Link></li>
              <li><Link to="/products?category=Ayurvedic & Herbal">Ayurvedic & Herbal</Link></li>
            </ul>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/orders">Track Order</Link></li>
              <li><Link to="/prescriptions">Upload Prescription</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/dashboard">My Account</Link></li>
            </ul>
          </div>

          <div>
            <h4>Customer Care</h4>
            <ul>
              <li><a href="#">Return Policy</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
            <div className="footer-badges">
              <span>🔒 SSL Secured</span>
              <span>✅ Genuine Products</span>
              <span>🚚 Fast Delivery</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} PharmaEZ. All rights reserved. Developed for educational purposes.</p>
          <p>⚠️ Always consult a licensed pharmacist or doctor before consuming medicines.</p>
        </div>
      </div>
    </footer>
  );
}
