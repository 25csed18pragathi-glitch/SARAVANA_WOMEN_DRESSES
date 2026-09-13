import { X, RotateCcw, Check } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const COLORS = [
  { name: 'Red', hex: '#9B2242' },
  { name: 'Blue', hex: '#1D3557' },
  { name: 'Green', hex: '#2D6A4F' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#F8F9FA' },
  { name: 'Pink', hex: '#F4ACB7' },
  { name: 'Yellow', hex: '#E9C46A' }
];

export default function FilterSidebar({
  categories: propCategories,
  brands: propBrands,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  onReset,
  isOpenMobile,
  onCloseMobile
}) {
  const shopContext = useShop();
  const categories = propCategories || shopContext.categories || [];
  const brands = propBrands || shopContext.brands || [];
  const handleCategoryChange = (slug) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === slug ? '' : slug
    }));
  };

  const handleBrandChange = (brandName) => {
    setFilters((prev) => ({
      ...prev,
      brand: prev.brand === brandName ? '' : brandName
    }));
  };

  const handlePriceRangeChange = (min, max) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  };

  const handleRatingChange = (minRating) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === minRating ? 0 : minRating
    }));
  };

  const handleSizeChange = (size) => {
    setFilters((prev) => ({
      ...prev,
      size: prev.size === size ? '' : size
    }));
  };

  const handleColorChange = (colorName) => {
    setFilters((prev) => ({
      ...prev,
      color: prev.color === colorName ? '' : colorName
    }));
  };

  const content = (
    <div className="filter-sidebar-content">
      {/* Header & Reset */}
      <div className="filter-header-row">
        <h3 className="filter-main-title">Filters</h3>
        <button className="filter-reset-btn" onClick={onReset} title="Reset all filters">
          <RotateCcw size={14} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Sorting Control */}
      <div className="filter-group">
        <label className="filter-group-title">Sort By</label>
        <select
          id="product-sort"
          name="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-sort-select"
        >
          <option value="popular">Popular & Trending</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest Arrivals</option>
          <option value="rating-desc">Highest Customer Rated</option>
        </select>
      </div>

      {/* Availability */}
      <div className="filter-group">
        <label className="filter-group-title">Availability</label>
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            id="in-stock-only"
            name="inStockOnly"
            checked={filters.inStockOnly || false}
            onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label className="filter-group-title">Price Range</label>
        <div className="price-filter-options">
          {[
            { label: 'All Prices', min: 0, max: 20000 },
            { label: 'Under ₹1,000', min: 0, max: 1000 },
            { label: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
            { label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
            { label: 'Above ₹5,000', min: 5000, max: 20000 }
          ].map((range, index) => {
            const isSelected = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button
                key={index}
                type="button"
                className={`price-chip-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handlePriceRangeChange(range.min, range.max)}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="filter-group">
        <label className="filter-group-title">Category</label>
        <div className="filter-scroll-list">
          {categories.map((cat) => {
            const isChecked = filters.category === cat.slug;
            return (
              <label key={cat.id || cat._id} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  id={`category-${cat.slug}`}
                  name="category"
                  checked={isChecked}
                  onChange={() => handleCategoryChange(cat.slug)}
                />
                <span className="checkbox-text">{cat.name}</span>
                <span className="checkbox-count">({cat.itemCount || 0})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      <div className="filter-group">
        <label className="filter-group-title">Brand</label>
        <div className="filter-scroll-list">
          {brands.map((b) => {
            const isChecked = filters.brand === b.name;
            return (
              <label key={b.id || b._id} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  id={`brand-${b.slug || b.name}`}
                  name="brand"
                  checked={isChecked}
                  onChange={() => handleBrandChange(b.name)}
                />
                <span className="checkbox-text">{b.name}</span>
                <span className="checkbox-count">({b.itemCount || 0})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="filter-group">
        <label className="filter-group-title">Size</label>
        <div className="size-selector-grid">
          {SIZES.map((sz) => {
            const isSelected = filters.size === sz;
            return (
              <button
                key={sz}
                type="button"
                className={`size-filter-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleSizeChange(sz)}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="filter-group">
        <label className="filter-group-title">Color</label>
        <div className="color-swatches-grid">
          {COLORS.map((c) => {
            const isSelected = filters.color === c.name;
            return (
              <button
                key={c.name}
                type="button"
                className={`color-filter-swatch ${isSelected ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                onClick={() => handleColorChange(c.name)}
              >
                {isSelected && <Check size={12} color={c.name === 'White' ? '#000' : '#fff'} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="filter-group">
        <label className="filter-group-title">Customer Rating</label>
        <div className="rating-filter-options">
          {[4.5, 4.0, 3.5].map((rt) => (
            <label key={rt} className="filter-radio-label">
              <input
                type="radio"
                name="rating_filter"
                checked={filters.rating === rt}
                onChange={() => handleRatingChange(rt)}
              />
              <span>★ {rt} & above</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="desktop-filter-sidebar">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="mobile-filter-drawer-backdrop" onClick={onCloseMobile}>
          <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header-row">
              <h3>Filter & Sort</h3>
              <button className="drawer-close-btn" onClick={onCloseMobile}>
                <X size={20} />
              </button>
            </div>
            <div className="drawer-body-scroll">
              {content}
            </div>
            <div className="drawer-footer-row">
              <button className="btn-secondary" onClick={onReset}>
                Reset
              </button>
              <button className="btn-primary" onClick={onCloseMobile}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
