import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, CreditCard, ShieldCheck, Download, HelpCircle, PhoneCall } from 'lucide-react';
import { fetchMyOrderById } from '../services/api';
import OrderTimeline from '../components/order/OrderTimeline';
import { useShopSettings } from '../context/ShopSettingsContext';

const STATUS_STEPS = ['Ordered', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { settings } = useShopSettings();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOrderById(id)
      .then((response) => {
        const raw = response.data;
        const timeline = STATUS_STEPS.map((step) => {
          const event = raw.timeline?.find((item) => item.status === step);
          return { step, title: step, time: event ? new Date(event.timestamp).toLocaleDateString() : 'Pending' };
        });
        setOrder({
          ...raw,
          id: raw.orderNumber,
          orderDate: new Date(raw.createdAt).toLocaleDateString(),
          currentStep: Math.max(0, STATUS_STEPS.indexOf(raw.status)),
          timeline,
          shippingAddress: { ...raw.customer?.shippingAddress, name: raw.customer?.name, phone: raw.customer?.phone },
          items: raw.items.map((item) => ({ ...item, id: item.product?._id || item.product }))
        });
      })
      .catch((err) => setError(err.message || 'Unable to load this order'));
  }, [id]);

  if (error) return <div className="order-details-wrapper"><div className="orders-container"><p>{error}</p></div></div>;
  if (!order) return <div className="order-details-wrapper"><div className="orders-container"><p>Loading order...</p></div></div>;

  return (
    <div className="order-details-wrapper">
      <div className="orders-container">
        {/* Navigation back to all orders */}
        <div className="order-details-top-bar">
          <Link to="/orders" className="back-to-orders-link">
            <ChevronLeft size={18} />
            <span>Back to All Orders</span>
          </Link>
          <div className="order-id-display">
            <span>Order ID: <strong>{order.id}</strong></span>
          </div>
        </div>

        <div className="order-details-main-card">
          {/* Header Title */}
          <div className="details-header-banner">
            <div>
              <h1 className="details-heading">Order Details & Tracking</h1>
              <p className="details-meta-line">
                Placed on <strong>{order.orderDate}</strong> • Total: <strong>₹{order.totalAmount.toLocaleString()}</strong> ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
              </p>
            </div>
            <button className="invoice-download-btn" onClick={() => alert('Tax Invoice PDF downloaded.')}>
              <Download size={16} />
              <span>Download Invoice</span>
            </button>
          </div>

          {/* Timeline Status Pipeline */}
          <div className="details-timeline-section">
            <h3 className="section-sub-title">Package Delivery Progress</h3>
            <OrderTimeline timeline={order.timeline} currentStep={order.currentStep} />
          </div>

          {/* Delivery & Payment Information Cards */}
          <div className="details-info-columns">
            {/* Delivery Address */}
            <div className="info-block-card">
              <div className="info-block-header">
                <MapPin size={18} color="#9B2242" />
                <h4>Delivery Address</h4>
              </div>
              <div className="info-block-body">
                <strong>{order.shippingAddress.name}</strong>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p className="phone-line">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="info-block-card">
              <div className="info-block-header">
                <CreditCard size={18} color="#9B2242" />
                <h4>Payment Information</h4>
              </div>
              <div className="info-block-body">
                <strong>{order.paymentMethod}</strong>
                <p className="payment-status-pill">{order.paymentStatus}</p>
                <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                  Billing address same as shipping address.
                </p>
              </div>
            </div>

            {/* Order Price Summary */}
            <div className="info-block-card">
              <div className="info-block-header">
                <ShieldCheck size={18} color="#10B981" />
                <h4>Order Summary</h4>
              </div>
              <div className="order-cost-breakdown">
                <div className="cost-row">
                  <span>Item Subtotal</span>
                  <span>₹{(order.totalAmount + order.discountApplied - order.deliveryFee).toLocaleString()}</span>
                </div>
                {order.discountApplied > 0 && (
                  <div className="cost-row discount">
                    <span>Discount</span>
                    <span>- ₹{order.discountApplied.toLocaleString()}</span>
                  </div>
                )}
                <div className="cost-row">
                  <span>Delivery Charges</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                </div>
                <div className="cost-divider" />
                <div className="cost-row grand-total">
                  <span>Grand Total</span>
                  <span>₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="details-items-section">
            <h3 className="section-sub-title">Items in this Package</h3>
            <div className="details-items-list">
              {order.items.map((item) => (
                <div key={item.id} className="details-item-row">
                  <img src={item.image} alt={item.name} className="item-details-thumb" />
                  <div className="item-details-text">
                    <span className="item-details-brand">{item.brand}</span>
                    <h4 className="item-details-title">
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h4>
                    <p className="item-details-specs">
                      Size: <strong>{item.size}</strong> • Color: <strong>{item.color}</strong> • Quantity: <strong>{item.quantity}</strong>
                    </p>
                    <span className="item-details-price">₹{item.price.toLocaleString()}</span>
                  </div>

                  <div className="item-details-actions">
                    <Link to={`/product/${item.id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                      Buy Again
                    </Link>
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }} onClick={() => alert('Return request submitted.')}>
                      Return or Replace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Need Help Bar */}
          <div className="details-help-bar">
            <div className="help-text">
              <HelpCircle size={20} color="#9B2242" />
              <div>
                <strong>Need help with your order?</strong>
                <span>Our 24/7 fashion care specialists are ready to assist you.</span>
              </div>
            </div>
            <a href={settings.phone ? `tel:${settings.phone}` : '#'} className="help-call-btn">
              <PhoneCall size={16} />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
