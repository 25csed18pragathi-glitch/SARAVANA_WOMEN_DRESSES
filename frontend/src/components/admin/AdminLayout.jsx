import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Tag,
  ShoppingBag,
  AlertTriangle,
  Users,
  Star,
  LogOut,
  Store,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useShopSettings } from '../../context/ShopSettingsContext';
import './AdminLayout.css';

export default function AdminLayout({ children, pageTitle = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const { settings } = useShopSettings();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: Shirt, label: 'Products' },
    { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { to: '/admin/brands', icon: Tag, label: 'Brands' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/stock', icon: AlertTriangle, label: 'Stock & Inventory' },
    { to: '/admin/customers', icon: Users, label: 'Customers' },
    { to: '/admin/reviews', icon: Star, label: 'Reviews' },
    { to: '/admin/settings', icon: Settings, label: 'Shop Settings' }
  ];

  return (
    <div className="admin-wrapper">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand-logo">
            <div className="admin-brand-logo-icon">
              <Sparkles size={18} />
            </div>
            <div className="admin-brand-title">
              <span className="admin-brand-name">{settings.shopName}</span>
              <span className="admin-brand-subtitle">SELLER HUB</span>
            </div>
          </Link>
          <button
            className="admin-menu-toggle"
            onClick={() => setIsMobileOpen(false)}
            style={{ color: '#94A3B8' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-title">Store Management</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-storefront-btn" target="_blank" rel="noreferrer">
            <Store size={16} />
            <span>View Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-toggle"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle Sidebar"
            >
              <Menu size={22} />
            </button>
            <h1 className="admin-page-title">{pageTitle}</h1>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-status-pill">
              <span className="admin-status-dot" />
              <span>MongoDB Connected</span>
            </div>

            <div className="admin-user-profile">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={user?.name || 'Admin'}
                className="admin-avatar"
              />
              <div className="admin-user-details">
                <span className="admin-user-name">{user?.name || 'Store Admin'}</span>
                <span className="admin-user-role">Administrator</span>
              </div>
            </div>

            <button
              className="admin-logout-btn"
              onClick={handleLogout}
              title="Sign Out of Admin Portal"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
