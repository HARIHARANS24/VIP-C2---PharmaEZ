import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiUsers, FiShoppingBag, FiAlertTriangle, FiFileText, FiLogOut, FiMenu, FiX, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const NAV = [
  { to: '/admin', icon: <FiGrid size={18} />, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: <FiShoppingBag size={18} />, label: 'Products' },
  { to: '/admin/orders', icon: <FiPackage size={18} />, label: 'Orders' },
  { to: '/admin/users', icon: <FiUsers size={18} />, label: 'Users' },
  { to: '/admin/inventory', icon: <FiAlertTriangle size={18} />, label: 'Inventory' },
  { to: '/admin/prescriptions', icon: <FiFileText size={18} />, label: 'Prescriptions' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-top">
          <Link to="/admin" className="admin-logo">
            <span>💊</span>
            {sidebarOpen && <span className="logo-label">PharmaEZ <small>Admin</small></span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <div className="admin-user-info">
          <div className="admin-avatar">{user?.name?.charAt(0)}</div>
          {sidebarOpen && <div><p className="admin-name">{user?.name}</p><p className="admin-role">Administrator</p></div>}
        </div>

        <nav className="admin-nav">
          {NAV.map(item => (
            <Link key={item.to} to={item.to} className={`nav-item ${isActive(item.to, item.exact) ? 'active' : ''}`}>
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item" target="_blank">{sidebarOpen ? '← View Store' : '🏪'}</Link>
          <button className="nav-item danger" onClick={handleLogout}><FiLogOut size={18} />{sidebarOpen && <span>Logout</span>}</button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
