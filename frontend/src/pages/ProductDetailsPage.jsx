import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
  Minus,
  Plus,
  Loader2
} from 'lucide-react';
import { fetchProductById, fetchProducts, fetchProductReviews, submitProductReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useShopSettings } from '../context/ShopSettingsContext';
import StarRating from '../components/common/StarRating';
import ProductCard from '../components/product/ProductCard';

function ProductDetailsContent({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { settings } = useShopSettings();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size'
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchProductReviews(product._id)
      .then((response) => setReviews(response.data || []))
      .catch(() => setReviews([]));
  }, [product._id]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    try {
      await submitProductReview({ productId: product._id, rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewMessage('Review submitted for admin approval.');
    } catch (error) {
      setReviewMessage(error.message || 'Unable to submit review');
    }
  };

  const inWishlist = isInWishlist(product._id || product.id);
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/cart');
  };

  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (product.category || product.categorySlug) {
      fetchProducts({ category: product.categorySlug || product.category, limit: 5 })
        .then((res) => {
          if (isMounted && res.data) {
            const currentId = product.id || product._id;
            setRelatedProducts(res.data.filter((p) => (p.id || p._id) !== currentId).slice(0, 4));
          }
        })
        .catch((err) => console.error('Error fetching related products:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [product]);

  return (
    <div className="product-details-page">
      {/* Breadcrumb Bar */}
      <div className="details-breadcrumb-bar">
        <div className="details-container">
          <div className="breadcrumb-trail">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop">Shop</Link>
            <ChevronRight size={14} />
            <Link to={`/category/${product.categorySlug}`}>{product.category}</Link>
            <ChevronRight size={14} />
            <span className="current-crumb">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="details-container details-grid-layout">
        {/* Left: Gallery (Thumbnails + Large Main Image) */}
        <div className="product-gallery-block">
          {/* Thumbnails list */}
          <div className="gallery-thumbnails">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`thumbnail-btn ${idx === activeImageIndex ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
              >
                <img src={img} alt={`${product.name} preview ${idx + 1}`} />
              </button>
            ))}
          </div>

          {/* Large Main Display */}
          <div className="main-image-display">
            <img
              src={galleryImages[activeImageIndex] || product.image}
              alt={product.name}
              className="featured-dress-image"
            />
            {product.discount > 0 && (
              <span className="details-discount-badge">{product.discount}% OFF</span>
            )}
            <button
              className={`details-wishlist-btn ${inWishlist ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart
                size={22}
                fill={inWishlist ? '#E63946' : 'none'}
                color={inWishlist ? '#E63946' : '#1E293B'}
              />
            </button>
          </div>
        </div>

        {/* Right: Product Info & Purchase Controls */}
        <div className="product-purchase-block">
          <div className="details-brand-row">
            <Link to={`/brand/${product.brandSlug}`} className="details-brand-name">
              {product.brand}
            </Link>
            <span className="details-category-pill">{product.category}</span>
          </div>

          <h1 className="details-product-title">{product.name}</h1>

          {/* Rating and Reviews */}
          <div className="details-rating-row">
            <StarRating rating={product.rating} reviews={product.reviews} size={18} />
            <span className="verified-badge">
              <Sparkles size={14} color="#D4AF37" /> 100% Authentic
            </span>
          </div>

          {/* Pricing */}
          <div className="details-price-box">
            <div className="price-main-line">
              <span className="details-selling-price">₹{product.sellingPrice.toLocaleString()}</span>
              {product.originalPrice > product.sellingPrice && (
                <span className="details-original-price">₹{product.originalPrice.toLocaleString()}</span>
              )}
              {product.discount > 0 && (
                <span className="details-save-pill">Save {product.discount}%</span>
              )}
            </div>
            <span className="inclusive-tax-note">Inclusive of all taxes & duties</span>
          </div>

          {/* Stock Availability */}
          <div className="details-stock-row">
            <span className="stock-bullet"></span>
            <span className="stock-label">
              Availability: <strong>{product.stockStatus}</strong>
            </span>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="details-option-group">
              <label className="details-option-label">
                Color: <strong>{selectedColor}</strong>
              </label>
              <div className="details-color-swatches">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      className={`details-color-btn ${isSelected ? 'active' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      onClick={() => setSelectedColor(c.name)}
                    >
                      {isSelected && <Check size={14} color={c.name === 'White' ? '#000' : '#fff'} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="details-option-group">
              <div className="size-label-row">
                <label className="details-option-label">
                  Select Size: <strong>{selectedSize}</strong>
                </label>
                <span className="size-chart-link">Size Chart Guide</span>
              </div>
              <div className="details-size-buttons">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      className={`details-size-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="details-option-group">
            <label className="details-option-label">Quantity</label>
            <div className="quantity-stepper">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Action Buttons: Add to Cart, Buy Now */}
          <div className="details-cta-grid">
            <button className="btn-add-cart-large" onClick={handleAddToCart}>
              <ShoppingBag size={20} />
              <span>Add to Bag</span>
            </button>
            <button className="btn-buy-now-large" onClick={handleBuyNow}>
              <Zap size={20} />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Trust Value Assurances */}
          <div className="details-trust-box">
            <div className="trust-row-item">
              <Truck size={20} color="#9B2242" />
              <div>
                <strong>Free Delivery Across India</strong>
                <span>Orders above ₹999 qualify for express courier</span>
              </div>
            </div>
            <div className="trust-row-item">
              <RotateCcw size={20} color="#9B2242" />
              <div>
                <strong>Easy Returns</strong>
                <span>{settings.returnRefundPolicy}</span>
              </div>
            </div>
            <div className="trust-row-item">
              <ShieldCheck size={20} color="#9B2242" />
              <div>
                <strong>{settings.shopName} Quality Verified</strong>
                <span>{settings.businessDescription}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Fabric & Care, Delivery */}
      <div className="details-container product-tabs-section">
        <div className="tabs-header-nav">
          <button
            className={`tab-nav-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Product Description
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'fabric' ? 'active' : ''}`}
            onClick={() => setActiveTab('fabric')}
          >
            Fabric & Care
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            Delivery & Returns
          </button>
        </div>

        <div className="tab-body-card">
          {activeTab === 'description' && (
            <div className="tab-pane-content">
              <p className="tab-lead-paragraph">{product.description}</p>
              <ul className="details-bullet-list">
                <li>Exclusive designer collection from {product.brand}.</li>
                <li>Tailored with high-precision stitching for unmatched drape and contouring.</li>
                <li>Ideal for festive celebrations, weddings, evening soirees, and smart gatherings.</li>
                <li>Model is wearing size S / Free Size with standard drape.</li>
              </ul>
            </div>
          )}

          {activeTab === 'fabric' && (
            <div className="tab-pane-content">
              <div className="spec-table">
                <div className="spec-row">
                  <span className="spec-name">Fabric Composition:</span>
                  <span className="spec-val">{product.fabric || 'Pure Premium Silk & Rayon'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Weave / Pattern:</span>
                  <span className="spec-val">Artisanal Zari Brocade / Handcrafted Motifs</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Care Instructions:</span>
                  <span className="spec-val">{product.care || 'Dry clean recommended for longevity.'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="tab-pane-content">
              <p>
                {settings.customerSupport}
              </p>
              <ul className="details-bullet-list">
                <li>Metro Cities (Chennai, Bengaluru, Mumbai, Delhi): 2 - 3 business days</li>
                <li>Other Indian Cities & Towns: 3 - 5 business days</li>
                <li>Cash on Delivery (COD) available with OTP verification on delivery.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <section className="details-container product-reviews-section">
        <div className="section-header-block">
          <span className="section-eyebrow">CUSTOMER REVIEWS</span>
          <h2 className="section-main-heading">What customers say</h2>
        </div>
        {reviews.length === 0 && <p>No approved reviews yet.</p>}
        {reviews.map((review) => (
          <article key={review._id} className="product-review-item">
            <strong>{review.customerName}</strong>
            <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            <p>{review.comment}</p>
          </article>
        ))}
        {user && (
          <form className="product-review-form" onSubmit={handleReviewSubmit}>
            <label htmlFor="review-rating">Rating
              <select id="review-rating" name="rating" value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
              </select>
            </label>
            <textarea id="review-comment" name="comment" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Share your experience" required />
            <button type="submit" className="btn-primary">Submit review</button>
            {reviewMessage && <p>{reviewMessage}</p>}
          </form>
        )}
      </section>

      {/* Recommendations: You May Also Like */}
      {relatedProducts.length > 0 && (
        <section className="details-container related-products-section">
          <div className="section-header-block">
            <span className="section-eyebrow">COMPLETE YOUR LOOK</span>
            <h2 className="section-main-heading">You May Also Like</h2>
          </div>
          <div className="product-cards-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProductById(id)
      .then((res) => {
        if (isMounted) {
          if (res.data) {
            setProduct(res.data);
            setError(null);
          } else {
            setError('Product not found');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load product details from MongoDB:', err);
        if (isMounted) setError(err.message || 'Product not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, retryCount]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="#9B2242" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ color: '#9B2242' }}>Product Not Found</h2>
        <p style={{ marginTop: '12px', color: '#666', maxWidth: '480px', margin: '12px auto' }}>
          {error && error !== 'Product not found'
            ? error
            : 'The product you are looking for does not exist or has been removed.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          <button
            className="btn-primary"
            onClick={() => setRetryCount((prev) => prev + 1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
          <Link to="/shop" className="btn-secondary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return <ProductDetailsContent key={product.id || product._id} product={product} />;
}

