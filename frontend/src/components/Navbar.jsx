import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Camera,
  ShoppingBag,
  Heart,
  User as UserIcon,
  MapPin,
  Globe,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Store as StoreIcon,
  ShoppingBasket
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

export const Navbar = ({ onNavigate, currentPage, onOpenVisualSearch }) => {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist } = useWishlist();
  const { lang, toggleLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Live search debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.data) {
          setSearchResults(res.data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      onNavigate('products', { search: searchQuery.trim() });
    }
  };

  const navCategories = [
    { key: 'women', label: t('women'), gender: 'WOMEN' },
    { key: 'men', label: t('men'), gender: 'MEN' },
    { key: 'kids', label: t('kids'), gender: 'KIDS' },
    { key: 'lifewear', label: t('lifewear'), collection: 'LifeWear' },
    { key: 'lookbook', label: 'LOOKBOOK', view: 'lookbook' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5e5' }}>
      {/* Top utility bar */}
      <div style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', padding: '6px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#666' }}>
            <span>Miễn phí giao hàng cho đơn từ 500.000đ</span>
            <span style={{ color: '#e60012', fontWeight: '700' }}>• BỘ SƯU TẬP SS26 ĐÃ RA MẮT</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => onNavigate('stores')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#333', fontSize: '0.8rem' }}
            >
              <MapPin size={14} color="#e60012" />
              <span>{t('store_locator')}</span>
            </button>

            <button
              onClick={toggleLanguage}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#333', fontSize: '0.8rem' }}
            >
              <Globe size={14} />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', gap: '24px' }}>
        {/* Left: Brand Logo & Navigation links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', padding: '8px' }}
            className="mobile-only-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* BEO Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}
          >
            <div style={{
              backgroundColor: '#e60012',
              color: '#ffffff',
              padding: '6px 8px',
              fontFamily: 'monospace, sans-serif',
              fontWeight: '900',
              fontSize: '1.25rem',
              lineHeight: 1,
              letterSpacing: '-1px',
              textAlign: 'center',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              BEO<br />SHOP
            </div>
            <div style={{
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              padding: '2px 6px',
              border: '1px solid #e0e0e0'
            }}>
              <img
                src="/beo-logo.png"
                alt="BEO Modern Fashion Logo"
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Navigation Category Links */}
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="desktop-nav">
            {navCategories.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.view === 'lookbook') {
                    onNavigate('lookbook');
                  } else {
                    onNavigate('products', { gender: item.gender, collection: item.collection });
                  }
                }}
                style={{
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                  color: '#111111',
                  padding: '8px 0',
                  position: 'relative',
                  borderBottom: currentPage === item.key ? '2px solid #e60012' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Center: Search input */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '2px',
              padding: '0 12px',
              border: '1px solid transparent',
              transition: 'all 0.2s ease',
            }}>
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                style={{
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: '10px 0',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="button"
                onClick={onOpenVisualSearch}
                title="Tìm kiếm bằng hình ảnh (Visual AI Search)"
                style={{
                  color: '#e60012',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'transform 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Camera size={18} />
              </button>
              <button type="submit" style={{ color: '#555', padding: '4px', cursor: 'pointer' }}>
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Live Search Autocomplete Popup */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              marginTop: '4px',
              zIndex: 1001,
              maxHeight: '380px',
              overflowY: 'auto'
            }}>
              <div style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: '700', color: '#888', borderBottom: '1px solid #eee' }}>
                GỢI Ý TÌM KIẾM ({searchResults.length})
              </div>
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                    onNavigate('product-detail', { id: item.id, slug: item.slug });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f8f8f8',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <img
                    src={item.primaryImageUrl}
                    alt={item.name}
                    style={{ width: '40px', height: '48px', objectFit: 'cover', backgroundColor: '#f0f0f0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Mã: {item.code} | {item.gender}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: item.salePrice ? '#e60012' : '#111' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salePrice || item.basePrice)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions (Wishlist, Cart, User) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Wishlist Icon */}
          <button
            onClick={() => onNavigate('wishlist')}
            style={{ position: 'relative', padding: '6px', color: '#111' }}
            title={t('wishlist')}
          >
            <Heart size={22} />
            {totalWishlist > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#e60012',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '0.7rem',
                fontWeight: '700',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalWishlist}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{ position: 'relative', padding: '6px', color: '#111' }}
            title={t('cart')}
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#e60012',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '0.7rem',
                fontWeight: '700',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* User Profile / Login Dropdown */}
          <div style={{ position: 'relative' }}>
            {user ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '2px',
                    backgroundColor: '#fafafa',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  <UserIcon size={16} color="#e60012" />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.fullName || user.email}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '8px',
                    width: '220px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 1002,
                    padding: '8px 0'
                  }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', color: '#666' }}>
                      <div>Vai trò:</div>
                      <span className="badge-uq red" style={{ marginTop: '4px' }}>{user.role}</span>
                      {user.storeName && (
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#111', fontWeight: '600' }}>
                          🏪 {user.storeName}
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#111',
                        }}
                      >
                        <LayoutDashboard size={16} color="#e60012" />
                        {t('admin_panel')}
                      </button>
                    )}

                    {isStaff && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('staff');
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#111',
                        }}
                      >
                        <StoreIcon size={16} color="#e60012" />
                        {t('staff_panel')}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('profile');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                        color: '#333'
                      }}
                    >
                      <UserIcon size={16} />
                      {t('my_profile')}
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('orders');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                        color: '#333'
                      }}
                    >
                      <ShoppingBasket size={16} />
                      {t('orders')}
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        onNavigate('home');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                        color: '#d9383a',
                        borderTop: '1px solid #f0f0f0'
                      }}
                    >
                      <LogOut size={16} />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="btn-uq btn-uq-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <UserIcon size={16} />
                <span>{t('login_register')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
