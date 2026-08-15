import React from 'react';
import { Home, Grid, Search, ShoppingBag, User as UserIcon, Shield, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

export const MobileBottomNav = ({ onNavigate, currentPage, onOpenVisualSearch, onOpenMobileMenu }) => {
  const { user, isAuthenticated, isAdmin, isStaff } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { lang, t } = useLanguage();

  return (
    <nav className="mobile-bottom-nav mobile-only" aria-label="Mobile Navigation">
      {/* 1. HOME */}
      <button
        onClick={() => onNavigate('home')}
        className={`mobile-nav-item ${currentPage === 'home' ? 'active' : ''}`}
        aria-label="Home"
      >
        <Home size={20} color={currentPage === 'home' ? '#e60012' : '#555'} />
        <span>{lang === 'vi' ? 'Trang chủ' : 'Home'}</span>
      </button>

      {/* 2. CATEGORIES / DRAWER */}
      <button
        onClick={() => {
          if (onOpenMobileMenu) {
            onOpenMobileMenu();
          } else {
            onNavigate('products');
          }
        }}
        className={`mobile-nav-item ${currentPage === 'products' || currentPage === 'lookbook' ? 'active' : ''}`}
        aria-label="Categories"
      >
        <Grid size={20} color={currentPage === 'products' ? '#e60012' : '#555'} />
        <span>{lang === 'vi' ? 'Danh mục' : 'Catalog'}</span>
      </button>

      {/* 3. AI SEARCH */}
      <button
        onClick={() => {
          if (onOpenVisualSearch) onOpenVisualSearch();
          else onNavigate('products');
        }}
        className="mobile-nav-item"
        aria-label="AI Search"
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: '#111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          marginTop: '-12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}>
          <Search size={18} color="#fff" />
        </div>
        <span style={{ marginTop: '2px', fontSize: '0.65rem' }}>{lang === 'vi' ? 'Tìm kiếm' : 'Search'}</span>
      </button>

      {/* 4. CART */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="mobile-nav-item"
        aria-label="Shopping Cart"
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <ShoppingBag size={20} color="#555" />
          {totalItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-8px',
              backgroundColor: '#e60012',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '800',
              borderRadius: '9999px',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              boxShadow: '0 2px 5px rgba(230,0,18,0.3)'
            }}>
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
        <span>{lang === 'vi' ? 'Giỏ hàng' : 'Cart'}</span>
      </button>

      {/* 5. ACCOUNT / ROLE PORTAL */}
      {isAdmin ? (
        <button
          onClick={() => onNavigate('admin')}
          className={`mobile-nav-item ${currentPage === 'admin' ? 'active' : ''}`}
          aria-label="Admin Portal"
        >
          <Shield size={20} color={currentPage === 'admin' ? '#e60012' : '#555'} />
          <span>Admin</span>
        </button>
      ) : isStaff ? (
        <button
          onClick={() => onNavigate('staff')}
          className={`mobile-nav-item ${currentPage === 'staff' ? 'active' : ''}`}
          aria-label="Staff POS"
        >
          <Store size={20} color={currentPage === 'staff' ? '#e60012' : '#555'} />
          <span>POS</span>
        </button>
      ) : (
        <button
          onClick={() => onNavigate(isAuthenticated ? 'profile' : 'login')}
          className={`mobile-nav-item ${currentPage === 'profile' || currentPage === 'login' ? 'active' : ''}`}
          aria-label="Account"
        >
          <UserIcon size={20} color={currentPage === 'profile' ? '#e60012' : '#555'} />
          <span>{isAuthenticated ? (lang === 'vi' ? 'Hồ sơ' : 'Profile') : (lang === 'vi' ? 'Đăng nhập' : 'Login')}</span>
        </button>
      )}
    </nav>
  );
};
