import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import StarRating from '../common/StarRating';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const prodId = product._id || product.id;
  const inWishlist = isInWishlist(prodId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes && product.sizes[0] ? product.sizes[0] : 'Free Size';
    const defaultColor = product.colors && product.colors[0] ? product.colors[0].name : 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes && product.sizes[0] ? product.sizes[0] : 'Free Size';
    const defaultColor = product.colors && product.colors[0] ? product.colors[0].name : 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
    navigate('/cart');
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="product-card">
      {/* Product Image Box */}
      <div className="product-image-box">
        <Link to={`/product/${prodId}`} className="image-link">
          <img
            src={product.image}
            alt={product.name}
            className="primary-image"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="discount-pill">
            {product.discount}% OFF
          </span>
        )}

        {/* Stock Status Badge */}
        {product.stockStatus && (
          <span className={`stock-status-pill ${product.stockStatus.includes('Left') ? 'low-stock' : ''}`}>
            {product.stockStatus}
          </span>
        )}

        {/* Floating Wishlist Button */}
        <button
          className={`card-wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            fill={inWishlist ? '#E63946' : 'none'}
            color={inWishlist ? '#E63946' : '#475569'}
          />
        </button>

        {/* Quick Hover Action Bar */}
        <div className="card-quick-actions">
          <button className="quick-cart-btn" onClick={handleAddToCart}>
            <ShoppingBag size={16} />
            <span>Add to Cart</span>
          </button>
          <button className="quick-buy-btn" onClick={handleBuyNow}>
            <Zap size={16} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="product-info-box">
        <div className="product-category-brand">
          <span className="brand-tag">{product.brand}</span>
          <span className="category-dot">•</span>
          <span className="category-tag">{product.category}</span>
        </div>

        <h3 className="product-title">
          <Link to={`/product/${prodId}`}>{product.name}</Link>
        </h3>

        {/* Rating and Reviews */}
        <div className="product-rating-row">
          <StarRating rating={product.rating} reviews={product.reviews} size={14} />
        </div>

        {/* Pricing Block */}
        <div className="product-price-row">
          <span className="selling-price">₹{product.sellingPrice.toLocaleString()}</span>
          {product.originalPrice > product.sellingPrice && (
            <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Visible Mobile Action Buttons */}
        <div className="card-mobile-actions">
          <button className="btn-add-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="btn-buy-now" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
