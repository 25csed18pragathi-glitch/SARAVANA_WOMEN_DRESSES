import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { fetchProducts } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import FilterSidebar from '../components/product/FilterSidebar';

export default function ShopPage() {
  const { categorySlug, brandSlug } = useParams();
  const [searchParams] = useSearchParams();
  const { categories, brands, getCategoryBySlug, getBrandBySlug } = useShop();

  // Filter state
  const [filters, setFilters] = useState({
    category: categorySlug || searchParams.get('category') || '',
    brand: brandSlug ? getBrandBySlug(brandSlug)?.name || '' : '',
    minPrice: 0,
    maxPrice: 20000,
    rating: 0,
    size: '',
    color: '',
    inStockOnly: false
  });

  const [sortBy, setSortBy] = useState('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Sync URL params if route or loaded brands change
  useEffect(() => {
    setFilters((prev) => {
      const resolvedCategory = categorySlug || searchParams.get('category') || '';
      const resolvedBrand = brandSlug ? (getBrandBySlug(brandSlug)?.name || brandSlug) : '';
      if (prev.category === resolvedCategory && prev.brand === resolvedBrand) {
        return prev;
      }
      return {
        ...prev,
        category: resolvedCategory,
        brand: resolvedBrand
      };
    });
  }, [categorySlug, brandSlug, brands, searchParams]);

  // Active Category & Brand dynamically resolved from MongoDB
  const activeCategory = getCategoryBySlug(filters.category) || categories.find((c) => c.slug === filters.category || c.name?.toLowerCase() === filters.category?.toLowerCase());
  const activeBrand = brands.find((b) => b.name === filters.brand || b.slug === filters.brand) || (brandSlug ? getBrandBySlug(brandSlug) : null);

  const resetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 20000,
      rating: 0,
      size: '',
      color: '',
      inStockOnly: false
    });
    setSortBy('popular');
    setError(null);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Fetch filtered products dynamically from MongoDB Atlas
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const apiParams = {
      limit: 100,
      sort: sortBy
    };

    if (filters.category) apiParams.category = filters.category;
    if (filters.brand) apiParams.brand = filters.brand;
    if (filters.minPrice > 0) apiParams.minPrice = filters.minPrice;
    if (filters.maxPrice < 20000) apiParams.maxPrice = filters.maxPrice;
    if (filters.rating > 0) apiParams.minRating = filters.rating;
    if (filters.size) apiParams.size = filters.size;
    if (filters.color) apiParams.color = filters.color;
    if (filters.inStockOnly) apiParams.availability = 'In Stock';

    fetchProducts(apiParams)
      .then((res) => {
        if (isMounted) {
          setProducts(res.data || []);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching filtered products from MongoDB:', err);
        if (isMounted) {
          setProducts([]);
          setError(err.message || 'Failed to fetch dresses from database');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters, sortBy, retryCount]);

  return (
    <div className="shop-page-wrapper">
      {/* Category / Brand Hero Banner if applicable */}
      <div className="shop-header-banner">
        <div className="shop-header-container">
          <div className="shop-header-text">
            <span className="shop-breadcrumb">
              Home / Shop {activeCategory ? `/ ${activeCategory.name}` : ''} {activeBrand ? `/ ${activeBrand.name}` : ''}
            </span>
            <h1 className="shop-title">
              {activeCategory ? activeCategory.name : activeBrand ? activeBrand.name : 'Women’s Fashion Catalog'}
            </h1>
            <p className="shop-description">
              {activeCategory
                ? activeCategory.description
                : activeBrand
                ? activeBrand.description
                : 'Browse our exclusive curated catalog of designer sarees, festive kurtis, lehengas, gowns, and western chic apparel.'}
            </p>
          </div>
        </div>
      </div>

      <div className="shop-layout-container">
        {/* Mobile Filter & Sort Button Bar */}
        <div className="mobile-filter-bar">
          <button
            className="mobile-filter-trigger-btn"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={18} />
            <span>Filters & Sort ({products.length})</span>
          </button>
        </div>

        {/* Sidebar Filters */}
        <FilterSidebar
          categories={categories}
          brands={brands}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={resetFilters}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Main Product Listing Area */}
        <main className="shop-main-content">
          {/* Active Filter Badges */}
          {(filters.category ||
            filters.brand ||
            filters.size ||
            filters.color ||
            filters.rating > 0 ||
            filters.minPrice > 0 ||
            filters.inStockOnly) && (
            <div className="active-filters-strip">
              <span className="active-filter-label">Active Filters:</span>
              {filters.category && (
                <span className="active-filter-pill">
                  Category: {activeCategory ? activeCategory.name : filters.category}
                  <button onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.brand && (
                <span className="active-filter-pill">
                  Brand: {filters.brand}
                  <button onClick={() => setFilters((prev) => ({ ...prev, brand: '' }))}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.size && (
                <span className="active-filter-pill">
                  Size: {filters.size}
                  <button onClick={() => setFilters((prev) => ({ ...prev, size: '' }))}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.color && (
                <span className="active-filter-pill">
                  Color: {filters.color}
                  <button onClick={() => setFilters((prev) => ({ ...prev, color: '' }))}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.rating > 0 && (
                <span className="active-filter-pill">
                  ★ {filters.rating}+
                  <button onClick={() => setFilters((prev) => ({ ...prev, rating: 0 }))}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.inStockOnly && (
                <span className="active-filter-pill">
                  In Stock Only
                  <button onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}>
                    <X size={12} />
                  </button>
                </span>
              )}
              <button className="clear-all-pill-btn" onClick={resetFilters}>
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid / Loading / Error State */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <Loader2 className="animate-spin" size={36} color="#9B2242" />
            </div>
          ) : error ? (
            <div className="empty-product-grid" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="empty-icon-circle" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                <AlertCircle size={44} color="#991B1B" />
              </div>
              <h3 className="empty-title" style={{ color: '#991B1B' }}>Unable to Load Products</h3>
              <p className="empty-description" style={{ maxWidth: '480px', margin: '8px auto 20px', color: '#666' }}>
                {error}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={handleRetry}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={14} />
                  <span>Retry</span>
                </button>
                <button className="btn-secondary" onClick={resetFilters}>
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <ProductGrid
              products={products}
              itemsPerPage={9}
              emptyMessage="No dresses found matching the selected filters. Try broadening your criteria or clicking 'Reset All Filters'."
              onResetFilters={resetFilters}
            />
          )}
        </main>
      </div>
    </div>
  );
}
