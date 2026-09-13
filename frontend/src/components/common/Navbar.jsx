import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Package,
  Menu,
  X,
  Mic,
  ChevronDown,
  Sparkles,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import VoiceSearchModal from './VoiceSearchModal';
import { useShopSettings } from '../../context/ShopSettingsContext';

export default function Navbar() {
  const { categories } = useShop();
  const { user, logout, isAdmin } = useAuth();
  const { settings } = useShopSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setIsMobileSearchVisible(false);
    }
  };

  const handleVoiceSearchComplete = (spokenText) => {
    setSearchQuery(spokenText);
    navigate(`/search?q=${encodeURIComponent(spokenText.trim())}`);
  };

  const handleNavbarLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="top-announcement-bar">
        <div className="announcement-content">
          <span>{settings.shopName} | {settings.businessDescription}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="navbar-header">
        <div className="navbar-container">
          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Brand / Logo */}
          <Link to="/" className="brand-logo-link" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="brand-symbol">
              <Sparkles size={20} className="sparkle-icon" />
            </div>
            <div className="brand-text-block">
              {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.shopName} style={{ maxWidth: '150px', maxHeight: '42px', objectFit: 'contain' }} /> : (
                <>
                  <span className="brand-title-primary">{settings.shopName}</span>
                  <span className="brand-title-secondary">{settings.city || 'Online Store'}</span>
                </>
              )}
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>

            {/* Categories Dropdown trigger */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`}>
                Categories <ChevronDown size={14} className="dropdown-chevron" />
              </Link>

              {isCategoryDropdownOpen && (
                <div className="category-mega-dropdown">
                  <div className="mega-dropdown-grid">
                    {(categories || []).slice(0, 12).map((cat) => (
                      <Link
                        key={cat._id || cat.id}
                        to={`/category/${cat.slug}`}
                        className="mega-dropdown-item"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      >
                        <img src={cat.image} alt={cat.name} className="dropdown-thumb" />
                        <div>
                          <div className="dropdown-cat-name">{cat.name}</div>
                          <span className="dropdown-cat-count">{cat.itemCount || 0}+ styles</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mega-dropdown-footer">
                    <Link to="/shop" onClick={() => setIsCategoryDropdownOpen(false)}>
                      View All 18 Fashion Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/shop" className="nav-link">
              New Arrivals
            </Link>

            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
              Orders
            </Link>

            {isAdmin && (
              <Link to="/admin" className="nav-link" style={{ color: '#D4AF37', fontWeight: 600 }}>
                👑 Seller Hub
              </Link>
            )}
          </nav>

          {/* Desktop Search Bar with Voice Search */}
          <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search sarees, kurtis, gowns, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
            <button
              type="button"
              className="voice-search-trigger-btn"
              onClick={() => setIsVoiceModalOpen(true)}
              title="Voice Search with Microphone"
              aria-label="Voice Search"
            >
              <Mic size={18} />
            </button>
            <button type="submit" className="navbar-search-submit-btn">
              Search
            </button>
          </form>

          {/* Action Icons: Wishlist, Cart, Orders, Profile */}
          <div className="navbar-action-icons">
            {/* Mobile Search Toggle */}
            <button
              className="action-icon-btn mobile-only"
              onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
              aria-label="Toggle Search"
            >
              <Search size={22} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="action-icon-btn" title="My Wishlist" aria-label="Wishlist">
              <Heart size={22} />
              {wishlistCount > 0 && <span className="icon-badge wishlist-badge">{wishlistCount}</span>}
              <span className="action-label desktop-only">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="action-icon-btn cart-icon-btn" title="Shopping Bag" aria-label="Shopping Cart">
              <ShoppingBag size={22} />
              {itemCount > 0 && <span className="icon-badge cart-badge">{itemCount}</span>}
              <span className="action-label desktop-only">Cart</span>
            </Link>

            {/* Orders */}
            <Link to="/orders" className="action-icon-btn desktop-only" title="My Orders" aria-label="Orders">
              <Package size={22} />
              <span className="action-label">Orders</span>
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div
                className="user-nav-dropdown-wrapper"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <Link to="/profile" className="action-icon-btn user-avatar-btn" title="My Account" aria-label="Profile">
                  <div className="navbar-avatar-circle">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span
                    className="action-label desktop-only"
                    style={{
                      maxWidth: '80px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.name.split(' ')[0]}
                  </span>
                </Link>

                {isUserMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <p className="dropdown-user-greeting">Namaste,</p>
                      <h4 className="dropdown-user-name">{user.name}</h4>
                      <span className="dropdown-user-role-badge">
                        {isAdmin ? '👑 Admin / Merchant' : '✨ Privilege Member'}
                      </span>
                    </div>

                    <div className="user-dropdown-divider" />

                    <Link
                      to="/profile"
                      className="user-dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      <span>My Profile & Settings</span>
                    </Link>

                    <Link
                      to="/orders"
                      className="user-dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package size={16} />
                      <span>My Orders & Returns</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      className="user-dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Heart size={16} />
                      <span>My Wishlist ({wishlistCount})</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="user-dropdown-item admin-link"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Sparkles size={16} color="#D4AF37" />
                        <span style={{ color: '#92400E', fontWeight: 600 }}>Seller Hub / Admin</span>
                      </Link>
                    )}

                    <div className="user-dropdown-divider" />

                    <button
                      type="button"
                      className="user-dropdown-item logout-item"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleNavbarLogout();
                      }}
                    >
                      <LogOut size={16} color="#DC2626" />
                      <span style={{ color: '#DC2626' }}>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="action-icon-btn" title="Sign In / Register" aria-label="Sign In">
                <User size={22} />
                <span className="action-label desktop-only">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isMobileSearchVisible && (
          <div className="mobile-search-bar-wrapper">
            <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search dresses, kurtis, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="voice-search-trigger-btn"
                onClick={() => setIsVoiceModalOpen(true)}
              >
                <Mic size={18} />
              </button>
              <button type="submit" className="mobile-search-btn">
                Go
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="mobile-drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-drawer-header">
                <div className="drawer-brand">
                  <Sparkles size={18} color="#9B2242" />
                  <span>SARAVANA DRESSES</span>
                </div>
                <button
                  className="drawer-close-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Mobile User Header if logged in */}
              {user && (
                <div className="drawer-user-card">
                  <div className="drawer-user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="drawer-user-info">
                    <h4>{user.name}</h4>
                    <span className="drawer-user-email">{user.email}</span>
                    <span className="drawer-role-pill">
                      {isAdmin ? 'Admin' : 'Privilege Member'}
                    </span>
                  </div>
                </div>
              )}

              <div className="mobile-drawer-links">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">
                  Home
                </Link>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">
                  All Dresses & Shop
                </Link>
                <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">
                  My Orders & Tracking
                </Link>
                <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">
                  My Wishlist ({wishlistCount})
                </Link>
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">
                  Shopping Cart ({itemCount})
                </Link>
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">
                      My Account / Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="drawer-link"
                        style={{ color: '#D4AF37', fontWeight: 600 }}
                      >
                        👑 Seller Hub / Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNavbarLogout();
                      }}
                      className="drawer-link"
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#DC2626',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link highlight">
                    Sign In / Register
                  </Link>
                )}
              </div>

              <div className="mobile-drawer-categories">
                <h4 className="drawer-section-title">Popular Categories</h4>
                <div className="drawer-cat-list">
                  {categories.slice(0, 10).map((cat) => (
                    <Link
                      key={cat.id || cat._id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="drawer-cat-chip"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSearchSubmit={handleVoiceSearchComplete}
      />
    </>
  );
}
