// WishlistPage.jsx
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard';
import { Link } from 'react-router-dom';
import './UserPages.css';

export function WishlistPage() {
  const { user, refreshProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.wishlist?.length > 0) {
      api.get('/auth/profile').then(r => {
        setProducts(r.data.user.wishlist || []);
        setLoading(false);
      });
    } else { setLoading(false); }
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  return (
    <div className="user-page">
      <div className="container">
        <h1 className="page-title">My Wishlist ({products.length})</h1>
        {products.length === 0 ? (
          <div className="empty-state">
            <div style={{fontSize:64}}>❤️</div>
            <h3>Your wishlist is empty</h3>
            <Link to="/products" className="btn btn-primary mt-3">Explore Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export function PrescriptionsPage() {
  const { user, refreshProfile } = useAuth();
  const [file, setFile] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [uploading, setUploading] = useState(false);
  const prescriptions = user?.prescriptions || [];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { return; }
    const formData = new FormData();
    formData.append('prescription', file);
    formData.append('doctorName', doctorName);
    setUploading(true);
    try {
      await api.post('/auth/prescription', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshProfile();
      setFile(null); setDoctorName('');
      const input = document.getElementById('rx-file');
      if (input) input.value = '';
    } catch {}
    setUploading(false);
  };

  return (
    <div className="user-page">
      <div className="container" style={{maxWidth:700}}>
        <h1 className="page-title">My Prescriptions</h1>
        <form onSubmit={handleUpload} className="upload-rx-form">
          <div style={{fontSize:48,marginBottom:12}}>📋</div>
          <p>Upload your doctor's prescription (JPG, PNG, or PDF — max 5MB)</p>
          <div className="form-group">
            <label className="form-label">Doctor's Name (optional)</label>
            <input className="form-control" value={doctorName} onChange={e=>setDoctorName(e.target.value)} placeholder="Dr. John Smith" style={{maxWidth:300,margin:'0 auto'}} />
          </div>
          <div className="form-group">
            <input id="rx-file" type="file" accept="image/*,.pdf" onChange={e=>setFile(e.target.files[0])} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
            {uploading ? 'Uploading...' : '📤 Upload Prescription'}
          </button>
        </form>
        <div className="prescriptions-list">
          {prescriptions.length === 0 ? (
            <p className="text-muted" style={{textAlign:'center'}}>No prescriptions uploaded yet.</p>
          ) : (
            prescriptions.map((rx, i) => (
              <div key={i} className="prescription-card">
                <span className="prescription-icon">📄</span>
                <div className="prescription-info">
                  <h4>{rx.fileName || 'Prescription'}</h4>
                  {rx.doctorName && <p>Dr. {rx.doctorName}</p>}
                  <p>{new Date(rx.uploadedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`rx-status rx-${rx.status}`}>{rx.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', gender: user?.gender||'' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'' });

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put('/auth/profile', form);
      await refreshProfile();
    } catch {}
    setSaving(false);
  };

  const handlePw = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/change-password', pwForm);
      setPwForm({ currentPassword:'', newPassword:'' });
    } catch {}
  };

  return (
    <div className="user-page">
      <div className="container" style={{maxWidth:700}}>
        <h1 className="page-title">Edit Profile</h1>
        <div className="profile-form">
          <form onSubmit={handleUpdate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email (cannot change)</label>
              <input className="form-control" value={user?.email} disabled style={{opacity:0.6}} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-control" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
          </form>
          <div style={{borderTop:'1px solid var(--border)',marginTop:28,paddingTop:28}}>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Change Password</h3>
            <form onSubmit={handlePw}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} required minLength={6} />
              </div>
              <button className="btn btn-secondary" type="submit">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
