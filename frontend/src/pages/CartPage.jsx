import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Minus,
  Plus,
  CheckCircle,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { createCustomerOrder, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import { useShopSettings } from '../context/ShopSettingsContext';

export default function CartPage() {
  const {
    cartItems,
    itemCount,
    subtotal,
    totalMRP,
    mrpSavings,
    couponDiscount,
    couponCode,
    shippingFee,
    grandTotal,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();

  const { toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { settings } = useShopSettings();
  const navigate = useNavigate();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [checkoutError, setCheckoutError] = useState('');

  const freeShippingThreshold = 999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const result = applyCoupon(inputCoupon);
    setCouponFeedback(result);
    if (result.success) {
      setInputCoupon('');
    }
  };

  const handleMoveToWishlist = (item) => {
    toggleWishlist({
      id: item.productId,
      name: item.name,
      brand: item.brand,
      category: item.category,
      sellingPrice: item.sellingPrice,
      originalPrice: item.originalPrice,
      discount: item.discount,
      image: item.image,
      stockStatus: item.stockStatus
    });
    removeFromCart(item.cartItemId);
  };

  const handleSimulateCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    setPlacingOrder(true);
    setCheckoutError('');
    const shippingAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (!shippingAddress) {
      setCheckoutError('Please add a delivery address in your profile before checkout.');
      setPlacingOrder(false);
      return;
    }
    try {
      const items = cartItems.map((item) => ({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity }));
      if (paymentMethod === 'COD') {
        await createCustomerOrder({ items, paymentMethod, shippingAddress });
      } else {
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Unable to load Razorpay checkout'));
            document.body.appendChild(script);
          });
        }
        const payment = await createRazorpayOrder(items, shippingAddress);
        await new Promise((resolve, reject) => {
          const checkout = new window.Razorpay({
            key: payment.data.keyId,
            amount: Math.round(payment.data.amount * 100),
            currency: payment.data.currency,
            name: settings.shopName,
            order_id: payment.data.razorpayOrderId,
            handler: async (response) => {
              try {
                await verifyRazorpayPayment({ ...response, items, shippingAddress });
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            modal: { ondismiss: () => reject(new Error('Payment was cancelled')) }
          });
          checkout.open();
        });
      }
    } catch (err) {
      setCheckoutError(err.message || 'Unable to place order. Your cart was kept.');
      setPlacingOrder(false);
      return;
    }
    setPlacingOrder(false);
    setOrderPlacedSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsCheckoutModalOpen(false);
      setOrderPlacedSuccess(false);
      navigate('/orders');
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrap">
            <ShoppingBag size={54} color="#9B2242" />
          </div>
          <h2 className="empty-cart-title">Your Shopping Bag is Empty</h2>
          <p className="empty-cart-desc">
            Explore our curated collections of pure silk sarees, festive kurtis, and modern dresses to fill your bag.
          </p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
            Start Shopping Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        <div className="cart-header-title-bar">
          <h1 className="cart-main-heading">My Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
          <span className="cart-assurance-badge">
            <ShieldCheck size={16} color="#10B981" /> 100% Safe & Secure Checkout
          </span>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="shipping-progress-banner">
          <div className="shipping-progress-header">
            <Truck size={18} color="#9B2242" />
            <span>
              {amountNeededForFreeShipping === 0
                ? '🎉 Congratulations! You have unlocked FREE Express Delivery!'
                : `Add ₹${amountNeededForFreeShipping} more to enjoy FREE Delivery`}
            </span>
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-fill"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        <div className="cart-layout-grid">
          {/* Left: Cart Items List */}
          <div className="cart-items-column">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="cart-item-card">
                {/* Thumbnail */}
                <div className="cart-item-image">
                  <Link to={`/product/${item.productId}`}>
                    <img src={item.image} alt={item.name} />
                  </Link>
                </div>

                {/* Details */}
                <div className="cart-item-details">
                  <div className="item-brand-row">
                    <span className="cart-item-brand">{item.brand}</span>
                    <span className="cart-item-category">{item.category}</span>
                  </div>

                  <h3 className="cart-item-name">
                    <Link to={`/product/${item.productId}`}>{item.name}</Link>
                  </h3>

                  {/* Size & Color info */}
                  <div className="item-variants-pills">
                    <span className="variant-pill">Size: <strong>{item.size}</strong></span>
                    <span className="variant-pill">Color: <strong>{item.color}</strong></span>
                  </div>

                  {/* Pricing */}
                  <div className="item-pricing-line">
                    <span className="item-selling-price">₹{item.sellingPrice.toLocaleString()}</span>
                    {item.originalPrice > item.sellingPrice && (
                      <span className="item-original-price">₹{item.originalPrice.toLocaleString()}</span>
                    )}
                    {item.discount > 0 && (
                      <span className="item-discount-pill">{item.discount}% OFF</span>
                    )}
                  </div>

                  {/* Quantity and Actions Bar */}
                  <div className="item-actions-footer">
                    <div className="cart-quantity-controls">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-qty-count">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="cart-secondary-actions">
                      <button
                        type="button"
                        className="btn-text-action wishlist"
                        onClick={() => handleMoveToWishlist(item)}
                      >
                        <Heart size={14} />
                        <span>Move to Wishlist</span>
                      </button>
                      <button
                        type="button"
                        className="btn-text-action remove"
                        onClick={() => removeFromCart(item.cartItemId)}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="cart-summary-column">
            {/* Promo / Coupon Box */}
            <div className="summary-card coupon-card">
              <h4 className="summary-card-title">
                <Tag size={16} color="#9B2242" /> Apply Coupons & Offers
              </h4>
              {couponCode ? (
                <div className="applied-coupon-row">
                  <div className="coupon-code-badge">
                    <span>{couponCode} Applied</span>
                    <small>Extra discount added</small>
                  </div>
                  <button className="remove-coupon-btn" onClick={removeCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <form className="coupon-input-form" onSubmit={handleApplyCoupon}>
                  <input
                    id="coupon-code"
                    name="couponCode"
                    type="text"
                    placeholder="Enter coupon code (e.g. SARAVANA10)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                  />
                  <button type="submit" className="coupon-apply-btn">
                    Apply
                  </button>
                </form>
              )}

              {couponFeedback && (
                <div className={`coupon-feedback-msg ${couponFeedback.success ? 'success' : 'error'}`}>
                  {couponFeedback.message}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="summary-card price-breakdown-card">
              <h4 className="summary-card-title">Order Summary</h4>

              <div className="price-summary-table">
                <div className="summary-line">
                  <span className="line-label">Bag MRP ({itemCount} items)</span>
                  <span className="line-value">₹{totalMRP.toLocaleString()}</span>
                </div>

                {mrpSavings > 0 && (
                  <div className="summary-line discount-line">
                    <span className="line-label">Retail Discount</span>
                    <span className="line-value">- ₹{mrpSavings.toLocaleString()}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="summary-line discount-line">
                    <span className="line-label">Coupon Discount ({couponCode})</span>
                    <span className="line-value">- ₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="summary-line">
                  <span className="line-label">Delivery Charges</span>
                  <span className="line-value">
                    {shippingFee === 0 ? (
                      <strong style={{ color: '#10B981' }}>FREE</strong>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-line total-line">
                  <span className="line-label">Total Amount</span>
                  <span className="line-value grand-total-value">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {mrpSavings + couponDiscount > 0 && (
                <div className="total-savings-highlight">
                  🎉 You are saving ₹{(mrpSavings + couponDiscount).toLocaleString()} on this order!
                </div>
              )}

              <button
                className="btn-checkout-primary"
                onClick={handleSimulateCheckout}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div className="summary-security-note">
                <ShieldCheck size={16} />
                <span>Safe and Secure Payments. 100% Authentic products guaranteed.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Prototype Modal */}
      {isCheckoutModalOpen && (
        <div className="modal-backdrop" onClick={() => !orderPlacedSuccess && setIsCheckoutModalOpen(false)}>
          <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => !orderPlacedSuccess && setIsCheckoutModalOpen(false)}
            >
              <X size={20} />
            </button>

            {orderPlacedSuccess ? (
              <div className="checkout-success-view">
                <CheckCircle size={60} color="#10B981" />
                <h2>Order Placed Successfully!</h2>
                <p>
                  Thank you for shopping with Saravana Women Dresses. We are redirecting you to your order status timeline...
                </p>
              </div>
            ) : (
              <div className="checkout-confirm-view">
                <h3>Confirm Your Order</h3>
                <p className="checkout-modal-sub">
                  Review your order details before placing the order.
                </p>

                <div className="modal-address-summary">
                  <h5>Delivering to:</h5>
                  <p><strong>{user?.name}</strong> • {user?.phone || 'Phone not provided'}</p>
                  <p>{user?.addresses?.find((a) => a.isDefault)?.street || user?.addresses?.[0]?.street || 'Add an address in your profile'}</p>
                </div>

                <div className="modal-order-total-row">
                  <span>Grand Total to Pay:</span>
                  <span className="modal-total-amt">₹{grandTotal.toLocaleString()}</span>
                </div>

                <div className="payment-options-preview">
                  <label className="payment-radio-option active">
                    <input id="payment-cod" name="paymentMethod" type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                    <span>Cash on Delivery (COD) / Pay on Delivery</span>
                  </label>
                  <label className="payment-radio-option">
                    <input id="payment-razorpay" name="paymentMethod" type="radio" checked={paymentMethod === 'Razorpay'} onChange={() => setPaymentMethod('Razorpay')} />
                    <span>UPI / Cards / Net Banking (Razorpay Test Mode)</span>
                  </label>
                </div>

                {checkoutError && <p className="checkout-error-message">{checkoutError}</p>}

                <div className="checkout-modal-buttons">
                  <button
                    className="btn-secondary"
                    onClick={() => setIsCheckoutModalOpen(false)}
                  >
                    Back to Bag
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleConfirmOrder}
                    disabled={placingOrder}
                  >
                    {placingOrder ? 'Processing...' : 'Confirm & Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
