import React, { lazy, Suspense, useState, useEffect } from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthRequiredModal } from './components/AuthRequiredModal';
import { AiChatWidget } from './components/AiChatWidget';
import { MobileBottomNav } from './components/MobileBottomNav';

const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));
const HomePage = lazyNamed(() => import('./pages/HomePage'), 'HomePage');
const ProductListingPage = lazyNamed(() => import('./pages/ProductListingPage'), 'ProductListingPage');
const ProductDetailPage = lazyNamed(() => import('./pages/ProductDetailPage'), 'ProductDetailPage');
const CheckoutPage = lazyNamed(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const OrderSuccessPage = lazyNamed(() => import('./pages/OrderSuccessPage'), 'OrderSuccessPage');
const OrderHistoryPage = lazyNamed(() => import('./pages/OrderHistoryPage'), 'OrderHistoryPage');
const WishlistPage = lazyNamed(() => import('./pages/WishlistPage'), 'WishlistPage');
const StoreLocatorPage = lazyNamed(() => import('./pages/StoreLocatorPage'), 'StoreLocatorPage');
const LookbookPage = lazyNamed(() => import('./pages/LookbookPage'), 'LookbookPage');
const CustomStudioPage = lazyNamed(() => import('./pages/CustomStudioPage'), 'CustomStudioPage');
const LoginPage = lazyNamed(() => import('./pages/LoginPage'), 'LoginPage');
const ProfilePage = lazyNamed(() => import('./pages/ProfilePage'), 'ProfilePage');
const StaffDashboardPage = lazyNamed(() => import('./pages/StaffDashboardPage'), 'StaffDashboardPage');
const AdminDashboardPage = lazyNamed(() => import('./pages/AdminDashboardPage'), 'AdminDashboardPage');
const CustomerCarePage = lazyNamed(() => import('./pages/CustomerCarePage'), 'CustomerCarePage');
const VisualSearchModal = lazyNamed(() => import('./components/VisualSearchModal'), 'VisualSearchModal');

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BEO UI ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isVi = this.props.lang === 'vi';
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '480px', backgroundColor: '#fff', border: '1px solid #eae7e0', padding: '32px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px', color: '#111' }}>
              {isVi ? 'Đã xảy ra sự cố hiển thị' : 'Something went wrong'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
              {isVi
                ? 'Giao diện gặp lỗi tạm thời. Vui lòng tải lại trang hoặc quay về trang chủ.'
                : 'The interface encountered a temporary error. Please reload the page or return to the home page.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '#/';
                }}
                className="btn-beo btn-beo-primary"
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
              >
                {isVi ? 'Về Trang Chủ' : 'Back to Home'}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-beo btn-beo-outline-black"
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
              >
                {isVi ? 'Tải lại trang' : 'Reload Page'}
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- ROUTER UTILITIES ---
const normalizeView = (rawView) => {
  if (!rawView) return 'home';
  const decoded = decodeURIComponent(rawView).trim().toLowerCase();
  const clean = decoded.replace(/[\s_]+/g, '-');

  if (['product-detail', 'product', 'detail', 'productdetail', 'product-details'].includes(clean)) {
    return 'product-detail';
  }
  if (['products', 'product-listing', 'category', 'shop', 'catalog'].includes(clean)) {
    return 'products';
  }
  if (['order-history', 'orders', 'my-orders'].includes(clean)) {
    return 'orders';
  }
  if (['order-success', 'success', 'thank-you'].includes(clean)) {
    return 'order-success';
  }
  if (['custom-studio', 'custom', 'customizer', 'studio', 'custom-lab'].includes(clean)) {
    return 'custom-studio';
  }
  if (['store-locator', 'stores', 'showroom', 'store'].includes(clean)) {
    return 'stores';
  }
  if (['profile', 'account', 'user', 'my-account'].includes(clean)) {
    return 'profile';
  }
  if (['wishlist', 'favorite', 'favorites'].includes(clean)) {
    return 'wishlist';
  }
  if (['lookbook', 'styling'].includes(clean)) {
    return 'lookbook';
  }
  if (['login', 'signin', 'register', 'signup'].includes(clean)) {
    return 'login';
  }
  if (['checkout', 'payment'].includes(clean)) {
    return 'checkout';
  }
  if (['staff', 'staff-pos', 'pos'].includes(clean)) {
    return 'staff';
  }
  if (['admin', 'dashboard'].includes(clean)) {
    return 'admin';
  }
  if (['help', 'customer-care', 'policy', 'policies'].includes(clean)) {
    return 'help';
  }
  if (['home', 'index', ''].includes(clean)) {
    return 'home';
  }
  return clean;
};

const parseLocation = () => {
  try {
    const hash = window.location.hash || '';
    if (!hash || hash === '#' || hash === '#/') {
      return { view: 'home', params: {} };
    }

    const cleanHash = hash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = cleanHash.split('?');
    const pathSegments = (pathPart || '').split('/').filter(Boolean);
    let view = normalizeView(pathSegments[0] || 'home');
    const params = {};

    // Support path parameter style: #/product/27 or #/products/27
    if (pathSegments.length > 1) {
      const secondSeg = decodeURIComponent(pathSegments[1]);
      if (!isNaN(secondSeg)) {
        view = 'product-detail';
        params.id = Number(secondSeg);
      } else {
        params.slug = secondSeg;
      }
    }

    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      for (const [key, value] of searchParams.entries()) {
        if (key === 'id' && !isNaN(value)) {
          params[key] = Number(value);
        } else {
          params[key] = value;
        }
      }
    }

    return { view, params };
  } catch {
    return { view: 'home', params: {} };
  }
};

const serializeToHash = (view, params = {}) => {
  const normView = normalizeView(view);
  if (normView === 'home' && (!params || Object.keys(params).length === 0)) {
    return '#/';
  }
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && typeof value !== 'object') {
      searchParams.append(key, String(value));
    }
  }
  const queryStr = searchParams.toString();
  return `#/${normView}${queryStr ? `?${queryStr}` : ''}`;
};

const AppContent = () => {
  const { isAdmin, isStaff } = useAuth();
  const { lang } = useLanguage();

  const [currentView, setCurrentView] = useState(() => parseLocation().view);
  const [viewParams, setViewParams] = useState(() => parseLocation().params);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState(null);

  // Sync state on hash change / browser Back & Forward buttons
  useEffect(() => {
    const handleHashOrPopState = () => {
      const loc = parseLocation();
      setCurrentView(loc.view);
      setViewParams(loc.params);
    };

    window.addEventListener('hashchange', handleHashOrPopState);
    window.addEventListener('popstate', handleHashOrPopState);

    // Initial hash synchronization if hash was empty or non-normalized
    const initialLoc = parseLocation();
    const targetHash = serializeToHash(initialLoc.view, initialLoc.params);
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
    localStorage.setItem('beo_current_view', initialLoc.view);
    localStorage.setItem('beo_view_params', JSON.stringify(initialLoc.params));

    return () => {
      window.removeEventListener('hashchange', handleHashOrPopState);
      window.removeEventListener('popstate', handleHashOrPopState);
    };
  }, []);

  const handleNavigate = (view, params = {}, navigationContext = {}) => {
    const normView = normalizeView(view);
    const authenticatedRole = navigationContext.authenticatedRole;
    const canAccessAdmin = isAdmin || authenticatedRole === 'ROLE_ADMIN';
    const canAccessStaff = isStaff || canAccessAdmin || authenticatedRole?.startsWith('ROLE_STAFF');

    // Route guard checks with custom modal dialog
    if (normView === 'admin' && !canAccessAdmin) {
      setAuthModalRole('ADMIN');
      return;
    }

    if (normView === 'staff' && !canAccessStaff) {
      setAuthModalRole('STAFF');
      return;
    }

    setCurrentView(normView);
    setViewParams(params);

    // Update URL hash and localStorage
    const newHash = serializeToHash(normView, params);
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
    localStorage.setItem('beo_current_view', normView);
    localStorage.setItem('beo_view_params', JSON.stringify(params));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isKnownView = [
    'home', 'products', 'product-detail', 'checkout', 'order-success',
    'orders', 'profile', 'wishlist', 'stores', 'lookbook',
    'custom-studio', 'login', 'staff', 'admin', 'help'
  ].includes(currentView);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Top Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentView}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
      />

      {/* Main Page Body with ErrorBoundary */}
      <main style={{ flex: 1 }}>
        <ErrorBoundary key={currentView + (viewParams.id || viewParams.slug || '')} lang={lang}>
          <Suspense fallback={<div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{lang === 'vi' ? 'BEO STORE · ĐANG TẢI…' : 'BEO STORE · LOADING…'}</div>}>
          {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}

          {currentView === 'products' && (
            <ProductListingPage key={serializeToHash('products', viewParams)} initialFilters={viewParams} onNavigate={handleNavigate} />
          )}

          {currentView === 'product-detail' && (
            <ProductDetailPage
              productId={viewParams.id}
              slug={viewParams.slug}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'checkout' && <CheckoutPage onNavigate={handleNavigate} />}

          {currentView === 'order-success' && (
            <OrderSuccessPage
              order={viewParams.order}
              orderNumber={viewParams.orderNumber}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'orders' && <OrderHistoryPage onNavigate={handleNavigate} />}

          {currentView === 'profile' && <ProfilePage onNavigate={handleNavigate} />}

          {currentView === 'wishlist' && <WishlistPage onNavigate={handleNavigate} />}

          {currentView === 'stores' && <StoreLocatorPage onNavigate={handleNavigate} />}

          {currentView === 'lookbook' && <LookbookPage onNavigate={handleNavigate} />}
          {currentView === 'custom-studio' && <CustomStudioPage onNavigate={handleNavigate} />}

          {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}

          {currentView === 'staff' && <StaffDashboardPage onNavigate={handleNavigate} />}

          {currentView === 'admin' && <AdminDashboardPage onNavigate={handleNavigate} />}

          {currentView === 'help' && <CustomerCarePage section={viewParams.section} />}

          {!isKnownView && (
            <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Không tìm thấy trang yêu cầu' : 'Page not found'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                {lang === 'vi' ? 'Đường dẫn không tồn tại hoặc đã được thay đổi.' : 'The requested URL does not exist or has changed.'}
              </p>
              <button onClick={() => handleNavigate('home')} className="btn-beo btn-beo-primary">
                {lang === 'vi' ? 'Quay lại Trang Chủ' : 'Back to Home'}
              </button>
            </div>
          )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Visual Search Modal (AI Image Search) */}
      {isVisualSearchOpen && (
        <Suspense fallback={null}>
          <VisualSearchModal
            isOpen
            onClose={() => setIsVisualSearchOpen(false)}
            onSelectProduct={(prod) => {
              handleNavigate('product-detail', { id: prod.id, slug: prod.slug });
            }}
          />
        </Suspense>
      )}

      {/* Modern Role Access Permission Dialog */}
      <AuthRequiredModal
        isOpen={!!authModalRole}
        requiredRole={authModalRole}
        onClose={() => setAuthModalRole(null)}
        onGoToLogin={() => {
          setAuthModalRole(null);
          setCurrentView('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global AI Virtual Assistant & Social Chat Floating Widget */}
      <AiChatWidget onNavigate={handleNavigate} />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation Bar (Fixed Glassmorphic on Phone/Tablet) */}
      <MobileBottomNav
        onNavigate={handleNavigate}
        currentPage={currentView}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}
