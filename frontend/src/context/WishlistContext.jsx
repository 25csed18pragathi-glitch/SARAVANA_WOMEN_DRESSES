import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('swd_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('swd_wishlist', JSON.stringify(wishlistItems));
    } catch {
      // Ignore storage errors
    }
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    const targetId = typeof productId === 'object' && productId !== null ? productId._id || productId.id : productId;
    return wishlistItems.some((item) => (item._id || item.id) === targetId);
  };

  const toggleWishlist = (product) => {
    const prodId = product._id || product.id;
    setWishlistItems((prevItems) => {
      const exists = prevItems.some((item) => (item._id || item.id) === prodId);
      if (exists) {
        return prevItems.filter((item) => (item._id || item.id) !== prodId);
      } else {
        return [...prevItems, { ...product, id: prodId, _id: prodId }];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    const targetId = typeof productId === 'object' && productId !== null ? productId._id || productId.id : productId;
    setWishlistItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== targetId));
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export { WishlistContext };
export { useWishlist } from '../hooks/useWishlist';

