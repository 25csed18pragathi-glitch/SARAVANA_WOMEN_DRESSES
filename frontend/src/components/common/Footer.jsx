import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, RefreshCw, Lock, Send, Heart } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useShopSettings } from '../../context/ShopSettingsContext';

export default function Footer() {
  const { categories } = useShop();
  const { settings } = useShopSettings();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="site-footer">
      {/* Value Proposition Highlights */}
      <div className="footer-highlights">
        <div className="footer-highlights-container">
          <div className="highlight-item">
            <div className="highlight-icon-wrap">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4>100% Genuine Fashion</h4>
              <p>Authentic fabrics and handloom verified craftsmanship</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-wrap">
              <Truck size={28} />
            </div>
            <div>
              <h4>Free Express Delivery</h4>
              <p>On all orders above ₹999 across India</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-wrap">
              <RefreshCw size={28} />
            </div>
            <div>
              <h4>Easy Returns</h4>
              <p>{settings.returnRefundPolicy}</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-wrap">
              <Lock size={28} />
            </div>
            <div>
              <h4>100% Secure Checkout</h4>
              <p>Encrypted transactions & Cash on Delivery available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Col 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand-logo">
              <Sparkles size={20} color="#D4AF37" />
              <span>{settings.shopName}</span>
            </div>
            <p className="footer-description">
              {settings.businessDescription}
            </p>
            <div className="footer-contact-info">
              {settings.phone && <p><strong>Customer Concierge:</strong> {settings.phone}</p>}
              {settings.email && <p><strong>Email:</strong> {settings.email}</p>}
              {(settings.address || settings.city || settings.state || settings.pincode) && <p><strong>Location:</strong> {[settings.address, settings.city, settings.state, settings.pincode].filter(Boolean).join(', ')}</p>}
              {settings.mapLink && <p><a href={settings.mapLink} target="_blank" rel="noreferrer">View store location</a></p>}
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="footer-col">
            <h4 className="footer-title">Top Categories</h4>
            <ul className="footer-link-list">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id || cat._id}>
                  <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: More Categories */}
          <div className="footer-col">
            <h4 className="footer-title">More Collections</h4>
            <ul className="footer-link-list">
              {categories.slice(8, 16).map((cat) => (
                <li key={cat.id || cat._id}>
                  <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Customer Services & Newsletter */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-title">Stay In Vogue</h4>
            <p className="footer-newsletter-text">
              Subscribe to unlock secret festive discounts, early access to new collections, and styling tips.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" aria-label="Subscribe">
                <Send size={16} />
              </button>
            </form>

            {subscribed && (
              <div className="newsletter-success">
                🎉 Thank you for subscribing! Check your inbox for 10% off.
              </div>
            )}

            <div className="footer-quick-account">
              <h5 style={{ color: '#fff', marginTop: '20px', marginBottom: '8px', fontSize: '0.95rem' }}>Quick Links</h5>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                <Link to="/orders">Track Order</Link>
                <Link to="/profile">My Account</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/cart">Cart</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} {settings.shopName}. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/shop">Privacy Policy</Link>
            <span>•</span>
            <Link to="/shop">Terms of Service</Link>
            <span>•</span>
            <Link to="/shop">Shipping & Returns</Link>
          </div>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
            Handcrafted with <Heart size={14} color="#E63946" fill="#E63946" /> for fashion lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
