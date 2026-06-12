import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiLogOut, FiGrid, FiPackage, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const CATEGORIES = ['OTC Medicines','Prescription Medicines','Vitamins & Supplements','Personal Care','Medical Devices','Baby Care','Wellness Products','Ayurvedic & Herbal'];

export default function Navbar() {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">💊</span>
            <span className="logo-text">Pharma<span>EZ</span></span>
          </Link>

          {/* Search */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text" placeholder="Search medicines, vitamins, devices..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <button type="submit"><FiSearch size={18} /></button>
          </form>

          {/* Actions */}
          <div className="navbar-actions">
            {isLoggedIn ? (
              <div className="user-menu-wrapper">
                <button className="navbar-btn user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <FiUser size={20} />
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <strong>{user?.name}</strong>
                      <small>{user?.email}</small>
                    </div>
                    {isAdmin ? (
                      <Link to="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <FiGrid size={15} /> Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link to="/dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}><FiUser size={15} /> My Profile</Link>
                        <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}><FiPackage size={15} /> My Orders</Link>
                        <Link to="/wishlist" className="dropdown-item" onClick={() => setUserMenuOpen(false)}><FiHeart size={15} /> Wishlist</Link>
                        <Link to="/prescriptions" className="dropdown-item" onClick={() => setUserMenuOpen(false)}><FiFileText size={15} /> Prescriptions</Link>
                      </>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={() => { logout(); setUserMenuOpen(false); }}><FiLogOut size={15} /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="navbar-btn login-btn">
                <FiUser size={18} /> Login
              </Link>
            )}

            {!isAdmin && (
              <Link to="/cart" className="navbar-btn cart-btn">
                <FiShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            )}

            <button className="navbar-btn mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="navbar-categories">
        <div className="container">
          <div className="categories-list">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="category-link">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} className="mobile-search">
            <input type="text" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit"><FiSearch size={16} /></button>
          </form>
          <div className="mobile-categories">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="mobile-cat-link" onClick={() => setMenuOpen(false)}>{cat}</Link>
            ))}
          </div>
          {!isLoggedIn && (
            <div className="mobile-auth">
              <Link to="/login" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
