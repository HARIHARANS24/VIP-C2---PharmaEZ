import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const CATEGORIES = [
  'Prescription Medicines','OTC Medicines','Vitamins & Supplements',
  'Personal Care','Medical Devices','Baby Care','Wellness Products',
  'Healthcare Equipment','Ayurvedic & Herbal','COVID Essentials',
];

const INITIAL = {
  name: '', genericName: '', description: '', manufacturer: '',
  category: 'OTC Medicines', subcategory: '', price: '', discountPrice: '',
  stock: '', unit: 'strip', packSize: '', prescriptionRequired: false,
  saltComposition: '', dosageForm: '', strength: '', usageInstructions: '',
  storageInstructions: '', isAvailable: true, isFeatured: false, tags: '',
  sideEffects: '',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(res => {
        const p = res.data.product;
        setForm({
          name: p.name || '', genericName: p.genericName || '',
          description: p.description || '', manufacturer: p.manufacturer || '',
          category: p.category || 'OTC Medicines', subcategory: p.subcategory || '',
          price: p.price || '', discountPrice: p.discountPrice || '',
          stock: p.stock || '', unit: p.unit || 'strip', packSize: p.packSize || '',
          prescriptionRequired: p.prescriptionRequired || false,
          saltComposition: p.saltComposition || '', dosageForm: p.dosageForm || '',
          strength: p.strength || '', usageInstructions: p.usageInstructions || '',
          storageInstructions: p.storageInstructions || '',
          isAvailable: p.isAvailable !== false, isFeatured: p.isFeatured || false,
          tags: p.tags?.join(', ') || '',
          sideEffects: p.sideEffects?.join(', ') || '',
        });
        setLoading(false);
      }).catch(() => navigate('/admin/products'));
    }
  }, [id]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        sideEffects: form.sideEffects ? form.sideEffects.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/products" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /> Back</Link>
          <div>
            <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <p>{isEdit ? `Editing: ${form.name}` : 'Fill in the product details below'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form">

        {/* Basic Info */}
        <div className="form-section">
          <p className="form-section-title">Basic Information</p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Paracetamol 500mg" />
            </div>
            <div className="form-group">
              <label className="form-label">Generic / Salt Name</label>
              <input className="form-control" value={form.genericName} onChange={e => set('genericName', e.target.value)} placeholder="e.g. Acetaminophen" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" rows="4" value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Detailed product description..." />
          </div>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Manufacturer *</label>
              <input className="form-control" value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} required placeholder="e.g. Sun Pharma" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)} required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subcategory</label>
              <input className="form-control" value={form.subcategory} onChange={e => set('subcategory', e.target.value)} placeholder="e.g. Pain Relief" />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="form-section">
          <p className="form-section-title">Pricing & Inventory</p>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">MRP / Price (₹) *</label>
              <input type="number" className="form-control" value={form.price} onChange={e => set('price', e.target.value)} required min="0" step="0.01" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Discounted Price (₹)</label>
              <input type="number" className="form-control" value={form.discountPrice} onChange={e => set('discountPrice', e.target.value)} min="0" step="0.01" placeholder="0.00 (leave 0 if no discount)" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input type="number" className="form-control" value={form.stock} onChange={e => set('stock', e.target.value)} required min="0" placeholder="0" />
            </div>
          </div>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-control" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {['strip','tablet','capsule','bottle','tube','sachet','vial','piece','kit','pack','ml','mg','g','kg'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pack Size</label>
              <input className="form-control" value={form.packSize} onChange={e => set('packSize', e.target.value)} placeholder="e.g. 10 tablets" />
            </div>
            <div className="form-group">
              <label className="form-label">Dosage Form</label>
              <input className="form-control" value={form.dosageForm} onChange={e => set('dosageForm', e.target.value)} placeholder="e.g. Tablet, Syrup, Capsule" />
            </div>
          </div>
        </div>

        {/* Medical Details */}
        <div className="form-section">
          <p className="form-section-title">Medical / Clinical Details</p>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Salt Composition</label>
              <input className="form-control" value={form.saltComposition} onChange={e => set('saltComposition', e.target.value)} placeholder="e.g. Paracetamol 500mg" />
            </div>
            <div className="form-group">
              <label className="form-label">Strength</label>
              <input className="form-control" value={form.strength} onChange={e => set('strength', e.target.value)} placeholder="e.g. 500mg, 10ml" />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                <input type="checkbox" checked={form.prescriptionRequired} onChange={e => set('prescriptionRequired', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                Prescription Required (Rx)
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Usage / Dosage Instructions</label>
            <textarea className="form-control" rows="3" value={form.usageInstructions} onChange={e => set('usageInstructions', e.target.value)} placeholder="How to use this medicine..." />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Storage Instructions</label>
              <input className="form-control" value={form.storageInstructions} onChange={e => set('storageInstructions', e.target.value)} placeholder="e.g. Store below 25°C" />
            </div>
            <div className="form-group">
              <label className="form-label">Side Effects (comma-separated)</label>
              <input className="form-control" value={form.sideEffects} onChange={e => set('sideEffects', e.target.value)} placeholder="Nausea, Headache, Dizziness" />
            </div>
          </div>
        </div>

        {/* Images & Tags */}
        <div className="form-section">
          <p className="form-section-title">Visibility & Tags</p>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-control" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="paracetamol, pain relief, fever, headache" />
          </div>
          <div className="form-group">
            <label className="form-label">Product Image URLs (comma-separated)</label>
            <input className="form-control" value={form.images || ''} onChange={e => set('images', e.target.value.split(',').map(s => s.trim()))} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Enter full image URLs. For file upload support, use the API with multipart/form-data.</p>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={form.isAvailable} onChange={e => set('isAvailable', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
              Product is Available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
              ⭐ Featured Product
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            <FiSave size={16} /> {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <Link to="/admin/products" className="btn btn-outline btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
