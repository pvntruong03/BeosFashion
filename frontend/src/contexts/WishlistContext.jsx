import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { showSuccess, showInfo, showError } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setWishlistIds(new Set());
      return;
    }
    try {
      const res = await api.get('/wishlist');
      if (res.data) {
        setWishlistItems(res.data);
        setWishlistIds(new Set(res.data.map((p) => p.id)));
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [user, fetchWishlist]);

  const toggleWishlist = async (product) => {
    if (!user) {
      showInfo(lang === 'vi' ? 'Vui lòng đăng nhập để lưu sản phẩm yêu thích.' : 'Please sign in to save items to your wishlist.');
      return false;
    }

    try {
      const res = await api.post(`/wishlist/toggle/${product.id}`);
      const inWishlist = res.data.inWishlist;

      if (inWishlist) {
        setWishlistItems((prev) => [product, ...prev]);
        setWishlistIds((prev) => new Set(prev).add(product.id));
        showSuccess(lang === 'vi' ? `Đã thêm "${product.name}" vào danh sách yêu thích.` : `Added "${product.name}" to your wishlist.`);
      } else {
        setWishlistItems((prev) => prev.filter((p) => p.id !== product.id));
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        showInfo(lang === 'vi' ? 'Đã xóa khỏi danh sách yêu thích.' : 'Removed from your wishlist.');
      }
      return inWishlist;
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Không thể cập nhật danh sách yêu thích.' : 'Unable to update your wishlist.'));
      return false;
    }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        totalWishlist: wishlistItems.length,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
