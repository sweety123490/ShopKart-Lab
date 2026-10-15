import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, Filter, X, ArrowUpDown, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';

const CATEGORIES = [
  { id: '', label: 'All Products', icon: '✨' },
  { id: 'Electronics', label: 'Electronics', icon: '🎧' },
  { id: 'Fashion', label: 'Fashion', icon: '👕' },
  { id: 'Books', label: 'Books', icon: '📚' },
  { id: 'Home', label: 'Home', icon: '🏡' },
  { id: 'Sports', label: 'Sports', icon: '⚡' },
  { id: 'Beauty', label: 'Beauty', icon: '✨' },
];

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts({ search, category, sort });
      setProducts(data.products || []);
    } catch (err) {
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Client-side in-stock filter
  const displayedProducts = useMemo(() => {
    if (!inStockOnly) return products;
    return products.filter((p) => (p.stock || 0) > 0);
  }, [products, inStockOnly]);

  return (
    <div className="products-page">
      {/* 🌟 Luxury Header Banner */}
      <div className="products-hero-banner">
        <div className="hero-pill-tag">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Curated Tech, Fashion & Lifestyle</span>
        </div>
        <h1 className="products-main-title">
          Explore Our <span className="title-gradient">Catalog</span>
        </h1>
        <p className="products-main-subtitle">
          Discover handpicked items with instant cart synchronization, live stock validation, and 100% genuine guarantees.
        </p>

        {/* 🏷️ Interactive Category Pills */}
        <div className="category-pills-row" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-tab-pill ${category === cat.id ? 'active-pill' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              <span className="pill-icon">{cat.icon}</span>
              <span>{cat.label}</span>
              {category === cat.id && <span className="pill-active-dot" />}
            </button>
          ))}
        </div>
      </div>

      {/* 🔍 Search & Controls Bar */}
      <div className="catalog-toolbar">
        {/* Search input with clear button */}
        <div className="search-wrap-premium">
          <Search size={18} className="search-icon-premium" />
          <input
            id="product-search"
            type="text"
            placeholder="Search by name, description, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input-premium"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* In-Stock Toggle */}
        <button
          type="button"
          className={`stock-filter-pill ${inStockOnly ? 'active-stock' : ''}`}
          onClick={() => setInStockOnly((prev) => !prev)}
        >
          <div className="checkbox-indicator">
            {inStockOnly && <Check size={12} strokeWidth={3} />}
          </div>
          <span>In Stock Only</span>
        </button>

        {/* Sort Select */}
        <div className="sort-select-wrap">
          <ArrowUpDown size={15} className="sort-icon-premium" />
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sort-select-premium"
          >
            <option value="">Featured / Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Count & Active Filters Bar */}
      <div className="results-status-bar">
        <span className="results-count-text">
          Showing <strong>{displayedProducts.length}</strong> {displayedProducts.length === 1 ? 'product' : 'products'}
          {category && <> in <em>"{category}"</em></>}
          {search && <> matching <em>"{search}"</em></>}
        </span>

        {(search || category || inStockOnly || sort) && (
          <button
            type="button"
            className="reset-all-filters-btn"
            onClick={() => {
              setSearch('');
              setCategory('');
              setSort('');
              setInStockOnly(false);
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ⏳ Loading State */}
      {loading && (
        <div className="state-container luxury-loading-box">
          <div className="cart-spinner-glow">
            <div className="spinner" />
          </div>
          <p className="state-text">Loading catalog items...</p>
        </div>
      )}

      {/* ⚠️ Error State */}
      {!loading && error && (
        <div className="state-container error-state luxury-error-box">
          <p className="state-text">⚠️ {error}</p>
          <button className="btn btn-primary" onClick={fetchProducts}>Try Again</button>
        </div>
      )}

      {/* 🛒 Empty State */}
      {!loading && !error && displayedProducts.length === 0 && (
        <div className="state-container empty-catalog-box">
          <div className="empty-cart-bubble" style={{ width: 80, height: 80, margin: '0 auto 1rem' }}>
            <Filter size={36} />
          </div>
          <h3 className="empty-catalog-title">No products match your criteria</h3>
          <p className="state-subtitle">
            Try adjusting your search terms, changing the category, or clearing the filters.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearch('');
              setCategory('');
              setSort('');
              setInStockOnly(false);
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* 📦 Product Grid */}
      {!loading && !error && displayedProducts.length > 0 && (
        <div className="product-grid-premium">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
