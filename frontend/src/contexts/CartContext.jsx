import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const CartContext = createContext(null);
const isCartSyncError = (message = '') => /does not belong to current cart|cart item not found/i.test(message);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { showSuccess, showError, showInfo } = useToast();

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      if (res.data) {
        setCart(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (variantId, quantity = 1, openDrawer = true, customNotes = null) => {
    setLoading(true);
    try {
      const res = await api.post('/cart/items', { variantId, quantity, customNotes });
      setCart(res.data);
      showSuccess(lang === 'vi' ? 'Đã thêm sản phẩm vào giỏ hàng!' : 'Item added to your shopping bag!');
      if (openDrawer) {
        setIsCartOpen(true);
      }
      return true;
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Không thể thêm vào giỏ hàng.' : 'Unable to add this item to your shopping bag.'));
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
      if (isCartSyncError(err.message)) {
        await fetchCart();
        showInfo(lang === 'vi' ? 'Giỏ hàng vừa được đồng bộ lại.' : 'Your shopping bag has been refreshed.');
      } else {
        showError(err.message || (lang === 'vi' ? 'Không thể cập nhật số lượng.' : 'Unable to update the quantity.'));
      }
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data);
      showSuccess(lang === 'vi' ? 'Đã xóa sản phẩm khỏi giỏ hàng.' : 'Item removed from your shopping bag.');
    } catch (err) {
      if (isCartSyncError(err.message)) {
        await fetchCart();
        showInfo(lang === 'vi' ? 'Giỏ hàng vừa được đồng bộ lại.' : 'Your shopping bag has been refreshed.');
      } else {
        showError(err.message || (lang === 'vi' ? 'Không thể xóa sản phẩm.' : 'Unable to remove this item.'));
      }
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [], subTotal: 0, totalQuantity: 0, estimatedShipping: 0 });
    } catch {
      setCart({ items: [], subTotal: 0, totalQuantity: 0, estimatedShipping: 0 });
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
        clearCart,
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
