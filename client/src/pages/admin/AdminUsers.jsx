import { useState, useEffect } from 'react';
import { FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toggling, setToggling] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggle = async (userId) => {
    setToggling(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      toast.success(`User ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setToggling(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
        <p>Manage customer accounts ({total} total)</p>
      </div>

      <div className="admin-toolbar">
        <form className="admin-search" onSubmit={handleSearch}>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit"><FiSearch size={16} /></button>
        </form>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Loyalty Points</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, background: 'var(--primary)', color: '#fff',
                          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 15, flexShrink: 0
                        }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ fontSize: 13 }}>{user.phone || '—'}</td>
                    <td>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                        {user.prescriptions?.length || 0} Rx
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#f59e0b' }}>🎁 {user.loyaltyPoints || 0}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: user.isActive ? '#d1fae5' : '#fde8e8',
                        color: user.isActive ? '#065f46' : 'var(--danger)'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${user.isActive ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => handleToggle(user._id)}
                        disabled={toggling === user._id}
                        title={user.isActive ? 'Deactivate user' : 'Activate user'}
                      >
                        {toggling === user._id ? '...' : user.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No users found</p>
            )}

            {pages > 1 && (
              <div className="pagination" style={{ marginTop: 16 }}>
                <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {pages}</span>
                <button className="page-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
