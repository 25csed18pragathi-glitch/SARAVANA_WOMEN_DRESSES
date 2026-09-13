import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, Eye, X, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminCustomers, fetchAdminCustomerById } from '../../services/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadCustomers = () => {
    setLoading(true);
    fetchAdminCustomers({ search: searchTerm })
      .then((res) => {
        if (res.data) setCustomers(res.data);
      })
      .catch((err) => console.error('Error fetching customers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setLoadingDetails(true);
    try {
      const res = await fetchAdminCustomerById(cust._id);
      if (res.data?.orders) {
        setCustomerOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error loading customer orders:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <AdminLayout pageTitle="Registered Customer Accounts">
      {/* Header Search */}
      <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A' }}>
              Customer Directory ({customers.length})
            </h3>
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.85rem' }}>
              Confidential customer details accessible strictly to authorized administrators.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Customer Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={36} color="#9B2242" />
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ color: '#0F172A', margin: '0 0 6px' }}>No customers found</h3>
            <p style={{ margin: 0 }}>Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Contact Info</th>
                  <th style={{ padding: '12px 16px' }}>Primary Address</th>
                  <th style={{ padding: '12px 16px' }}>Orders Placed</th>
                  <th style={{ padding: '12px 16px' }}>Total Spent</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => {
                  const defaultAddr = cust.addresses?.find((a) => a.isDefault) || cust.addresses?.[0];
                  return (
                    <tr key={cust._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={cust.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                            alt={cust.name}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, color: '#0F172A', display: 'block' }}>
                              {cust.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Joined {new Date(cust.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                          <span style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} color="#64748B" />
                            {cust.email}
                          </span>
                          {cust.phone && (
                            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} color="#64748B" />
                              {cust.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {defaultAddr ? (
                          <span style={{ fontSize: '0.82rem', color: '#334155' }}>
                            {defaultAddr.city}, {defaultAddr.state} ({defaultAddr.pincode})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No address saved</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#EFF6FF',
                            color: '#1E40AF',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          <ShoppingBag size={12} />
                          <span>{cust.orderCount || 0} orders</span>
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>
                          ₹{(cust.totalSpent || 0).toLocaleString()}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleViewCustomer(cust)}
                          style={{
                            background: '#F1F5F9',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#0F172A'
                          }}
                        >
                          <Eye size={13} />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile & Orders Modal */}
      {selectedCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              borderRadius: '16px',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#FFF',
                zIndex: 10
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
                  Customer Profile: {selectedCustomer.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Member since {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Profile Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '20px'
                }}
              >
                <img
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.name}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #D4AF37' }}
                />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#0F172A' }}>
                    {selectedCustomer.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                    Email: <strong>{selectedCustomer.email}</strong>
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#475569' }}>
                    Phone: <strong>{selectedCustomer.phone || 'Not provided'}</strong>
                  </p>
                </div>
              </div>

              {/* Saved Addresses */}
              <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#0F172A' }}>Saved Shipping Addresses</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {selectedCustomer.addresses?.map((addr, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '12px',
                      background: '#FFF'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9B2242', textTransform: 'uppercase' }}>
                      {addr.type} Address {addr.isDefault && '• (Default)'}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#334155' }}>
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order History */}
              <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#0F172A' }}>Past Order History</h4>
              {loadingDetails ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                  <Loader2 className="animate-spin" size={28} color="#9B2242" />
                </div>
              ) : customerOrders.length === 0 ? (
                <p style={{ color: '#64748B', fontSize: '0.88rem' }}>No orders found for this customer.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customerOrders.map((ord) => (
                    <div
                      key={ord._id}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#FFF'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                          {ord.orderNumber}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN')} • {ord.items?.length || 1} dress{ord.items?.length === 1 ? '' : 'es'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A', display: 'block', fontSize: '0.92rem' }}>
                          ₹{ord.totalAmount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
