import { createContext, useContext, useEffect, useState } from 'react';
import { fetchShopSettings } from '../services/api';

const FALLBACK_SETTINGS = {
  shopName: "Women's Fashion Store",
  logoUrl: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  mapLink: '',
  instagramLink: '',
  facebookLink: '',
  websiteLink: '',
  businessDescription: 'Quality women\'s fashion for every occasion.',
  customerSupport: 'Customer support details will appear here once configured.',
  returnRefundPolicy: 'Return and refund policy details will appear here once configured.'
};

const ShopSettingsContext = createContext(null);

export function ShopSettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchShopSettings()
      .then((response) => {
        if (active && response.data) setSettings({ ...FALLBACK_SETTINGS, ...response.data });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ShopSettingsContext.Provider value={{ settings, loading, setSettings }}>
      {children}
    </ShopSettingsContext.Provider>
  );
}

export function useShopSettings() {
  const context = useContext(ShopSettingsContext);
  if (!context) throw new Error('useShopSettings must be used within ShopSettingsProvider');
  return context;
}
