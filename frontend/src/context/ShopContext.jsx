import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCategories, fetchBrands } from '../services/api';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, brandsRes] = await Promise.allSettled([
        fetchCategories(),
        fetchBrands()
      ]);

      if (catsRes.status === 'fulfilled' && catsRes.value?.data) {
        setCategories(catsRes.value.data);
      } else if (catsRes.status === 'rejected') {
        setError(catsRes.reason?.message || 'Failed to load categories');
      }

      if (brandsRes.status === 'fulfilled' && brandsRes.value?.data) {
        setBrands(brandsRes.value.data);
      } else if (brandsRes.status === 'rejected') {
        setError((prev) => prev || brandsRes.reason?.message || 'Failed to load brands');
      }
    } catch (err) {
      console.error('Error loading shop context data:', err);
      setError(err.message || 'Failed to load shop data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const getCategoryBySlug = useCallback(
    (slug) => {
      if (!slug) return null;
      return categories.find((c) => c.slug?.toLowerCase() === slug.toLowerCase()) || null;
    },
    [categories]
  );

  const getBrandBySlug = useCallback(
    (slug) => {
      if (!slug) return null;
      return brands.find((b) => b.slug?.toLowerCase() === slug.toLowerCase()) || null;
    },
    [brands]
  );

  const value = {
    categories,
    brands,
    loading,
    error,
    refreshShopData: loadInitialData,
    getCategoryBySlug,
    getBrandBySlug
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

export { ShopContext };
