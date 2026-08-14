import React, { useState, useEffect } from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { VisualSearchModal } from './components/VisualSearchModal';
import { AuthRequiredModal } from './components/AuthRequiredModal';
import { AiChatWidget } from './components/AiChatWidget';

import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { WishlistPage } from './pages/WishlistPage';
import { StoreLocatorPage } from './pages/StoreLocatorPage';
import { LookbookPage } from './pages/LookbookPage';
import { CustomStudioPage } from './pages/CustomStudioPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// --- ROUTER UTILITIES ---
const parseLocation = () => {
  try {
    const hash = window.location.hash || '';
    if (!hash || hash === '#' || hash === '#/') {
      const savedView = localStorage.getItem('beo_current_view');
      const savedParams = localStorage.getItem('beo_view_params');
      if (savedView && savedView !== 'home') {
        return {
          view: savedView,
          params: savedParams ? JSON.parse(savedParams) : {}
        };
      }
      return { view: 'home', params: {} };
    }

    const cleanHash = hash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = cleanHash.split('?');
    const view = pathPart || 'home';
    const params = {};

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
  } catch (e) {
    return { view: 'home', params: {} };
  }
};

const serializeToHash = (view, params = {}) => {
  if (view === 'home' && (!params || Object.keys(params).length === 0)) {
    return '#/';
  }
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && typeof value !== 'object') {
      searchParams.append(key, String(value));
    }
  }
  const queryStr = searchParams.toString();
  return `#/${view}${queryStr ? `?${queryStr}` : ''}`;
};

const AppContent = () => {
  const { user, isAdmin, isStaff } = useAuth();

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

    // Initial hash synchronization if hash was empty but state existed
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

  const handleNavigate = (view, params = {}) => {
    // Route guard checks with custom modal dialog
    if (view === 'admin' && !isAdmin) {
      setAuthModalRole('ADMIN');
      return;
    }

    if (view === 'staff' && !isStaff && !isAdmin) {
      setAuthModalRole('STAFF');
      return;
    }

    setCurrentView(view);
    setViewParams(params);

    // Update URL hash and localStorage
    const newHash = serializeToHash(view, params);
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
    localStorage.setItem('beo_current_view', view);
    localStorage.setItem('beo_view_params', JSON.stringify(params));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Top Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentView}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
      />

      {/* Main Page Body */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}

        {currentView === 'products' && (
          <ProductListingPage initialFilters={viewParams} onNavigate={handleNavigate} />
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
          <OrderSuccessPage order={viewParams.order} onNavigate={handleNavigate} />
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
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Visual Search Modal (AI Image Search) */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
        onSelectProduct={(prod) => {
          handleNavigate('product-detail', { id: prod.id, slug: prod.slug });
        }}
      />

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
