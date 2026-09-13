import { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchCart, saveCart } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('swd_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const [serverCartReady, setServerCartReady] = useState(!user);

  useEffect(() => {
    try {
      localStorage.setItem('swd_cart', JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setServerCartReady(true);
      return undefined;
    }
    setServerCartReady(false);
    fetchCart()
      .then((response) => {
        if (!active) return;
        const serverItems = (response.data?.items || []).map((item) => {
          const product = item.product || {};
          const productId = product._id || product.id;
          return {
            cartItemId: `${productId}-${item.size}-${item.color}`,
            productId,
            id: productId,
            name: product.name,
            brand: product.brand,
            category: product.category,
            sellingPrice: product.sellingPrice || product.finalPrice || product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            image: product.image || product.images?.[0] || '',
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            stockStatus: product.stockStatus || product.availability
          };
        });
        setCartItems(serverItems.length ? serverItems : cartItems);
        setServerCartReady(true);
      })
      .catch(() => {
        if (active) setServerCartReady(true);
      });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!user || !serverCartReady) return;
    saveCart(cartItems.map((item) => ({
      product: item.productId,
      size: item.size,
      color: item.color,
      quantity: item.quantity
    }))).catch((error) => console.warn('Cart sync failed:', error.message));
  }, [cartItems, user, serverCartReady]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /**
   * Add a product to cart with chosen size & color
   */
  const addToCart = (product, size = 'M', color = null, quantity = 1) => {
    const prodId = product._id || product.id;
    const selectedColor = color || (product.colors && product.colors[0] ? product.colors[0].name : 'Standard');
    const selectedSize = size || (product.sizes && product.sizes[0] ? product.sizes[0] : 'Free Size');
    const itemKey = `${prodId}-${selectedSize}-${selectedColor}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.cartItemId === itemKey);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            cartItemId: itemKey,
            productId: prodId,
            id: prodId,
            name: product.name,
            brand: product.brand,
            category: product.category,
            sellingPrice: product.sellingPrice || product.finalPrice || product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            image: product.image || (product.images && product.images[0]) || '',
            size: selectedSize,
            color: selectedColor,
            quantity: quantity,
            stockStatus: product.stockStatus || product.availability
          }
        ];
      }
    });

    showToast(`Added "${product.name}" (${selectedSize}) to Bag!`);
  };

  /**
   * Update item quantity in cart
   */
  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
    showToast('Item removed from Bag');
  };

  /**
   * Clear all cart items
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Apply coupon code
   */
  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SARAVANA10') {
      setCouponCode('SARAVANA10');
      setDiscountPercent(10);
      showToast('Coupon applied! 10% extra discount added.');
      return { success: true, message: '10% Extra Discount Applied!' };
    } else if (clean === 'FESTIVE20') {
      setCouponCode('FESTIVE20');
      setDiscountPercent(20);
      showToast('Festive Coupon applied! 20% discount added.');
      return { success: true, message: '20% Festive Discount Applied!' };
    } else {
      return { success: false, message: 'Invalid coupon code. Try SARAVANA10' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    showToast('Coupon removed');
  };

  // Calculations
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const totalMRP = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.sellingPrice) * item.quantity, 0);
  const mrpSavings = totalMRP - subtotal;
  const couponDiscount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        subtotal,
        totalMRP,
        mrpSavings,
        couponDiscount,
        couponCode,
        discountPercent,
        shippingFee,
        grandTotal,
        toastMessage,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export { CartContext };
export { useCart } from '../hooks/useCart';

