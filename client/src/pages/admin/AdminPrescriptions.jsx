import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get('/admin/prescriptions')
      .then(r => setPrescriptions(r.data.prescriptions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (userId, prescriptionId, status) => {
    setUpdating(prescriptionId);
    try {
      await api.put(`/admin/prescriptions/${userId}/${prescriptionId}`, { status });
      setPrescriptions(prev => prev.map(p =>
        p._id === prescriptionId ? { ...p, status } : p
      ));
      if (selected?._id === prescriptionId) setSelected(s => ({ ...s, status }));
      toast.success(`Prescription ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setUpdating(null);
  };

  const filtered = filter === 'all' ? prescriptions : prescriptions.filter(p => p.status === filter);

  const statusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e' },
      approved: { bg: '#d1fae5', color: '#065f46' },
      rejected: { bg: '#fde8e8', color: 'var(--danger)' },
    };
    const s = styles[status] || styles.pending;
    return <span style={{ ...s, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{status}</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Prescriptions</h1>
        <p>Review and verify customer prescriptions ({prescriptions.length} total)</p>
      </div>

      {/* Stats */}
      <div className="inventory-grid">
        {[
          { label: 'Total', count: prescriptions.length, color: '#e3f2fd' },
          { label: 'Pending Review', count: prescriptions.filter(p => p.status === 'pending').length, color: '#fef3c7' },
          { label: 'Approved', count: prescriptions.filter(p => p.status === 'approved').length, color: '#d1fae5' },
          { label: 'Rejected', count: prescriptions.filter(p => p.status === 'rejected').length, color: '#fde8e8' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.color, borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{s.count}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="orders-filter-bar">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
        {/* List */}
        <div className="admin-card">
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ color: 'var(--text-secondary)' }}>No prescriptions found</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>File</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rx => (
                  <tr
                    key={rx._id}
                    onClick={() => setSelected(selected?._id === rx._id ? null : rx)}
                    style={{ cursor: 'pointer', background: selected?._id === rx._id ? 'var(--primary-light)' : '' }}
                  >
                    <td>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{rx.userName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rx.userEmail}</p>
                    </td>
                    <td style={{ fontSize: 13 }}>{rx.doctorName || '—'}</td>
                    <td>
                      {rx.fileUrl ? (
                        <a href={rx.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()}>
                          <FiEye size={12} /> View
                        </a>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No file</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(rx.uploadedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>{statusBadge(rx.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        {rx.status !== 'approved' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStatusUpdate(rx.userId, rx._id, 'approved')}
                            disabled={updating === rx._id}
                          >
                            <FiCheckCircle size={12} /> Approve
                          </button>
                        )}
                        {rx.status !== 'rejected' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusUpdate(rx.userId, rx._id, 'rejected')}
                            disabled={updating === rx._id}
                          >
                            <FiXCircle size={12} /> Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Prescription Details</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>Patient Information</p>
              <p style={{ fontWeight: 600 }}>{selected.userName}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.userEmail}</p>
            </div>

            {selected.doctorName && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 4 }}>Prescribing Doctor</p>
                <p style={{ fontWeight: 600 }}>Dr. {selected.doctorName}</p>
              </div>
            )}

            {selected.fileUrl && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>Prescription File</p>
                {selected.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={selected.fileUrl} alt="Prescription" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
                ) : (
                  <a href={selected.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    📄 Open Prescription File
                  </a>
                )}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Uploaded: {new Date(selected.uploadedAt).toLocaleString('en-IN')}
              </p>
              <p style={{ fontSize: 14 }}>Current Status: {statusBadge(selected.status)}</p>
            </div>

            {selected.notes && (
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13, color: '#78350f' }}>
                📝 <strong>Notes:</strong> {selected.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => handleStatusUpdate(selected.userId, selected._id, 'approved')}
                disabled={selected.status === 'approved' || updating === selected._id}
              >
                <FiCheckCircle size={15} /> {selected.status === 'approved' ? '✅ Approved' : 'Approve'}
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => handleStatusUpdate(selected.userId, selected._id, 'rejected')}
                disabled={selected.status === 'rejected' || updating === selected._id}
              >
                <FiXCircle size={15} /> {selected.status === 'rejected' ? '❌ Rejected' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
