import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shirt,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  Truck,
  RotateCcw,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminDashboard } from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = () => {
    setLoading(true);
    setError(null);
    fetchAdminDashboard()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        setError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
      case 'Shipped':
      case 'Out for Delivery':
        return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' };
      case 'Packed':
      case 'Confirmed':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'Cancelled':
        return { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <AdminLayout pageTitle="Executive Dashboard">
      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '16px 20px',
            borderRadius: '10px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{error}</span>
          <button
            onClick={loadDashboard}
            style={{
              background: '#991B1B',
              color: '#FFF',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 className="animate-spin" size={36} color="#9B2242" />
        </div>
      ) : (
        <>
          {/* 1. Metric KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '28px'
            }}
          >
            {/* Revenue */}
            <div className="admin-card" style={{ margin: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Revenue
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 0' }}>
                    ₹{(stats?.totalRevenue || 0).toLocaleString()}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                    Live catalog sales
                  </span>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IndianRupee size={24} />
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="admin-card" style={{ margin: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Orders
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 0' }}>
                    {stats?.totalOrders || 0}
                  </h3>
                  <Link to="/admin/orders" style={{ fontSize: '0.75rem', color: '#9B2242', fontWeight: 600, textDecoration: 'none' }}>
                    View all orders →
                  </Link>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShoppingBag size={24} />
                </div>
              </div>
            </div>

            {/* Total Products */}
            <div className="admin-card" style={{ margin: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Products
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 0' }}>
                    {stats?.totalProducts || 0}
                  </h3>
                  <Link to="/admin/products" style={{ fontSize: '0.75rem', color: '#9B2242', fontWeight: 600, textDecoration: 'none' }}>
                    Manage catalog →
                  </Link>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#FDF4FF',
                    color: '#C026D3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Shirt size={24} />
                </div>
              </div>
            </div>

            {/* Total Customers */}
            <div className="admin-card" style={{ margin: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Registered Customers
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 0' }}>
                    {stats?.totalCustomers || 0}
                  </h3>
                  <Link to="/admin/customers" style={{ fontSize: '0.75rem', color: '#9B2242', fontWeight: 600, textDecoration: 'none' }}>
                    Customer profiles →
                  </Link>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#FFFBEB',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Users size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Low-Stock Warning Alert & List */}
          {stats?.lowStockCount > 0 && (
            <div
              className="admin-card"
              style={{
                borderLeft: '4px solid #EF4444',
                background: '#FEF2F2'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#991B1B', fontSize: '1rem', fontWeight: 700 }}>
                      Low-Stock Warning: {stats.lowStockCount} items need replenishment
                    </h4>
                    <p style={{ margin: '4px 0 0', color: '#7F1D1D', fontSize: '0.82rem' }}>
                      Inventory below 5 units. Update stock levels to prevent customer out-of-stock experiences.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/stock"
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Manage Stock Now
                </Link>
              </div>

              {/* Low stock previews */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '12px',
                  marginTop: '16px'
                }}
              >
                {stats.lowStockProducts.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      background: '#FFFFFF',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #FECACA',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c'}
                      alt={p.name}
                      style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {p.name}
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: p.stock === 0 ? '#DC2626' : '#D97706'
                        }}
                      >
                        {p.stock === 0 ? 'Out of Stock (0)' : `Only ${p.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Recent Orders & Status Summary Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px'
            }}
          >
            {/* Recent Orders Table */}
            <div className="admin-card" style={{ margin: 0 }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">Recent Orders</h3>
                <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: '#9B2242', fontWeight: 600, textDecoration: 'none' }}>
                  View All ({stats?.totalOrders || 0}) →
                </Link>
              </div>

              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                        <th style={{ padding: '8px 12px' }}>Order #</th>
                        <th style={{ padding: '8px 12px' }}>Customer</th>
                        <th style={{ padding: '8px 12px' }}>Amount</th>
                        <th style={{ padding: '8px 12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((ord) => {
                        const col = getStatusColor(ord.status);
                        return (
                          <tr key={ord._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>
                              <Link to="/admin/orders" style={{ color: 'inherit', textDecoration: 'none' }}>
                                {ord.orderNumber}
                              </Link>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#475569' }}>
                              {ord.customer?.name || ord.user?.name || 'Customer'}
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>
                              ₹{ord.totalAmount.toLocaleString()}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span
                                style={{
                                  background: col.bg,
                                  color: col.text,
                                  border: `1px solid ${col.border}`,
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}
                              >
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#64748B', textAlign: 'center', padding: '24px 0' }}>
                  No orders placed yet.
                </p>
              )}
            </div>

            {/* Order Status Breakdown */}
            <div className="admin-card" style={{ margin: 0 }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">Order Fulfillment Breakdown</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  'Ordered',
                  'Confirmed',
                  'Packed',
                  'Shipped',
                  'Out for Delivery',
                  'Delivered',
                  'Cancelled'
                ].map((st) => {
                  const data = stats?.ordersByStatus?.[st] || { count: 0, revenue: 0 };
                  const percent = stats?.totalOrders
                    ? Math.round((data.count / stats.totalOrders) * 100)
                    : 0;
                  const col = getStatusColor(st);

                  return (
                    <div key={st}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{st}</span>
                        <span style={{ color: '#64748B' }}>
                          <strong>{data.count}</strong> orders ({percent}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          borderRadius: '4px',
                          background: '#F1F5F9',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: col.text,
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
