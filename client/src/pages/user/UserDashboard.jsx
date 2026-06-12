// UserDashboard.jsx
import { Link } from 'react-router-dom';
import { FiPackage, FiHeart, FiFileText, FiUser, FiGift } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './UserPages.css';

export function UserDashboard() {
  const { user } = useAuth();
  return (
    <div className="user-page">
      <div className="container">
        <div className="user-welcome">
          <div className="user-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h1>Hello, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>{user?.email}</p>
            <span className="loyalty-badge"><FiGift size={13} /> {user?.loyaltyPoints || 0} Loyalty Points</span>
          </div>
        </div>
        <div className="dashboard-cards">
          {[
            { to: '/orders', icon: <FiPackage size={28} />, title: 'My Orders', desc: 'Track and manage your orders', color: '#e8f5ee' },
            { to: '/wishlist', icon: <FiHeart size={28} />, title: 'Wishlist', desc: 'Products you love', color: '#fce4ec' },
            { to: '/prescriptions', icon: <FiFileText size={28} />, title: 'Prescriptions', desc: 'Upload & manage prescriptions', color: '#e3f2fd' },
            { to: '/profile', icon: <FiUser size={28} />, title: 'Profile', desc: 'Edit your personal details', color: '#f3e5f5' },
          ].map((card, i) => (
            <Link key={i} to={card.to} className="dashboard-card" style={{ '--card-bg': card.color }}>
              <div className="dashboard-card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
