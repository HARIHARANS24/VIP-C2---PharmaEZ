import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './ProductsPage.css';

const CATEGORIES = ['OTC Medicines','Prescription Medicines','Vitamins & Supplements','Personal Care','Medical Devices','Baby Care','Wellness Products','Healthcare Equipment','Ayurvedic & Herbal','COVID Essentials'];
const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page') || 1);
  const prescriptionRequired = searchParams.get('prescriptionRequired') || '';
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (page > 1) params.set('page', page);
      if (prescriptionRequired) params.set('prescriptionRequired', prescriptionRequired);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('limit', '12');
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {}
    setLoading(false);
  }, [keyword, category, sort, page, prescriptionRequired, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const applyPriceFilter = () => {
    const p = new URLSearchParams(searchParams);
    if (minPrice) p.set('minPrice', minPrice); else p.delete('minPrice');
    if (maxPrice) p.set('maxPrice', maxPrice); else p.delete('maxPrice');
    p.delete('page');
    setSearchParams(p);
  };

  const clearAllFilters = () => {
    setMinPrice(''); setMaxPrice('');
    setSearchParams({});
  };

  const hasFilters = keyword || category || sort || prescriptionRequired || minPrice || maxPrice;

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <div className="products-header">
          <div>
            <h1 className="products-title">
              {keyword ? `Results for "${keyword}"` : category || 'All Products'}
            </h1>
            <p className="products-count">{total} products found</p>
          </div>
          <div className="products-controls">
            <select className="sort-select" value={sort} onChange={e => updateParam('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiFilter size={15} /> Filters
            </button>
          </div>
        </div>

        {hasFilters && (
          <div className="active-filters">
            <span className="filters-label">Active Filters:</span>
            {keyword && <span className="filter-tag">Search: {keyword} <button onClick={() => updateParam('keyword', '')}><FiX size={11} /></button></span>}
            {category && <span className="filter-tag">{category} <button onClick={() => updateParam('category', '')}><FiX size={11} /></button></span>}
            {prescriptionRequired && <span className="filter-tag">Rx Required <button onClick={() => updateParam('prescriptionRequired', '')}><FiX size={11} /></button></span>}
            {(minPrice || maxPrice) && <span className="filter-tag">Price: ₹{minPrice||0} - ₹{maxPrice||'∞'} <button onClick={() => { setMinPrice(''); setMaxPrice(''); const p = new URLSearchParams(searchParams); p.delete('minPrice'); p.delete('maxPrice'); setSearchParams(p); }}><FiX size={11} /></button></span>}
            <button className="clear-filters" onClick={clearAllFilters}>Clear All</button>
          </div>
        )}

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><FiX size={18} /></button>
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4 className="filter-group-title">Category <FiChevronDown size={14} /></h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="radio" name="category" checked={category === ''} onChange={() => updateParam('category', '')} />
                  All Categories
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat} className="filter-option">
                    <input type="radio" name="category" checked={category === cat} onChange={() => updateParam('category', cat)} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Prescription */}
            <div className="filter-group">
              <h4 className="filter-group-title">Prescription</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="radio" name="rx" checked={prescriptionRequired === ''} onChange={() => updateParam('prescriptionRequired', '')} />
                  All
                </label>
                <label className="filter-option">
                  <input type="radio" name="rx" checked={prescriptionRequired === 'false'} onChange={() => updateParam('prescriptionRequired', 'false')} />
                  OTC (No Prescription)
                </label>
                <label className="filter-option">
                  <input type="radio" name="rx" checked={prescriptionRequired === 'true'} onChange={() => updateParam('prescriptionRequired', 'true')} />
                  Prescription Required
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <h4 className="filter-group-title">Price Range (₹)</h4>
              <div className="price-range">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="price-input" />
                <span>—</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="price-input" />
              </div>
              <button className="btn btn-primary btn-sm mt-2 w-full" onClick={applyPriceFilter}>Apply</button>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="products-main">
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 64 }}>🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-primary mt-3" onClick={clearAllFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid-4">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {/* Pagination */}
                {pages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={page <= 1} onClick={() => updateParam('page', page - 1)}>← Prev</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => updateParam('page', p)}>{p}</button>
                    ))}
                    <button className="page-btn" disabled={page >= pages} onClick={() => updateParam('page', page + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
