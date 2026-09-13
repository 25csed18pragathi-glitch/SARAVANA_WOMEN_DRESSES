import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Package,
  Heart,
  Star,
  Settings,
  LogOut,
  Sparkles,
  Plus,
  CheckCircle,
  AlertCircle,
  Save,
  Trash2,
  Edit2,
  Check,
  Loader2,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  updateUserProfile,
  changeUserPassword,
  fetchUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  fetchMyOrders
} from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout, isAdmin } = useAuth();
  const { wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null);

  // Address state
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    fullName: '',
    phone: '',
    houseBuilding: '',
    street: '',
    area: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    isDefault: false
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // Sync user changes to profile form
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
      if (user.addresses) {
        setAddresses(user.addresses);
      }
    }
  }, [user]);

  // Load addresses & orders
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'addresses') {
      setAddressLoading(true);
      fetchUserAddresses()
        .then((res) => {
          if (isMounted && res.data) {
            setAddresses(res.data);
          }
        })
        .catch((err) => console.error('Error fetching addresses:', err))
        .finally(() => {
          if (isMounted) setAddressLoading(false);
        });
    } else if (activeTab === 'orders') {
      setOrdersLoading(true);
      fetchMyOrders()
        .then((res) => {
          if (isMounted && res.data) {
            setOrders(res.data);
          }
        })
        .catch((err) => console.error('Error fetching orders:', err))
        .finally(() => {
          if (isMounted) setOrdersLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Handle saving profile info
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileFeedback(null);
    try {
      const res = await updateUserProfile(profileForm);
      if (res.success && res.data) {
        updateUser(res.data);
        setProfileFeedback({ type: 'success', message: 'Profile updated successfully!' });
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileFeedback({ type: 'error', message: err.message || 'Error updating profile' });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileFeedback(null), 4000);
    }
  };

  // Open address modal for add
  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      type: 'Home',
      fullName: user?.name || '',
      phone: user?.phone || '',
      houseBuilding: '',
      street: '',
      area: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
      isDefault: addresses.length === 0
    });
    setAddressFeedback(null);
    setAddressModalOpen(true);
  };

  // Open address modal for edit
  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr._id || addr.id);
    setAddressForm({
      type: addr.type || 'Home',
      fullName: addr.fullName || addr.name || '',
      phone: addr.phone || '',
      houseBuilding: addr.houseBuilding || '',
      street: addr.street || '',
      area: addr.area || '',
      city: addr.city || '',
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode || '',
      isDefault: !!addr.isDefault
    });
    setAddressFeedback(null);
    setAddressModalOpen(true);
  };

  // Save address (Add or Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      setAddressFeedback({ type: 'error', message: 'Street, city, and pincode are required.' });
      return;
    }

    setAddressSaving(true);
    setAddressFeedback(null);

    try {
      let res;
      if (editingAddressId) {
        res = await updateUserAddress(editingAddressId, addressForm);
      } else {
        res = await createUserAddress(addressForm);
      }

      if (res.success && res.data) {
        setAddresses(res.data);
        updateUser({ addresses: res.data });
        setAddressModalOpen(false);
      } else {
        throw new Error(res.message || 'Failed to save address');
      }
    } catch (err) {
      setAddressFeedback({ type: 'error', message: err.message || 'Error saving address' });
    } finally {
      setAddressSaving(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    try {
      const res = await deleteUserAddress(addrId);
      if (res.success && res.data) {
        setAddresses(res.data);
        updateUser({ addresses: res.data });
      }
    } catch (err) {
      alert(err.message || 'Error deleting address');
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (addrId) => {
    try {
      const res = await setDefaultUserAddress(addrId);
      if (res.success && res.data) {
        setAddresses(res.data);
        updateUser({ addresses: res.data });
      }
    } catch (err) {
      alert(err.message || 'Error setting default address');
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await changeUserPassword(passwordForm);
      if (res.success) {
        setPasswordFeedback({ type: 'success', message: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(res.message || 'Failed to change password');
      }
    } catch (err) {
      setPasswordFeedback({ type: 'error', message: err.message || 'Failed to update password' });
    } finally {
      setPasswordSaving(false);
      setTimeout(() => setPasswordFeedback(null), 5000);
    }
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* User Banner Header */}
        <div className="profile-hero-card">
          <div className="profile-avatar-wrap">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #9B2242 0%, #4C0519 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.4rem',
                  fontWeight: 700
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-hero-meta">
            <div className="tier-badge">
              <Sparkles size={14} color="#D4AF37" />
              <span>{isAdmin ? '👑 Store Administrator' : '✨ Privilege Member'}</span>
            </div>
            <h1 className="profile-user-name">{user.name}</h1>
            <p className="profile-contact-line">
              {user.email} {user.phone && `• ${user.phone}`}
            </p>
            <span className="member-since">Role: {user.role?.toUpperCase()}</span>
          </div>

          <div className="profile-quick-stats">
            <button
              onClick={() => setActiveTab('orders')}
              className="stat-tile"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Orders</span>
            </button>
            <Link to="/wishlist" className="stat-tile">
              <span className="stat-number">{wishlistCount}</span>
              <span className="stat-label">Wishlist</span>
            </Link>
          </div>
        </div>

        {/* Tabbed Layout: Sidebar Tabs + Content Area */}
        <div className="profile-layout-grid">
          {/* Sidebar Tabs */}
          <aside className="profile-sidebar-nav">
            <button
              className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Personal Information</span>
            </button>

            <button
              className={`profile-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={18} />
              <span>Saved Addresses ({addresses.length})</span>
            </button>

            <button
              className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} />
              <span>My Orders & Returns</span>
            </button>

            <Link to="/wishlist" className="profile-nav-item">
              <Heart size={18} />
              <span>My Wishlist ({wishlistCount})</span>
            </Link>

            <button
              className={`profile-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={18} />
              <span>My Reviews</span>
            </button>

            <button
              className={`profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              <span>Account Security</span>
            </button>

            {isAdmin && (
              <Link to="/admin" className="profile-nav-item" style={{ color: '#D4AF37' }}>
                <Sparkles size={18} color="#D4AF37" />
                <span style={{ fontWeight: 600 }}>Seller Hub / Admin</span>
              </Link>
            )}

            <button className="profile-nav-item logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </aside>

          {/* Main Tab Content */}
          <main className="profile-content-area">
            {/* 1. PERSONAL INFORMATION */}
            {activeTab === 'profile' && (
              <div className="profile-tab-card">
                <div className="tab-card-header">
                  <h3>Personal Information</h3>
                  <p>Manage your name, mobile contact, and profile avatar</p>
                </div>

                {profileFeedback && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: profileFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                      border: `1px solid ${profileFeedback.type === 'success' ? '#A7F3D0' : '#FCA5A5'}`,
                      color: profileFeedback.type === 'success' ? '#065F46' : '#991B1B',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '18px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {profileFeedback.type === 'success' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span>{profileFeedback.message}</span>
                  </div>
                )}

                <form className="profile-edit-form" onSubmit={handleProfileSave}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98401 23456"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address (Account Identifier)</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      style={{ background: '#F8FAFC', cursor: 'not-allowed', color: '#64748B' }}
                    />
                    <small style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                      To update your verified email address, please contact customer support.
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Profile Avatar Image URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ marginTop: '16px' }}
                    disabled={profileSaving}
                  >
                    {profileSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Profile Details</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 2. SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="profile-tab-card">
                <div className="tab-card-header-with-action">
                  <div>
                    <h3>Saved Delivery Addresses</h3>
                    <p>Manage home, work, and family shipping destinations</p>
                  </div>
                  <button className="btn-primary" onClick={openAddAddressModal}>
                    <Plus size={16} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addressLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Loader2 className="animate-spin" size={32} color="#9B2242" />
                    <p style={{ color: '#64748B', marginTop: '10px' }}>Loading saved addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: '12px' }}>
                    <MapPin size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
                    <h4 style={{ color: '#1E293B', marginBottom: '6px' }}>No Delivery Addresses Saved Yet</h4>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '18px' }}>
                      Add your home or work address for seamless, one-click checkout.
                    </p>
                    <button className="btn-primary" onClick={openAddAddressModal}>
                      <Plus size={16} />
                      <span>Add Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="address-cards-grid">
                    {addresses.map((addr) => {
                      const addrId = addr._id || addr.id;
                      return (
                        <div key={addrId} className={`saved-address-card ${addr.isDefault ? 'is-default-card' : ''}`}>
                          <div className="address-card-top">
                            <span className="address-type-tag">{addr.type || 'Home'}</span>
                            {addr.isDefault && <span className="default-tag">Default Delivery</span>}
                          </div>
                          <h4 className="address-person-name">{addr.fullName || addr.name || user.name}</h4>
                          {addr.houseBuilding && <p className="address-text">{addr.houseBuilding}</p>}
                          <p className="address-text">{addr.street}</p>
                          {addr.area && <p className="address-text">{addr.area}</p>}
                          <p className="address-text">
                            {addr.city}, {addr.state || 'Tamil Nadu'} - <strong>{addr.pincode}</strong>
                          </p>
                          {addr.phone && <p className="address-phone">Phone: {addr.phone}</p>}

                          <div className="address-card-actions">
                            <button
                              type="button"
                              className="btn-link-action"
                              onClick={() => openEditAddressModal(addr)}
                            >
                              <Edit2 size={14} />
                              <span>Edit</span>
                            </button>

                            {!addr.isDefault && (
                              <button
                                type="button"
                                className="btn-link-action"
                                onClick={() => handleSetDefaultAddress(addrId)}
                              >
                                <Check size={14} />
                                <span>Set Default</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn-link-action remove"
                              onClick={() => handleDeleteAddress(addrId)}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="profile-tab-card">
                <div className="tab-card-header">
                  <h3>My Orders & Courier Tracking</h3>
                  <p>Track live dispatches, view invoices, and manage returns</p>
                </div>

                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Loader2 className="animate-spin" size={32} color="#9B2242" />
                    <p style={{ color: '#64748B', marginTop: '10px' }}>Fetching your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: '#F8FAFC', borderRadius: '12px' }}>
                    <ShoppingBag size={48} color="#94A3B8" style={{ marginBottom: '14px' }} />
                    <h4 style={{ color: '#1E293B', marginBottom: '8px' }}>No Orders Found</h4>
                    <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '20px' }}>
                      You haven't placed any saree or dress orders yet. Explore our handcrafted collections!
                    </p>
                    <Link to="/shop" className="btn-primary">
                      <span>Explore Catalog</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => {
                      const orderKey = order._id || order.id || order.orderNumber;
                      return (
                        <div
                          key={orderKey}
                          style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '18px',
                            background: '#FFFFFF'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '10px',
                              borderBottom: '1px solid #F1F5F9',
                              paddingBottom: '12px',
                              marginBottom: '12px'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '1rem', color: '#1E293B' }}>
                                Order #{order.orderNumber}
                              </strong>
                              <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'block' }}>
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '9999px',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  background:
                                    order.status === 'Delivered'
                                      ? '#ECFDF5'
                                      : order.status === 'Cancelled'
                                      ? '#FEF2F2'
                                      : '#FEF3C7',
                                  color:
                                    order.status === 'Delivered'
                                      ? '#065F46'
                                      : order.status === 'Cancelled'
                                      ? '#991B1B'
                                      : '#92400E'
                                }}
                              >
                                {order.status}
                              </span>
                              <strong style={{ fontSize: '1.05rem', color: '#9B2242' }}>
                                ₹{order.totalAmount?.toLocaleString()}
                              </strong>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}
                              >
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                )}
                                <div>
                                  <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>{item.name}</p>
                                  <small style={{ color: '#64748B' }}>
                                    Qty: {item.quantity} • Size: {item.size} • ₹{item.price?.toLocaleString()}
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Link
                              to={`/orders/${order.orderNumber || order._id}`}
                              className="btn-secondary"
                              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                            >
                              Track & Details →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="profile-tab-card">
                <div className="tab-card-header">
                  <h3>My Product Reviews</h3>
                  <p>Reviews and ratings shared for past purchases</p>
                </div>

                <div className="user-review-item">
                  <div className="review-product-header">
                    <span className="review-product-name">Kanjeevaram Gold Zari Pure Silk Saree</span>
                    <span className="review-date">Verified Purchase</span>
                  </div>
                  <div className="review-stars-line">
                    <Star size={16} fill="#D4AF37" color="#D4AF37" />
                    <Star size={16} fill="#D4AF37" color="#D4AF37" />
                    <Star size={16} fill="#D4AF37" color="#D4AF37" />
                    <Star size={16} fill="#D4AF37" color="#D4AF37" />
                    <Star size={16} fill="#D4AF37" color="#D4AF37" />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>5.0 • Exceptional Quality</span>
                  </div>
                  <p className="review-body-text">
                    "The sheen and zari work on this Kanjeevaram saree is absolutely authentic. Draped wonderfully for my family wedding. Received numerous compliments!"
                  </p>
                </div>
              </div>
            )}

            {/* 5. ACCOUNT SECURITY (CHANGE PASSWORD) */}
            {activeTab === 'settings' && (
              <div className="profile-tab-card">
                <div className="tab-card-header">
                  <h3>Account Settings & Password Security</h3>
                  <p>Update your password to keep your Saravana account secure</p>
                </div>

                {passwordFeedback && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: passwordFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                      border: `1px solid ${passwordFeedback.type === 'success' ? '#A7F3D0' : '#FCA5A5'}`,
                      color: passwordFeedback.type === 'success' ? '#065F46' : '#991B1B',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '18px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ maxWidth: '480px' }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password (min. 6 characters)</label>
                    <input
                      type="password"
                      placeholder="Enter new strong password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-type new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ marginTop: '12px' }}
                    disabled={passwordSaving}
                  >
                    {passwordSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="settings-section" style={{ marginTop: '36px', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
                  <h4>Communication Notifications</h4>
                  <div className="settings-toggle-row">
                    <div>
                      <strong>Order Status SMS & WhatsApp Notifications</strong>
                      <p>Receive real-time courier tracking updates via WhatsApp</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Festive Offers & VIP Sale Early Access</strong>
                      <p>Get notified 24 hours before grand saree and festive sales begin</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle-switch" />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {addressModalOpen && (
        <div className="modal-backdrop" onClick={() => setAddressModalOpen(false)}>
          <div className="address-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header-row">
              <h3>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h3>
              <button className="modal-close-btn" onClick={() => setAddressModalOpen(false)}>
                &times;
              </button>
            </div>

            {addressFeedback && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  fontSize: '0.85rem'
                }}
              >
                <AlertCircle size={16} />
                <span>{addressFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="modal-address-form">
              <div className="form-group">
                <label>Address Type</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Home', 'Work', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-select-btn ${addressForm.type === t ? 'active' : ''}`}
                      onClick={() => setAddressForm({ ...addressForm, type: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Recipient's Name"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Flat / House / Building No.</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, Royal Residency"
                  value={addressForm.houseBuilding}
                  onChange={(e) => setAddressForm({ ...addressForm, houseBuilding: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 42, Cathedral Road"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Area / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Near Gemini Flyover, Gopalapuram"
                  value={addressForm.area}
                  onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    placeholder="Tamil Nadu"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 600086"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  required
                />
              </div>

              <div className="auth-remember-row" style={{ marginTop: '10px' }}>
                <label className="checkbox-remember">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, isDefault: e.target.checked })
                    }
                  />
                  <span>Set as default shipping destination</span>
                </label>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setAddressModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={addressSaving}>
                  {addressSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingAddressId ? 'Update Address' : 'Save Address'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
