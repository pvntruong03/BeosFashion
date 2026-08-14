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

import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { WishlistPage } from './pages/WishlistPage';
import { StoreLocatorPage } from './pages/StoreLocatorPage';
import { LookbookPage } from './pages/LookbookPage';
import { LoginPage } from './pages/LoginPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const AppContent = () => {
  const { user, isAdmin, isStaff } = useAuth();

  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);

  const handleNavigate = (view, params = {}) => {
    // Route guard checks
    if (view === 'admin' && !isAdmin) {
      alert('Bạn cần đăng nhập bằng tài khoản Quản trị viên (ROLE_ADMIN) để truy cập trang này.');
      setCurrentView('login');
      return;
    }

    if (view === 'staff' && !isStaff && !isAdmin) {
      alert('Bạn cần đăng nhập bằng tài khoản Nhân viên (ROLE_STAFF_*) để truy cập trang này.');
      setCurrentView('login');
      return;
    }

    setCurrentView(view);
    setViewParams(params);
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

        {currentView === 'wishlist' && <WishlistPage onNavigate={handleNavigate} />}

        {currentView === 'stores' && <StoreLocatorPage onNavigate={handleNavigate} />}

        {currentView === 'lookbook' && <LookbookPage onNavigate={handleNavigate} />}

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

      {/* Global Footer (hidden on POS / Staff full screen view if desired, or visible across site) */}
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
