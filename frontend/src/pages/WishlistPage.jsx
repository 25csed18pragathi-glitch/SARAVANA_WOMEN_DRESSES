import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import StarRating from '../components/common/StarRating';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (product) => {
    const size = product.sizes && product.sizes[0] ? product.sizes[0] : 'Free Size';
    const color = product.colors && product.colors[0] ? product.colors[0].name : 'Standard';
    addToCart(product, size, color, 1);
    removeFromWishlist(product._id || product.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty-wrapper">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrap">
            <Heart size={50} color="#9B2242" />
          </div>
          <h2 className="empty-cart-title">Your Wishlist is Empty</h2>
          <p className="empty-cart-desc">
            Save your favorite sarees, kurtis, and designer outfits here to review them later or move them directly to your bag.
          </p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
            Explore Fashion Dresses <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page-wrapper">
      <div className="wishlist-container">
        <div className="wishlist-header-bar">
          <div>
            <span className="wishlist-breadcrumb">Home / My Account / Wishlist</span>
            <h1 className="wishlist-title">My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})</h1>
          </div>
          <Link to="/shop" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>

        <div className="wishlist-cards-grid">
          {wishlistItems.map((item) => {
            const prodId = item._id || item.id;
            return (
              <div key={prodId} className="wishlist-item-card">
                <div className="wishlist-card-image-box">
                  <Link to={`/product/${prodId}`}>
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <button
                    className="wishlist-remove-icon-btn"
                    onClick={() => removeFromWishlist(prodId)}
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                  {item.discount > 0 && (
                    <span className="discount-pill">{item.discount}% OFF</span>
                  )}
                </div>

                <div className="wishlist-card-body">
                  <span className="wishlist-brand-name">{item.brand}</span>
                  <h3 className="wishlist-item-title">
                    <Link to={`/product/${prodId}`}>{item.name}</Link>
                  </h3>

                <div className="wishlist-rating-row">
                  <StarRating rating={item.rating || 4.8} reviews={item.reviews || 95} size={13} />
                </div>

                <div className="wishlist-price-row">
                  <span className="wishlist-selling-price">₹{item.sellingPrice.toLocaleString()}</span>
                  {item.originalPrice > item.sellingPrice && (
                    <span className="wishlist-original-price">₹{item.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                <button
                  className="btn-move-to-bag"
                  onClick={() => handleMoveToBag(item)}
                >
                  <ShoppingBag size={16} />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
