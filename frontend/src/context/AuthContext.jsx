import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('swd_auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('swd_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    let isMounted = true;
    if (token) {
      fetchCurrentUser()
        .then((res) => {
          if (isMounted && res.data) {
            setUser(res.data);
            localStorage.setItem('swd_auth_user', JSON.stringify(res.data));
          }
        })
        .catch((err) => {
          console.warn('Session expired or invalid:', err.message);
          if (isMounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('swd_auth_token');
            localStorage.removeItem('swd_auth_user');
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success && res.data) {
      const { token: newToken, ...userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('swd_auth_token', newToken);
      localStorage.setItem('swd_auth_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  }, []);

  const register = useCallback(async (registrationData) => {
    const res = await registerUser(registrationData);
    if (res.success && res.data) {
      const { token: newToken, ...userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('swd_auth_token', newToken);
      localStorage.setItem('swd_auth_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Registration failed');
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('swd_auth_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('swd_auth_token');
    localStorage.removeItem('swd_auth_user');
  }, []);

  const isAdmin = user && user.role === 'admin';
  const isCustomer = user && user.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAdmin,
        isCustomer,
        login,
        register,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
