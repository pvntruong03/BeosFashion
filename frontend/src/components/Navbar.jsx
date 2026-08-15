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
  ShoppingBasket,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { isCustomizerEnabled } from '../services/customizerFeatureService';
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
    { key: 'lifewear', label: t('lifewear'), collection: 'LifeWear' },
    { key: 'lookbook', label: 'LOOKBOOK', view: 'lookbook' },
    ...(isCustomizerEnabled() ? [{ key: 'custom-studio', label: '🎨 BEO CUSTOM LAB', view: 'custom-studio', highlight: true }] : []),
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5e5' }}>
      {/* Top utility bar (Desktop only to prevent mobile clutter) */}
      <div className="desktop-only" style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #f0f0f0', fontSize: '0.8rem', padding: '6px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#666' }}>
            <span>{lang === 'vi' ? 'Miễn phí giao hàng cho đơn từ 500.000đ' : 'Free standard shipping on orders over 500,000 VND'}</span>
            <span style={{ color: '#e60012', fontWeight: '700' }}>• {lang === 'vi' ? 'BỘ SƯU TẬP SS26 ĐÃ RA MẮT' : 'SS26 NEW COLLECTION LAUNCHED'}</span>
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
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', gap: '12px' }}>
        {/* Left: Brand Logo & Navigation links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: '6px', color: '#111' }}
            className="mobile-only"
            aria-label="Open Mobile Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* BEO Brand Logo (Clean & Iconic Single Logo) */}
          <div
            onClick={() => onNavigate('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
          >
            <div style={{
              backgroundColor: '#e60012',
              color: '#ffffff',
              padding: '6px 12px',
              fontFamily: 'monospace, sans-serif',
              fontWeight: '900',
              fontSize: '1.25rem',
              lineHeight: 1,
              letterSpacing: '-1px',
              textAlign: 'center',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(230,0,18,0.25)'
            }}>
              BEO<br />STORE
            </div>
          </div>

          {/* Navigation Category Links (Desktop Nav with Perfect Spacing) */}
          <nav className="desktop-nav">
            {navCategories.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.view) {
                    onNavigate(item.view);
                  } else {
                    onNavigate('products', { gender: item.gender, collection: item.collection });
                  }
                }}
                style={{
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                  color: item.highlight ? '#e60012' : '#111111',
                  padding: '8px 12px',
                  position: 'relative',
                  borderBottom: currentPage === item.key ? '2px solid #e60012' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Center: Search input (Desktop only) */}
        <div ref={searchRef} className="desktop-only" style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
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
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{lang === 'vi' ? 'Mã:' : 'SKU:'} {item.code} | {item.gender}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: item.salePrice ? '#e60012' : '#111' }}>
                    {formatPrice(item.salePrice || item.basePrice)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions (Wishlist, Cart, User) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mobile AI Visual Search camera button */}
          <button
            onClick={onOpenVisualSearch}
            className="mobile-only"
            style={{ padding: '6px', color: '#e60012' }}
            title="Tìm kiếm bằng hình ảnh (AI Visual Search)"
            aria-label="Visual Search"
          >
            <Camera size={22} />
          </button>

          {/* Wishlist Icon (Desktop only) */}
          <button
            onClick={() => onNavigate('wishlist')}
            className="desktop-only"
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

          {/* User Profile / Login Dropdown (Desktop only) */}
          <div className="desktop-only" style={{ position: 'relative' }}>
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
                      <div>{lang === 'vi' ? 'Vai trò:' : 'Role:'}</div>
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

      {/* ================= MOBILE LOOKBOOK DRAWER ================= */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 2500,
          display: 'flex'
        }}>
          <div
            className="animate-drawer"
            style={{
              width: '85%',
              maxWidth: '340px',
              backgroundColor: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 25px rgba(0,0,0,0.2)',
              overflowY: 'auto'
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#111111',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', letterSpacing: '0.5px' }}>BEO MODERN FASHION</div>
                <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '2px' }}>Flagship Showroom Cần Thơ</div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#ffffff', padding: '6px' }}
                aria-label="Close Menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Language & Store Banner */}
            <div style={{
              padding: '10px 20px',
              backgroundColor: '#f8f8f9',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555' }}>
                <MapPin size={14} color="#e60012" />
                <span>Cần Thơ (08:00 - 22:00)</span>
              </div>
              <button
                onClick={toggleLanguage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '700',
                  color: '#111',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  padding: '2px 8px',
                  borderRadius: '2px'
                }}
              >
                <Globe size={13} color="#e60012" />
                <span>{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
              </button>
            </div>

            {/* Navigation Category List */}
            <div style={{ padding: '16px 0', flex: 1 }}>
              <div style={{ padding: '0 20px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'vi' ? 'DANH MỤC THỜI TRANG' : 'FASHION CATEGORIES'}
              </div>

              {[
                { label: lang === 'vi' ? 'Thời Trang Nữ (Women)' : 'Women Collection', gender: 'WOMEN' },
                { label: lang === 'vi' ? 'Thời Trang Nam (Men)' : 'Men Collection', gender: 'MEN' },
                { label: 'LifeWear Essentials', collection: 'LifeWear' },
                { label: 'Lookbook SS26 Fashion', view: 'lookbook' },
                ...(isCustomizerEnabled() ? [{ label: '🎨 BEO Custom Studio', view: 'custom-studio', highlight: true }] : [])
              ].map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (cat.view) onNavigate(cat.view);
                    else onNavigate('products', { gender: cat.gender, collection: cat.collection });
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 20px',
                    fontSize: '0.95rem',
                    fontWeight: cat.highlight ? '800' : '600',
                    color: cat.highlight ? '#e60012' : '#111111',
                    borderBottom: '1px solid #f4f4f4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: cat.highlight ? '#fff5f5' : 'transparent'
                  }}
                >
                  <span>{cat.label}</span>
                  <span style={{ color: '#aaa', fontSize: '0.8rem' }}>›</span>
                </button>
              ))}

              {/* Utility shortcuts in drawer */}
              <div style={{ marginTop: '16px', padding: '0 20px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'vi' ? 'TIỆN ÍCH & HỖ TRỢ' : 'UTILITIES & SUPPORT'}
              </div>

              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('stores'); }}
                style={{ width: '100%', textAlign: 'left', padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}
              >
                <MapPin size={16} color="#e60012" />
                <span>{t('store_locator')}</span>
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('orders'); }}
                style={{ width: '100%', textAlign: 'left', padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}
              >
                <ShoppingBasket size={16} color="#0284c7" />
                <span>{lang === 'vi' ? 'Tra Cứu Đơn Hàng' : 'Track Order'}</span>
              </button>
            </div>

            {/* Direct Hotline / Zalo Footer in Drawer */}
            <div style={{ padding: '16px 20px', backgroundColor: '#f8f8f9', borderTop: '1px solid #eee' }}>
              <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: '8px' }}>
                {lang === 'vi' ? 'Hotline hỗ trợ 24/7:' : 'Customer Support Hotline:'}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href="tel:1900019199999"
                  className="btn-uq btn-uq-primary"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
                >
                  📞 1900 0191 99
                </a>
                <a
                  href="https://zalo.me/0567740000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-uq btn-uq-outline-gray"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
                >
                  💬 Zalo Chat
                </a>
              </div>
            </div>
          </div>

          {/* Backdrop dismiss */}
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
