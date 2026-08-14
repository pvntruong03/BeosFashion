import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('uq_token') || null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('uq_token');
      const storedUser = localStorage.getItem('uq_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh profile in background
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('uq_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Session expired or error fetching profile', err);
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
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
      const authData = res.data;

      localStorage.setItem('uq_token', authData.token);
      localStorage.setItem('uq_user', JSON.stringify(authData.user));

      setToken(authData.token);
      setUser(authData.user);

      showSuccess(`Đăng nhập thành công! Chào mừng ${authData.user.fullName}`);
      const redirectPath = getRedirectPathForRole(authData.user.role);
      return { success: true, redirectPath, user: authData.user };
    } catch (err) {
      showError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      return { success: false, error: err.message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const authData = res.data;

      localStorage.setItem('uq_token', authData.token);
      localStorage.setItem('uq_user', JSON.stringify(authData.user));

      setToken(authData.token);
      setUser(authData.user);

      showSuccess('Tạo tài khoản thành công!');
      return { success: true, redirectPath: '/', user: authData.user };
    } catch (err) {
      showError(err.message || 'Đăng ký thất bại.');
      return { success: false, error: err.message };
    }
  };

  const loginAsDemo = async (type) => {
    const credentials = {
      admin: { email: 'admin@uniqlo.com', pass: 'admin123' },
      staff_manager: { email: 'manager.dongkhoi@uniqlo.com', pass: 'staff123' },
      customer: { email: 'customer@gmail.com', pass: 'customer123' },
    };

    const cred = credentials[type];
    if (cred) {
      return await login(cred.email, cred.pass);
    }
  };

  const logout = (notify = true) => {
    localStorage.removeItem('uq_token');
    localStorage.removeItem('uq_user');
    setUser(null);
    setToken(null);
    if (notify) {
      showSuccess('Đã đăng xuất thành công.');
    }
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
        loginAsDemo,
        logout,
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
