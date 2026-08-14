import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      if (res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (variantId, quantity = 1, openDrawer = true) => {
    setLoading(true);
    try {
      const res = await api.post('/cart/items', { variantId, quantity });
      setCart(res.data);
      showSuccess('Đã thêm sản phẩm vào giỏ hàng!');
      if (openDrawer) {
        setIsCartOpen(true);
      }
      return true;
    } catch (err) {
      showError(err.message || 'Không thể thêm vào giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}?quantity=${quantity}`);
      setCart(res.data);
    } catch (err) {
      showError(err.message || 'Lỗi cập nhật số lượng');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data);
      showSuccess('Đã xóa sản phẩm khỏi giỏ');
    } catch (err) {
      showError(err.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        fetchCart,
        totalItems,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
