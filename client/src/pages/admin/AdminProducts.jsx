import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchProducts = async (kw = search, pg = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 15, page: pg });
      if (kw) params.set('keyword', kw);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(search, 1);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Products</h1>
        <p>Manage your pharmacy product catalogue</p>
      </div>

      <div className="admin-toolbar">
        <form className="admin-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit"><FiSearch size={16} /></button>
        </form>
        <Link to="/admin/products/new" className="btn btn-primary">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{total} products total</p>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rx</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={p.images?.[0] || `https://placehold.co/44x44/e8f5ee/1a8f4c?text=Med`}
                        alt={p.name}
                        className="product-img-thumb"
                      />
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                      {p.genericName && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.genericName}</p>}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                        {p.category}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontWeight: 700 }}>₹{p.discountPrice > 0 ? p.discountPrice : p.price}</p>
                      {p.discountPrice > 0 && <p style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.price}</p>}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: p.stock === 0 ? 'var(--danger)' : p.stock <= 10 ? '#f59e0b' : 'var(--success)'
                      }}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      {p.prescriptionRequired
                        ? <span className="badge badge-danger">Yes</span>
                        : <span className="badge badge-secondary">No</span>}
                    </td>
                    <td>
                      {p.isFeatured
                        ? <span className="badge badge-primary">⭐ Yes</span>
                        : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/products/${p._id}`} target="_blank" className="btn btn-outline btn-sm" title="View">
                          <FiEye size={14} />
                        </Link>
                        <Link to={`/admin/products/edit/${p._id}`} className="btn btn-outline btn-sm" title="Edit">
                          <FiEdit2 size={14} />
                        </Link>
                        <button className="btn btn-danger btn-sm" title="Delete" onClick={() => handleDelete(p._id, p.name)}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pages > 1 && (
              <div className="pagination" style={{ marginTop: 20 }}>
                <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
