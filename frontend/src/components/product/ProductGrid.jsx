import { useState } from 'react';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';

export default function ProductGrid({
  products = [],
  itemsPerPage = 8,
  emptyMessage = 'No dresses found matching your selection.',
  onResetFilters = null
}) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + itemsPerPage);
  };

  if (!products || products.length === 0) {
    return (
      <div className="empty-product-grid">
        <div className="empty-icon-circle">
          <PackageOpen size={48} color="#9B2242" />
        </div>
        <h3 className="empty-title">No Dresses Found</h3>
        <p className="empty-description">{emptyMessage}</p>
        {onResetFilters && (
          <button className="btn-primary" onClick={onResetFilters} style={{ marginTop: '16px' }}>
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="product-grid-wrapper">
      <div className="product-count-bar">
        <span>
          Showing <strong>{displayedProducts.length}</strong> of <strong>{products.length}</strong> dresses
        </span>
      </div>

      <div className="product-cards-grid">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button className="btn-load-more" onClick={handleLoadMore}>
            Load More Dresses ({products.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
