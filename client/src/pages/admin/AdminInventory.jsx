import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiPackage, FiEdit2 } from 'react-icons/fi';
import api from '../../utils/api';
import './AdminPages.css';

export default function AdminInventory() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/inventory')
      .then(r => setInventory(r.data.inventory))
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get('/products?limit=50&sort=rating')
      .then(r => setProducts(r.data.products))
      .finally(() => setProductsLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Inventory Management</h1>
        <p>Monitor stock levels and manage product availability</p>
      </div>

      {/* Summary Cards */}
      <div className="inventory-grid">
        <div className="inv-card success">
          <h3>{inventory?.inStock}</h3>
          <p>In Stock</p>
        </div>
        <div className="inv-card warning">
          <h3>{inventory?.lowStockCount}</h3>
          <p>Low Stock (≤10 units)</p>
        </div>
        <div className="inv-card danger">
          <h3>{inventory?.outOfStock}</h3>
          <p>Out of Stock</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="admin-grid-2">
        <div className="admin-card">
          <h3 className="admin-card-title">Stock by Category</h3>
          <table className="admin-table">
            <thead>
              <tr><th>Category</th><th>Products</th><th>Total Stock</th></tr>
            </thead>
            <tbody>
              {inventory?.byCategory?.map((cat, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{cat._id}</span>
                  </td>
                  <td>{cat.count}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: cat.totalStock < 50 ? 'var(--danger)' : 'var(--success)' }}>
                      {cat.totalStock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alert */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            <FiAlertTriangle size={15} style={{ color: '#f59e0b', marginRight: 8 }} />
            Low Stock Alert
          </h3>
          {inventory?.lowStockItems?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <p style={{ color: 'var(--text-secondary)' }}>All products are well stocked!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Action</th></tr></thead>
              <tbody>
                {inventory?.lowStockItems?.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontSize: 13, fontWeight: 600, maxWidth: 180 }}>{p.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.category}</td>
                    <td>
                      <span style={{
                        fontWeight: 800, fontSize: 15,
                        color: p.stock === 0 ? 'var(--danger)' : '#f59e0b'
                      }}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/products/edit/${p._id}`} className="btn btn-outline btn-sm">
                        <FiEdit2 size={12} /> Restock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* All Products Stock Table */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 className="admin-card-title" style={{ marginBottom: 0 }}>
            <FiPackage size={15} style={{ marginRight: 8 }} /> Full Stock Overview
          </h3>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">+ Add Product</Link>
        </div>

        {productsLoading ? (
          <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Rx</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={p.images?.[0] || `https://placehold.co/36x36/e8f5ee/1a8f4c?text=Med`}
                        alt={p.name}
                        style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, background: 'var(--bg-secondary)', padding: 3 }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                        {p.packSize && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.packSize}</p>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{p.discountPrice > 0 ? p.discountPrice : p.price}</td>
                  <td>
                    <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                      <span style={{
                        fontWeight: 800,
                        color: p.stock === 0 ? 'var(--danger)' : p.stock <= 10 ? '#f59e0b' : 'var(--success)'
                      }}>
                        {p.stock}
                      </span>
                      {p.stock === 0 && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Out of Stock</span>}
                      {p.stock > 0 && p.stock <= 10 && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Low</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                      background: p.isAvailable ? '#d1fae5' : '#fde8e8',
                      color: p.isAvailable ? '#065f46' : 'var(--danger)'
                    }}>
                      {p.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    {p.prescriptionRequired ? <span className="badge badge-danger">Rx</span> : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>OTC</span>}
                  </td>
                  <td>
                    <Link to={`/admin/products/edit/${p._id}`} className="btn btn-outline btn-sm">
                      <FiEdit2 size={12} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
