import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Clock, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { fetchMyOrders } from '../services/api';
import OrderTimeline from '../components/order/OrderTimeline';

const STATUS_STEPS = ['Ordered', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const toViewOrder = (order) => {
  const currentStep = order.status === 'Cancelled' ? 0 : Math.max(0, STATUS_STEPS.indexOf(order.status));
  const timeline = STATUS_STEPS.map((step) => {
    const event = order.timeline?.find((item) => item.status === step);
    return { step, title: step, time: event ? new Date(event.timestamp).toLocaleDateString() : 'Pending' };
  });
  return {
    ...order,
    id: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleDateString(),
    currentStep,
    statusText: order.status,
    estimatedDelivery: order.status === 'Delivered' ? 'Delivered' : 'In progress',
    paymentStatus: order.paymentStatus,
    shippingAddress: { ...order.customer?.shippingAddress, name: order.customer?.name, phone: order.customer?.phone },
    timeline,
    items: order.items.map((item) => ({ ...item, id: item.product?._id || item.product, image: item.image, price: item.price }))
  };
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOrders()
      .then((response) => setOrders((response.data || []).map(toViewOrder)))
      .catch((err) => setError(err.message || 'Unable to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'in-transit') return order.currentStep < 5;
    if (activeTab === 'delivered') return order.currentStep === 5;
    return true;
  });

  if (loading) return <div className="orders-page-wrapper"><div className="orders-container"><p>Loading orders...</p></div></div>;
  if (error) return <div className="orders-page-wrapper"><div className="orders-container"><p>{error}</p></div></div>;

  return (
    <div className="orders-page-wrapper">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header-bar">
          <div>
            <span className="orders-breadcrumb">Home / My Account / Orders</span>
            <h1 className="orders-page-title">My Orders</h1>
            <p className="orders-page-subtitle">
              Track packages, manage returns, and view previous dress purchases
            </p>
          </div>
          <Link to="/shop" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filter-tabs">
          <button
            className={`orders-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders ({orders.length})
          </button>
          <button
            className={`orders-tab-btn ${activeTab === 'in-transit' ? 'active' : ''}`}
            onClick={() => setActiveTab('in-transit')}
          >
            In Transit ({orders.filter((order) => order.currentStep < 5 && order.status !== 'Cancelled').length})
          </button>
          <button
            className={`orders-tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivered')}
          >
            Delivered ({orders.filter((order) => order.status === 'Delivered').length})
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const isTimelineExpanded = expandedOrderId === order.id;

            return (
              <div key={order.id} className="order-main-card">
                {/* Order Meta Header (Amazon Style) */}
                <div className="order-meta-header">
                  <div className="order-meta-group">
                    <span className="meta-label">ORDER PLACED</span>
                    <span className="meta-value">{order.orderDate}</span>
                  </div>

                  <div className="order-meta-group">
                    <span className="meta-label">TOTAL AMOUNT</span>
                    <span className="meta-value">₹{order.totalAmount.toLocaleString()}</span>
                  </div>

                  <div className="order-meta-group">
                    <span className="meta-label">SHIP TO</span>
                    <span className="meta-value">{order.shippingAddress.name}</span>
                  </div>

                  <div className="order-meta-group order-id-group">
                    <span className="meta-label">ORDER # {order.id}</span>
                    <div className="order-header-links">
                      <Link to={`/orders/${order.id}`} className="order-details-link">
                        View Order Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Status Ribbon */}
                <div className="order-status-banner">
                  <div className="status-indicator-col">
                    {order.currentStep === 5 ? (
                      <CheckCircle2 size={20} color="#10B981" />
                    ) : (
                      <Truck size={20} color="#9B2242" />
                    )}
                    <div>
                      <h4 className="status-heading">
                        {order.currentStep === 5
                          ? `Delivered on ${order.deliveredDate}`
                          : `Estimated Delivery: ${order.estimatedDelivery}`}
                      </h4>
                      <span className="status-subtext">
                        Current Status: <strong>{order.statusText}</strong> • {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <button
                    className="toggle-timeline-btn"
                    onClick={() => setExpandedOrderId(isTimelineExpanded ? null : order.id)}
                  >
                    <Clock size={15} />
                    <span>{isTimelineExpanded ? 'Hide Live Tracking' : 'Track Package Timeline'}</span>
                  </button>
                </div>

                {/* Expanded Timeline Component */}
                {isTimelineExpanded && (
                  <div className="order-timeline-drawer">
                    <h5 className="timeline-section-title">Delivery Status Timeline</h5>
                    <OrderTimeline timeline={order.timeline} currentStep={order.currentStep} />
                  </div>
                )}

                {/* Items in this Order */}
                <div className="order-items-container">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <div className="order-item-thumb">
                        <Link to={`/product/${item.id}`}>
                          <img src={item.image} alt={item.name} />
                        </Link>
                      </div>

                      <div className="order-item-info">
                        <span className="order-item-brand">{item.brand}</span>
                        <h4 className="order-item-title">
                          <Link to={`/product/${item.id}`}>{item.name}</Link>
                        </h4>
                        <div className="order-item-specs">
                          <span>Size: <strong>{item.size}</strong></span>
                          <span>•</span>
                          <span>Color: <strong>{item.color}</strong></span>
                          <span>•</span>
                          <span>Qty: <strong>{item.quantity}</strong></span>
                        </div>
                        <div className="order-item-price">
                          ₹{item.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="order-item-cta-column">
                        <Link to={`/product/${item.id}`} className="btn-reorder">
                          Buy Again
                        </Link>
                        <Link to={`/orders/${order.id}`} className="btn-view-item">
                          Item Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer */}
                <div className="order-card-footer">
                  <span className="footer-safe-text">
                    <ShieldCheck size={14} color="#10B981" /> Eligible for return / exchange within 7 days
                  </span>
                  <Link to={`/orders/${order.id}`} className="view-full-order-btn">
                    <span>Full Order Summary</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
