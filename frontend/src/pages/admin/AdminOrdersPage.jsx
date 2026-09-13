import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  X,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../services/api';

const ORDER_STATUSES = [
  'Ordered',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusNote, setStatusNote] = useState('');

  const loadOrders = () => {
    setLoading(true);
    fetchAdminOrders({
      status: activeStatus !== 'all' ? activeStatus : '',
      search: searchTerm.trim()
    })
      .then((res) => {
        if (res.data) setOrders(res.data);
      })
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [activeStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await updateAdminOrderStatus(orderId, newStatus, statusNote);
      if (res.data) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? res.data : ord))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data);
        }
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
      setStatusNote('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', icon: CheckCircle };
      case 'Shipped':
      case 'Out for Delivery':
        return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', icon: Truck };
      case 'Packed':
      case 'Confirmed':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', icon: Package };
      case 'Cancelled':
        return { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', icon: XCircle };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', icon: Clock };
    }
  };

  return (
    <AdminLayout pageTitle="Customer Order Management">
      {/* Search and Status Filters */}
      <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setActiveStatus('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                background: activeStatus === 'all' ? '#9B2242' : '#F1F5F9',
                color: activeStatus === 'all' ? '#FFF' : '#475569',
                cursor: 'pointer'
              }}
            >
              All Orders
            </button>
            {ORDER_STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setActiveStatus(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  background: activeStatus === st ? '#9B2242' : '#F1F5F9',
                  color: activeStatus === st ? '#FFF' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search order #, customer, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={36} color="#9B2242" />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ color: '#0F172A', margin: '0 0 6px' }}>No orders found</h3>
            <p style={{ margin: 0 }}>Try changing your status filter or search query.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Order #</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Items</th>
                  <th style={{ padding: '12px 16px' }}>Total</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Update Workflow</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const Icon = badge.icon;
                  const isUpdating = updatingId === ord._id;

                  return (
                    <tr key={ord._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                          {ord.orderNumber}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A', display: 'block' }}>
                          {ord.customer?.name || ord.user?.name || 'Customer'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {ord.customer?.phone || ord.customer?.email}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {ord.items?.length || 0} dress{ord.items?.length === 1 ? '' : 'es'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                          {ord.items?.[0]?.name?.slice(0, 24)}...
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                          ₹{ord.totalAmount.toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: ord.paymentStatus === 'Paid' ? '#16A34A' : '#D97706'
                          }}
                        >
                          {ord.paymentMethod} • {ord.paymentStatus}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          <Icon size={13} />
                          <span>{ord.status}</span>
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <select
                          disabled={isUpdating}
                          value={ord.status}
                          onChange={(e) => handleStatusUpdate(ord._id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.82rem',
                            background: '#FFF',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#F1F5F9',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: '#0F172A',
                            fontWeight: 600
                          }}
                        >
                          <Eye size={14} />
                          <span>Details</span>
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

      {/* Order Details Modal */}
      {selectedOrder && (
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
              maxWidth: '700px',
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
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Customer Info Card */}
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Customer
                  </span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0F172A' }}>
                    {selectedOrder.customer?.name}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#475569' }}>
                    {selectedOrder.customer?.email}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#475569' }}>
                    {selectedOrder.customer?.phone}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Shipping Address
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#334155' }}>
                    {selectedOrder.customer?.shippingAddress?.street}
                    <br />
                    {selectedOrder.customer?.shippingAddress?.city},{' '}
                    {selectedOrder.customer?.shippingAddress?.state} -{' '}
                    {selectedOrder.customer?.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0F172A' }}>Ordered Dresses</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c'}
                      alt={item.name}
                      style={{ width: '48px', height: '56px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: '#0F172A', display: 'block', fontSize: '0.9rem' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#F1F5F9',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}
              >
                <span style={{ fontWeight: 700, color: '#0F172A' }}>Grand Total</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9B2242' }}>
                  ₹{selectedOrder.totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Status Transition History / Timeline */}
              <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0F172A' }}>Order Journey Timeline</h4>
              <div style={{ borderLeft: '2px solid #CBD5E1', paddingLeft: '16px', marginLeft: '8px' }}>
                {selectedOrder.timeline?.map((t, i) => (
                  <div key={i} style={{ marginBottom: '14px', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '-22px',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#9B2242'
                      }}
                    />
                    <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                      {t.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '8px' }}>
                      {new Date(t.timestamp).toLocaleString('en-IN')}
                    </span>
                    {t.note && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>
                        {t.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
