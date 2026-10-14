import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('beo_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('beo_token') || null);
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('beo_token');
      const storedUser = localStorage.getItem('beo_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh profile in background
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('beo_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Session expired or error fetching profile', err);
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  // Authentication bootstrap runs once; logout only clears the same local state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRedirectPathForRole = (role) => {
    if (!role) return '/';
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role.startsWith('ROLE_STAFF')) return '/staff/dashboard';
    return '/';
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const authData = res?.data || res;

      if (!authData || !authData.token) {
        throw new Error(res?.message || 'Failed to retrieve authentication data from server.');
      }

      localStorage.setItem('beo_token', authData.token);
      localStorage.setItem('beo_user', JSON.stringify(authData.user));

      setToken(authData.token);
      setUser(authData.user);

      showSuccess(lang === 'vi'
        ? `Đăng nhập thành công! Chào mừng ${authData.user?.fullName || 'bạn'} quay lại.`
        : `Login successful! Welcome back, ${authData.user?.fullName || 'customer'}.`);
      const redirectPath = getRedirectPathForRole(authData.user?.role);
      return { success: true, redirectPath, user: authData.user };
    } catch (err) {
      showError(err.message || (lang === 'vi'
        ? 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
        : 'Login failed. Please check your credentials and try again.'));
      return { success: false, error: err.message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const authData = res?.data || res;

      if (!authData || !authData.token) {
        throw new Error(res?.message || 'Failed to retrieve authentication data from server.');
      }

      localStorage.setItem('beo_token', authData.token);
      localStorage.setItem('beo_user', JSON.stringify(authData.user));

      setToken(authData.token);
      setUser(authData.user);

      showSuccess(lang === 'vi' ? 'Tạo tài khoản thành công!' : 'Account created successfully!');
      return { success: true, redirectPath: '/', user: authData.user };
    } catch (err) {
      showError(err.message || (lang === 'vi'
        ? 'Đăng ký thất bại. Vui lòng thử lại.'
        : 'Registration failed. Please try again.'));
      return { success: false, error: err.message };
    }
  };

  const logout = (notify = true) => {
    localStorage.removeItem('beo_token');
    localStorage.removeItem('beo_user');
    setUser(null);
    setToken(null);
    if (notify) {
      showSuccess(lang === 'vi' ? 'Đăng xuất thành công.' : 'Logged out successfully.');
    }
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('beo_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isStaff = user?.role && user.role.startsWith('ROLE_STAFF');
  const isCustomer = user?.role === 'ROLE_CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserData,
        isAdmin,
        isStaff,
        isCustomer,
        getRedirectPathForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
