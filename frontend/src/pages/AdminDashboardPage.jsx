import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Package,
  Users,
  Tag,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  X,
  Printer,
  QrCode,
  Building,
  Save,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { RevenueAnalyticsPanel } from '../components/admin/RevenueAnalyticsPanel';
import { exportOrdersToExcel, exportProductsToExcel } from '../utils/excelExporter';
import { buildVariantMatrix } from '../services/productVariants';
import api from '../services/api';

export const AdminDashboardPage = ({ onNavigate }) => {
  const { formatPrice, lang } = useLanguage();
  const { showSuccess, showError, showInfo } = useToast();
  const [reseedLoading, setReseedLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const hash = window.location.hash || '';
      if (hash.includes('tab=')) {
        const queryPart = hash.split('?')[1];
        const params = new URLSearchParams(queryPart);
        const tab = params.get('tab');
        if (tab) return tab;
      }
      return localStorage.getItem('beo_admin_active_tab') || 'overview';
    } catch {
      return 'overview';
    }
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('beo_admin_active_tab', tabId);
    const newHash = `#/admin?tab=${tabId}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  };
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [, setLoading] = useState(true);

  // Product Create/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCode, setProdFormCode] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState(399000);
  const [prodFormSalePrice, setProdFormSalePrice] = useState('');
  const [prodFormCategoryId, setProdFormCategoryId] = useState(1);
  const [prodFormGender, setProdFormGender] = useState('MEN');
  const [prodFormCollection, setProdFormCollection] = useState('BEO AirFlow');
  const [prodFormMaterial, setProdFormMaterial] = useState('100% Supima Cotton');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormImage, setProdFormImage] = useState('');
  const [prodFormFeatured, setProdFormFeatured] = useState(true);
  const [prodFormNew, setProdFormNew] = useState(true);
  const [selectedColorsForMatrix, setSelectedColorsForMatrix] = useState(['09 BLACK', '00 WHITE']);
  const [selectedSizesForMatrix, setSelectedSizesForMatrix] = useState(['S', 'M', 'L', 'XL']);

  // Coupon Modal & State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteCouponId, setDeleteCouponId] = useState(null);
  const [coupCode, setCoupCode] = useState('');
  const [coupDesc, setCoupDesc] = useState('');
  const [coupType, setCoupType] = useState('PERCENT');
  const [coupVal, setCoupVal] = useState(10);
  const [coupMin, setCoupMin] = useState(300000);
  const [coupMax, setCoupMax] = useState(100000);
  const [coupLimit, setCoupLimit] = useState(500);

  // Orders Management Filters & Pagination
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(20);

  // Products Management Filters & Pagination
  const [adminProdSearch, setAdminProdSearch] = useState('');
  const [adminProductsPage, setAdminProductsPage] = useState(1);
  const [adminProductsPerPage, setAdminProductsPerPage] = useState(20);

  const [receiptOrder, setReceiptOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // VietQR Bank Config State
  const [bankConfig, setBankConfig] = useState({
    bankId: 'mbbank',
    bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
    accountNo: '190019199999',
    accountName: 'CONG TY TNHH BEO STORE VIETNAM',
    template: 'compact2'
  });
  const [savingBankConfig, setSavingBankConfig] = useState(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [resStats, resProds, resOrds, resUsers, resCoups, resCats, resBank] = await Promise.all([
        api.get('/admin/stats').catch(() => api.get('/admin/dashboard/stats')),
        api.get('/products?sizePerPage=100'),
        api.get('/admin/orders?page=0&size=500'),
        api.get('/admin/users'),
        api.get('/admin/coupons'),
        api.get('/categories'),
        api.get('/admin/bank-config').catch(() => api.get('/payments/vietqr/config')).catch(() => ({ data: null })),
      ]);

      if (resStats?.data) setStats(resStats.data);
      if (resProds?.data) {
        const pArr = Array.isArray(resProds.data) ? resProds.data : (resProds.data.content || []);
        setProducts(pArr);
      }
      if (resOrds?.data) {
        const oArr = Array.isArray(resOrds.data) ? resOrds.data : (resOrds.data.content || []);
        setOrders(oArr);
      }
      if (resUsers?.data) {
        const uArr = Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data.content || []);
        setUsersList(uArr);
      }
      if (resCoups?.data) {
        const cArr = Array.isArray(resCoups.data) ? resCoups.data : (resCoups.data.content || []);
        setCoupons(cArr);
      }
      if (resCats?.data) {
        const catArr = Array.isArray(resCats.data) ? resCats.data : (resCats.data.content || []);
        setCategories(catArr);
      }
      if (resBank?.data) setBankConfig(resBank.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Product CRUD
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdFormName('');
    setProdFormCode('BEO-' + Math.floor(100000 + Math.random() * 900000));
    setProdFormPrice(399000);
    setProdFormSalePrice('');
    setProdFormCategoryId(categories[0]?.id || 1);
    setProdFormGender('MEN');
    setProdFormCollection('BEO AirFlow');
    setProdFormMaterial('100% Supima Cotton');
    setProdFormDesc('Precision BEO Essentials tailoring for everyday comfort and durability.');
    setProdFormImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
    setProdFormFeatured(true);
    setProdFormNew(true);
    setSelectedColorsForMatrix(['09 BLACK', '00 WHITE']);
    setSelectedSizesForMatrix(['S', 'M', 'L', 'XL']);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdFormName(prod.name || '');
    setProdFormCode(prod.code || '');
    setProdFormPrice(prod.basePrice || 399000);
    setProdFormSalePrice(prod.salePrice !== null && prod.salePrice !== undefined ? prod.salePrice : '');
    setProdFormCategoryId(prod.categoryId || (categories[0]?.id || 1));
    setProdFormGender(prod.gender || 'MEN');
    setProdFormCollection(prod.collection || 'BEO AirFlow');
    setProdFormMaterial(prod.material || '100% Supima Cotton');
    setProdFormDesc(prod.description || '');
    setProdFormImage(prod.primaryImageUrl || '');
    setProdFormFeatured(prod.featured || false);
    setProdFormNew(prod.new || false);
    const currentVariants = Array.isArray(prod.variants) ? prod.variants : [];
    setSelectedColorsForMatrix([...new Set(currentVariants.map((variant) => variant.colorName).filter(Boolean))]);
    setSelectedSizesForMatrix([...new Set(currentVariants.map((variant) => variant.size).filter(Boolean))]);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const variants = buildVariantMatrix({
        colors: selectedColorsForMatrix,
        sizes: selectedSizesForMatrix,
        productCode: prodFormCode,
        imageUrl: prodFormImage,
        existingVariants: editingProduct?.variants || [],
      });

      const payload = {
        name: prodFormName,
        code: prodFormCode,
        categoryId: Number(prodFormCategoryId),
        gender: prodFormGender,
        collection: prodFormCollection,
        basePrice: Number(prodFormPrice),
        salePrice: prodFormSalePrice ? Number(prodFormSalePrice) : null,
        material: prodFormMaterial,
        description: prodFormDesc,
        primaryImageUrl: prodFormImage,
        featured: prodFormFeatured,
        isNew: prodFormNew,
        variants
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        showSuccess(lang === 'vi' ? 'Cập nhật sản phẩm thành công!' : 'Product updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        showSuccess(lang === 'vi' ? 'Tạo mới sản phẩm với ma trận biến thể thành công!' : 'Created new product with full variant matrix!');
      }

      setIsProductModalOpen(false);
      fetchAdminData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi lưu sản phẩm' : 'Failed to save product'));
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/admin/products/${deleteConfirmId}`);
      showSuccess(lang === 'vi' ? 'Đã cập nhật trạng thái sản phẩm thành công' : 'Product deactivated successfully');
      setDeleteConfirmId(null);
      fetchAdminData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi xóa/ngừng bán sản phẩm' : 'Failed to deactivate product'));
      setDeleteConfirmId(null);
    }
  };

  // Coupons CRUD
  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    setCoupCode('');
    setCoupDesc('');
    setCoupType('PERCENT');
    setCoupVal(10);
    setCoupMin(300000);
    setCoupMax(100000);
    setCoupLimit(500);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coup) => {
    setEditingCoupon(coup);
    setCoupCode(coup.code || '');
    setCoupDesc(coup.description || '');
    setCoupType(coup.discountType || 'PERCENT');
    setCoupVal(coup.discountValue || 10);
    setCoupMin(coup.minOrderAmount || 0);
    setCoupMax(coup.maxDiscountAmount || 100000);
    setCoupLimit(coup.usageLimit || 1000);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: coupCode.trim().toUpperCase(),
        description: coupDesc.trim(),
        discountType: coupType,
        discountValue: Number(coupVal),
        minOrderAmount: Number(coupMin),
        maxDiscountAmount: coupType === 'PERCENT' ? (coupMax ? Number(coupMax) : null) : null,
        usageLimit: Number(coupLimit),
        active: true
      };

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, payload);
        showSuccess(lang === 'vi' ? 'Cập nhật mã giảm giá thành công!' : 'Coupon updated successfully!');
      } else {
        await api.post('/admin/coupons', payload);
        showSuccess(lang === 'vi' ? 'Tạo mới mã giảm giá thành công!' : 'Coupon created successfully!');
      }

      setIsCouponModalOpen(false);
      fetchAdminData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi lưu mã giảm giá' : 'Failed to save coupon'));
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      showSuccess(lang === 'vi' ? 'Đã xóa mã khuyến mãi thành công' : 'Coupon deleted successfully');
      setDeleteCouponId(null);
      fetchAdminData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi xóa mã khuyến mãi' : 'Failed to delete coupon'));
      setDeleteCouponId(null);
    }
  };

  // Orders Admin Status Update
  const handleUpdateAdminOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Admin status update to ${newStatus}`
      });
      showSuccess(lang === 'vi' ? `Đã chuyển đơn hàng sang trạng thái ${newStatus}` : `Order status updated to ${newStatus}`);
      fetchAdminData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi cập nhật trạng thái đơn hàng' : 'Failed to update order status'));
    }
  };

  // Users Role Update
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      showSuccess(lang === 'vi' ? 'Cập nhật phân quyền người dùng thành công!' : 'User role updated successfully!');
      fetchAdminData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi cập nhật quyền người dùng' : 'Failed to update user role'));
    }
  };

  // Bank Config Save
  const handleSaveBankConfig = async (e) => {
    e.preventDefault();
    setSavingBankConfig(true);
    try {
      await api.post('/admin/bank-config', bankConfig);
      showSuccess(lang === 'vi' ? 'Đã cập nhật cấu hình tài khoản nhận tiền VietQR!' : 'VietQR beneficiary configuration saved!');
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi lưu cấu hình ngân hàng' : 'Failed to save bank configuration'));
    } finally {
      setSavingBankConfig(false);
    }
  };

  // Reseed / Refresh Realistic Data Handler
  const handleReseedData = async () => {
    if (reseedLoading) return;
    setReseedLoading(true);
    showInfo(lang === 'vi' ? 'Đang tạo và làm mới dữ liệu thực tế toàn hệ thống...' : 'Generating and refreshing realistic system data...');
    try {
      await api.post('/admin/reseed-data');
      await fetchAdminData();
      showSuccess(lang === 'vi' ? 'Đã làm mới dữ liệu thực tế thành công! Doanh thu, biểu đồ và đơn hàng đã được cập nhật.' : 'Realistic system data refreshed successfully! Revenue, trend charts, and orders updated.');
    } catch (err) {
      console.error('Failed to reseed data:', err);
      showError(lang === 'vi' ? 'Lỗi khi làm mới dữ liệu' : 'Failed to refresh system data');
    } finally {
      setReseedLoading(false);
    }
  };

  // Filtered Orders & Pagination
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((ord) => {
    if (!ord) return false;
    const matchesStatus = orderStatusFilter === 'ALL' || ord.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(q)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.includes(q)) ||
      (ord.shippingAddress && ord.shippingAddress.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const totalOrdersCount = filteredOrders.length;
  const totalOrderPages = Math.max(1, Math.ceil(totalOrdersCount / ordersPerPage));
  const currentOrdersPage = Math.min(Math.max(1, ordersPage), totalOrderPages);
  const paginatedOrders = filteredOrders.slice(
    (currentOrdersPage - 1) * ordersPerPage,
    currentOrdersPage * ordersPerPage
  );

  // Admin Products Pagination
  const filteredAdminProducts = (Array.isArray(products) ? products : []).filter(
    (p) => !adminProdSearch || p.name.toLowerCase().includes(adminProdSearch.toLowerCase()) || p.code.toLowerCase().includes(adminProdSearch.toLowerCase())
  );
  const totalAdminProductsCount = filteredAdminProducts.length;
  const totalAdminProductPages = Math.max(1, Math.ceil(totalAdminProductsCount / adminProductsPerPage));
  const currentAdminProductsPage = Math.min(Math.max(1, adminProductsPage), totalAdminProductPages);
  const paginatedAdminProducts = filteredAdminProducts.slice(
    (currentAdminProductsPage - 1) * adminProductsPerPage,
    currentAdminProductsPage * adminProductsPerPage
  );

  return (
    <div style={{ backgroundColor: '#f4f5f7', minHeight: 'calc(100vh - 70px)', padding: '24px 0' }}>
      <div className="container">
        {/* Admin Header Banner */}
        <div style={{
          backgroundColor: '#111111',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#e60012', color: '#fff', padding: '6px 8px', fontWeight: '900', fontSize: '1.1rem', lineHeight: 1 }}>BEO<br/>STORE</div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                {lang === 'vi' ? 'HỆ THỐNG QUẢN TRỊ TOÀN DIỆN (ADMIN CMS)' : 'ENTERPRISE SYSTEM MANAGEMENT (ADMIN CMS)'}
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '2px' }}>
                {lang === 'vi'
                  ? 'Tổng quan doanh thu, danh mục hàng hóa, nhân sự và đơn hàng toàn quốc'
                  : 'Executive analytics, product matrices, role permissions, and omnichannel order fulfillment'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleReseedData}
              disabled={reseedLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                cursor: reseedLoading ? 'not-allowed' : 'pointer',
                opacity: reseedLoading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              title={lang === 'vi' ? 'Làm mới dữ liệu doanh thu, đơn hàng và biểu đồ 7 ngày' : 'Refresh revenue, orders, and 7-day chart data'}
            >
              <RefreshCw size={15} className={reseedLoading ? 'animate-spin' : ''} />
              <span>{reseedLoading ? (lang === 'vi' ? 'Đang tạo số liệu...' : 'Generating Data...') : (lang === 'vi' ? 'Làm Mới Số Liệu Thực Tế' : 'Refresh Live Data')}</span>
            </button>
            <button onClick={() => onNavigate('staff')} className="btn-beo btn-beo-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              {lang === 'vi' ? 'Mở Staff POS Portal' : 'Store POS Portal'}
            </button>
            <button onClick={() => onNavigate('home')} className="btn-beo portal-storefront-button" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              {lang === 'vi' ? 'Về Storefront' : 'Storefront'}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
          {[
            { id: 'overview', label: lang === 'vi' ? '1. Tổng Quan Doanh Thu & KPI' : '1. Overview & Revenue Analytics', icon: <TrendingUp size={16} /> },
            { id: 'reports', label: lang === 'vi' ? '2. Báo Cáo Excel/PDF' : '2. Excel/PDF Reports', icon: <Download size={16} /> },
            { id: 'products', label: lang === 'vi' ? `3. Quản Lý Sản Phẩm (${products.length})` : `3. Products (${products.length})`, icon: <ShoppingBag size={16} /> },
            { id: 'orders', label: lang === 'vi' ? `4. Toàn Bộ Đơn Hàng (${orders.length})` : `4. Omnichannel Orders (${orders.length})`, icon: <Package size={16} /> },
            { id: 'users', label: lang === 'vi' ? `5. Phân Quyền Nhân Sự & User (${usersList.length})` : `5. Access & Roles (${usersList.length})`, icon: <Users size={16} /> },
            { id: 'coupons', label: lang === 'vi' ? `6. Mã Khuyến Mãi (${coupons.length})` : `6. Coupons & Promo (${coupons.length})`, icon: <Tag size={16} /> },
            { id: 'bank-config', label: lang === 'vi' ? '7. Cấu Hình VietQR Nhận Tiền' : '7. VietQR Gateway Settings', icon: <QrCode size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                fontWeight: '700',
                fontSize: '0.88rem',
                backgroundColor: activeTab === tab.id ? '#ffffff' : '#e8eaed',
                color: activeTab === tab.id ? '#e60012' : '#333',
                borderTop: activeTab === tab.id ? '3px solid #e60012' : '3px solid transparent',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ================= TAB 1: OVERVIEW DASHBOARD ================= */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* KPI Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'TỔNG DOANH THU HỆ THỐNG' : 'TOTAL SYSTEM REVENUE'}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#e60012', marginTop: '6px' }}>
                  {formatPrice(stats?.totalRevenue || 0)}
                </div>
                <div style={{ fontSize: '0.75rem', color: (stats?.revenueChangePercent ?? 0) >= 0 ? '#00875a' : '#d32f2f', marginTop: '4px', fontWeight: '700' }}>
                  {stats?.revenueChangePercent == null
                    ? (lang === 'vi' ? 'Chưa có kỳ trước để so sánh' : 'No prior period for comparison')
                    : `${stats.revenueChangePercent >= 0 ? '↑' : '↓'} ${Math.abs(Number(stats.revenueChangePercent)).toFixed(1)}% ${lang === 'vi' ? 'so với 7 ngày trước' : 'vs previous 7 days'}`}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'ĐƠN HÀNG HỢP LỆ' : 'VALID ORDERS'}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111', marginTop: '6px' }}>
                  {stats?.totalOrders || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                  {lang === 'vi' ? 'Không gồm đơn đã hủy hoặc hoàn trả' : 'Excludes cancelled and returned orders'}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'TÀI KHOẢN ĐÃ ĐĂNG KÝ' : 'REGISTERED USERS'}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111', marginTop: '6px' }}>
                  {stats?.totalCustomers || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#00875a', marginTop: '4px', fontWeight: '700' }}>
                  {lang === 'vi'
                    ? `${stats?.activeCustomers ?? 0}/${stats?.totalCustomers ?? 0} tài khoản đang hoạt động`
                    : `${stats?.activeCustomers ?? 0}/${stats?.totalCustomers ?? 0} active accounts`}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'CẢNH BÁO TỒN KHO THẤP' : 'LOW STOCK ALERTS'}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffab00', marginTop: '6px' }}>
                  {stats?.lowStockItemsCount || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                  {lang === 'vi' ? 'Biến thể cần nhập bổ sung' : 'Variants requiring replenishment'}
                </div>
              </div>
            </div>

            {/* 7-Day Revenue Trend & Store Sales Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* 7-Day Trend */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', color: '#111' }}>
                      {lang === 'vi' ? 'Biểu Đồ Doanh Thu 7 Ngày Gần Nhất' : '7-Day Revenue & Sales Trend'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                      {lang === 'vi' ? 'Doanh thu đã ghi nhận và số đơn đã thanh toán theo ngày' : 'Recognized revenue and paid-order tracking by day'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#fff0f0', color: '#e60012', padding: '3px 8px', borderRadius: '3px', border: '1px solid #ffd0d0' }}>
                      {lang === 'vi' ? 'Tổng 7 ngày: ' : '7-Day Total: '}
                      {formatPrice(stats?.revenueLast7Days?.reduce((s, d) => s + (Number(d.revenue) || 0), 0) || 0)}
                    </span>
                  </div>
                </div>

                {/* Bars Visualization Container */}
                {(() => {
                  const max7DayRevenue = Math.max(...(stats?.revenueLast7Days?.map((d) => Number(d.revenue) || 0) || [1]), 1000000);
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      height: '210px',
                      padding: '24px 8px 10px',
                      borderBottom: '2px solid #e5e5e5',
                      backgroundColor: '#fafafa',
                      borderRadius: '4px',
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '1px', borderTop: '1px dashed #e0e0e0', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '1px', borderTop: '1px dashed #e0e0e0', pointerEvents: 'none' }} />

                      {stats?.revenueLast7Days?.map((d, idx) => {
                        const isToday = idx === (stats.revenueLast7Days.length - 1);
                        const rev = Number(d.revenue) || 0;
                        const barHeight = Math.max(Math.round((rev / max7DayRevenue) * 115), 10);
                        const formattedShortRev = rev >= 1000000 ? `${(rev / 1000000).toFixed(1)}M` : `${Math.round(rev / 1000)}k`;

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              flex: 1,
                              height: '100%',
                              zIndex: 1,
                              cursor: 'pointer'
                            }}
                            title={`📅 Date: ${d.date}\n💰 Revenue: ${formatPrice(rev)}\n📦 Orders: ${d.orderCount || 0}`}
                          >
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              color: isToday ? '#e60012' : '#444',
                              marginBottom: '6px',
                              whiteSpace: 'nowrap'
                            }}>
                              {formattedShortRev}
                            </span>

                            <div
                              style={{
                                width: '32px',
                                maxWidth: '80%',
                                height: `${barHeight}px`,
                                backgroundColor: isToday ? '#e60012' : '#1e293b',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isToday ? '0 4px 10px rgba(230,0,18,0.25)' : 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scaleY(1.05)';
                                e.currentTarget.style.backgroundColor = '#e60012';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scaleY(1)';
                                e.currentTarget.style.backgroundColor = isToday ? '#e60012' : '#1e293b';
                              }}
                            />

                            <div style={{ marginTop: '8px', textAlign: 'center' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: isToday ? '900' : '700',
                                color: isToday ? '#e60012' : '#111',
                                display: 'block'
                              }}>
                                {d.date}
                              </span>
                              <span style={{
                                fontSize: '0.65rem',
                                color: '#767676',
                                fontWeight: '600'
                              }}>
                                {d.orderCount || 0} {lang === 'vi' ? 'đơn' : 'orders'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Single Central Store Information & Operations */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                  {lang === 'vi' ? 'Cửa Hàng BEO Modern Fashion & Vận Hành' : 'Flagship Store Operations & Metrics'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#111' }}>{lang === 'vi' ? 'Showroom Trung Tâm BEO STORE' : 'BEO STORE Flagship Showroom'}</strong>
                      <span className="badge-beo red">{lang === 'vi' ? 'SHOWROOM TRUNG TÂM' : 'FLAGSHIP SHOWROOM'}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5, marginBottom: '8px' }}>
                      📍 {lang === 'vi' ? '209 Đường 30 Tháng 4, Xuân Khánh, Cần Thơ' : '209 30th April Street, Xuan Khanh, Can Tho City, Vietnam'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>📞 Hotline: <strong>1900019199999</strong></span>
                      <span>💬 Zalo: <strong>0567740000</strong></span>
                      <span>⏰ {lang === 'vi' ? 'Mở cửa:' : 'Hours:'} <strong>08:00 - 22:00</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '14px', backgroundColor: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#e60012', textTransform: 'uppercase' }}>
                        {lang === 'vi' ? 'DOANH THU ĐÃ GHI NHẬN' : 'RECOGNIZED REVENUE'}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#e60012', marginTop: '4px' }}>
                        {formatPrice(stats?.totalRevenue || 0)}
                      </div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>
                        {lang === 'vi' ? 'ĐƠN ĐÃ GHI NHẬN' : 'RECOGNIZED ORDERS'}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0284c7', marginTop: '4px' }}>
                        {stats?.paidOrdersCount ?? 0} {lang === 'vi' ? 'Đơn' : 'Orders'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: REVENUE REPORTS ================= */}
        {activeTab === 'reports' && (
          <RevenueAnalyticsPanel orders={orders} stats={stats} />
        )}

        {/* ================= TAB 3: PRODUCTS CRUD ================= */}
        {activeTab === 'products' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? `Danh Sách Sản Phẩm (${filteredAdminProducts.length} sản phẩm)` : `Catalog & Product Inventory (${filteredAdminProducts.length})`}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {lang === 'vi' ? 'Quản lý danh mục, giá bán và ma trận biến thể' : 'Manage styles, price points, and variant matrices'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <input
                    type="text"
                    placeholder={lang === 'vi' ? 'Tìm theo tên, mã SP...' : 'Search by name, SKU...'}
                    value={adminProdSearch}
                    onChange={(e) => {
                      setAdminProdSearch(e.target.value);
                      setAdminProductsPage(1);
                    }}
                    style={{ width: '100%', padding: '8px 12px 8px 30px', border: '1px solid #ccc', outline: 'none', fontSize: '0.82rem' }}
                  />
                  <Search size={14} color="#888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                </div>
                <button
                  onClick={() => exportProductsToExcel(filteredAdminProducts)}
                  className="btn-beo btn-beo-outline-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Download size={15} />
                  <span>{lang === 'vi' ? 'Xuất Excel Sản Phẩm' : 'Export Excel'}</span>
                </button>
                <button onClick={handleOpenCreateProduct} className="btn-beo btn-beo-red">
                  <Plus size={16} />
                  <span>{lang === 'vi' ? 'Thêm Sản Phẩm Mới' : 'Add New Product'}</span>
                </button>
              </div>
            </div>

            {filteredAdminProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888', backgroundColor: '#fafafa', border: '1px dashed #ddd' }}>
                {lang === 'vi' ? 'Không tìm thấy sản phẩm nào phù hợp với từ khóa tìm kiếm.' : 'No products matched current search keyword.'}
              </div>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'ẢNH / TÊN' : 'PRODUCT'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'MÃ SP' : 'CODE'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'GIỚI TÍNH' : 'GENDER'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'BST' : 'COLLECTION'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'GIÁ NIÊM YẾT' : 'RETAIL PRICE'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'BIẾN THỂ MÀU / SIZE' : 'COLOR / SIZE VARIANTS'}</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>{lang === 'vi' ? 'THAO TÁC' : 'ACTIONS'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdminProducts.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={prod.primaryImageUrl} alt={prod.name} style={{ width: '40px', height: '48px', objectFit: 'cover' }} />
                            <strong>{prod.name}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>{prod.code}</td>
                        <td style={{ padding: '10px' }}>{prod.gender}</td>
                        <td style={{ padding: '10px' }}>{prod.collection || 'BEO Essentials'}</td>
                        <td style={{ padding: '10px', fontWeight: '700' }}>
                          {prod.salePrice ? (
                            <div>
                              <span style={{ color: '#e60012' }}>{formatPrice(prod.salePrice)}</span>
                              <span style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'line-through', marginLeft: '4px' }}>
                                {formatPrice(prod.basePrice)}
                              </span>
                            </div>
                          ) : (
                            formatPrice(prod.basePrice)
                          )}
                        </td>
                        <td style={{ padding: '10px', fontWeight: '700' }}>{prod.variants?.length || 0} SKUs</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="btn-beo btn-beo-outline-gray"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Edit"
                            >
                              <Edit2 size={12} />
                              <span>{lang === 'vi' ? 'Sửa' : 'Edit'}</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(prod.id)}
                              style={{ color: '#d9383a', padding: '4px 8px', cursor: 'pointer', border: '1px solid #ffcdd2', backgroundColor: '#fff5f5' }}
                              title="Deactivate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Admin Products Pagination Controls (1, 2, 3, 4...) */}
                {totalAdminProductsCount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #eee'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#555' }}>
                      <span>
                        {lang === 'vi'
                          ? `Hiển thị ${(currentAdminProductsPage - 1) * adminProductsPerPage + 1}–${Math.min(currentAdminProductsPage * adminProductsPerPage, totalAdminProductsCount)} trong số ${totalAdminProductsCount} sản phẩm`
                          : `Showing ${(currentAdminProductsPage - 1) * adminProductsPerPage + 1}–${Math.min(currentAdminProductsPage * adminProductsPerPage, totalAdminProductsCount)} of ${totalAdminProductsCount} products`}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'vi' ? 'Số mục/trang:' : 'Per page:'}</span>
                        <select
                          value={adminProductsPerPage}
                          onChange={(e) => {
                            setAdminProductsPerPage(Number(e.target.value));
                            setAdminProductsPage(1);
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '2px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>

                    {/* Page Navigation Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => setAdminProductsPage((p) => Math.max(1, p - 1))}
                        disabled={currentAdminProductsPage === 1}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentAdminProductsPage === 1 ? '#f5f5f5' : '#ffffff',
                          color: currentAdminProductsPage === 1 ? '#aaa' : '#111',
                          cursor: currentAdminProductsPage === 1 ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>‹</span>
                        <span>{lang === 'vi' ? 'Trước' : 'Prev'}</span>
                      </button>

                      {Array.from({ length: totalAdminProductPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalAdminProductPages || Math.abs(p - currentAdminProductsPage) <= 2)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span style={{ padding: '0 4px', color: '#888' }}>...</span>}
                              <button
                                onClick={() => setAdminProductsPage(p)}
                                style={{
                                  minWidth: '34px',
                                  height: '32px',
                                  fontSize: '0.82rem',
                                  fontWeight: currentAdminProductsPage === p ? '800' : '600',
                                  border: currentAdminProductsPage === p ? '2px solid #e60012' : '1px solid #ccc',
                                  backgroundColor: currentAdminProductsPage === p ? '#e60012' : '#ffffff',
                                  color: currentAdminProductsPage === p ? '#ffffff' : '#333333',
                                  cursor: 'pointer',
                                  borderRadius: '2px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        onClick={() => setAdminProductsPage((p) => Math.min(totalAdminProductPages, p + 1))}
                        disabled={currentAdminProductsPage === totalAdminProductPages}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentAdminProductsPage === totalAdminProductPages ? '#f5f5f5' : '#ffffff',
                          color: currentAdminProductsPage === totalAdminProductPages ? '#aaa' : '#111',
                          cursor: currentAdminProductsPage === totalAdminProductPages ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{lang === 'vi' ? 'Sau' : 'Next'}</span>
                        <span>›</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= TAB 3: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.15rem', textTransform: 'uppercase', color: '#111' }}>
                  {lang === 'vi' ? `Quản Lý Toàn Bộ Đơn Hàng (${filteredOrders.length} / ${orders.length} đơn)` : `Omnichannel Orders Management (${filteredOrders.length} / ${orders.length})`}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '2px' }}>
                  {lang === 'vi' ? 'Theo dõi, lọc phân loại trạng thái và chuyển bước xử lý đơn hàng toàn hệ thống' : 'Filter by fulfillment status and transition order lifecycles in real-time'}
                </div>
              </div>

              {/* Status Classifier Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={16} color="#e60012" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#111' }}>
                    {lang === 'vi' ? 'Phân Loại Trạng Thái:' : 'Filter Status:'}
                  </span>
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    setOrdersPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    border: '2px solid #111',
                    backgroundColor: '#ffffff',
                    color: '#111',
                    outline: 'none',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    minWidth: '290px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <option value="ALL">{lang === 'vi' ? `TẤT CẢ TRẠNG THÁI (${(orders || []).length} đơn)` : `ALL STATUSES (${(orders || []).length})`}</option>
                  <option value="PENDING">PENDING ({lang === 'vi' ? 'Chờ xác nhận' : 'Pending'})</option>
                  <option value="CONFIRMED">CONFIRMED ({lang === 'vi' ? 'Đã xác nhận' : 'Confirmed'})</option>
                  <option value="PACKING">PACKING ({lang === 'vi' ? 'Đang đóng gói' : 'Packing'})</option>
                  <option value="SHIPPING">SHIPPING ({lang === 'vi' ? 'Đang giao hàng' : 'In Transit'})</option>
                  <option value="DELIVERED">DELIVERED ({lang === 'vi' ? 'Đã giao thành công' : 'Delivered'})</option>
                  <option value="COMPLETED">COMPLETED ({lang === 'vi' ? 'Hoàn tất' : 'Completed'})</option>
                  <option value="CANCELLED">CANCELLED ({lang === 'vi' ? 'Hủy đơn & hoàn kho' : 'Cancelled & Restocked'})</option>
                </select>

                <button
                  onClick={() => exportOrdersToExcel(filteredOrders)}
                  className="btn-beo btn-beo-outline-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '9px 14px' }}
                >
                  <Download size={15} />
                  <span>{lang === 'vi' ? `Xuất Excel (${filteredOrders.length})` : `Export Excel (${filteredOrders.length})`}</span>
                </button>
              </div>
            </div>

            {/* Quick Status Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid #eee' }}>
              {[
                { id: 'ALL', label: lang === 'vi' ? 'Tất cả' : 'All', count: (orders || []).length, color: '#111' },
                { id: 'PENDING', label: lang === 'vi' ? 'Chờ xác nhận' : 'Pending', count: (orders || []).filter((o) => o.status === 'PENDING').length, color: '#f57c00' },
                { id: 'CONFIRMED', label: lang === 'vi' ? 'Đã xác nhận' : 'Confirmed', count: (orders || []).filter((o) => o.status === 'CONFIRMED').length, color: '#00875a' },
                { id: 'PACKING', label: lang === 'vi' ? 'Đang đóng gói' : 'Packing', count: (orders || []).filter((o) => o.status === 'PACKING').length, color: '#0052cc' },
                { id: 'SHIPPING', label: lang === 'vi' ? 'Đang giao hàng' : 'In Transit', count: (orders || []).filter((o) => o.status === 'SHIPPING').length, color: '#6554c0' },
                { id: 'DELIVERED', label: lang === 'vi' ? 'Đã giao thành công' : 'Delivered', count: (orders || []).filter((o) => o.status === 'DELIVERED').length, color: '#00875a' },
                { id: 'COMPLETED', label: lang === 'vi' ? 'Hoàn tất' : 'Completed', count: (orders || []).filter((o) => o.status === 'COMPLETED').length, color: '#2e7d32' },
                { id: 'CANCELLED', label: lang === 'vi' ? 'Hủy đơn' : 'Cancelled', count: (orders || []).filter((o) => o.status === 'CANCELLED').length, color: '#e60012' }
              ].map((chip) => {
                const isSelected = orderStatusFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setOrderStatusFilter(chip.id);
                      setOrdersPage(1);
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? '800' : '600',
                      border: isSelected ? `2px solid ${chip.color}` : '1px solid #ddd',
                      backgroundColor: isSelected ? (chip.id === 'ALL' ? '#111' : '#f0f4ff') : '#ffffff',
                      color: isSelected ? (chip.id === 'ALL' ? '#fff' : chip.color) : '#555',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{chip.label}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        backgroundColor: isSelected ? (chip.id === 'ALL' ? '#e60012' : chip.color) : '#eee',
                        color: isSelected ? '#fff' : '#333'
                      }}
                    >
                      {chip.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', backgroundColor: '#f9f9f9', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '3px' }}>
              <Search size={16} color="#888" />
              <input
                type="text"
                placeholder={lang === 'vi' ? 'Tìm kiếm theo mã đơn (BEO-...), tên khách hàng, số điện thoại, tỉnh thành...' : 'Search by Order ID (BEO-...), customer name, phone, city...'}
                value={orderSearchQuery}
                onChange={(e) => {
                  setOrderSearchQuery(e.target.value);
                  setOrdersPage(1);
                }}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem' }}
              />
              {orderSearchQuery && (
                <button
                  onClick={() => {
                    setOrderSearchQuery('');
                    setOrdersPage(1);
                  }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888', backgroundColor: '#fafafa', border: '1px dashed #ddd' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>
                  {lang === 'vi' ? 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc' : 'No orders matched current filter criteria'}
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                  {lang === 'vi' ? 'Thử chọn trạng thái "TẤT CẢ TRẠNG THÁI" hoặc xóa từ khóa tìm kiếm.' : 'Try selecting "ALL STATUSES" or clearing search keyword.'}
                </div>
              </div>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'MÃ ĐƠN' : 'ORDER ID'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'KHÁCH HÀNG' : 'CUSTOMER'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'CHI NHÁNH' : 'LOCATION'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'LOẠI ĐƠN' : 'TYPE'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'TỔNG TIỀN' : 'AMOUNT'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'TRẠNG THÁI' : 'STATUS'}</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>{lang === 'vi' ? 'THAO TÁC' : 'ACTION'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px', fontWeight: '800' }}>
                          <span style={{ fontFamily: 'monospace', color: '#111' }}>{ord.orderNumber}</span>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: '700' }}>{ord.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>{ord.customerPhone}</div>
                        </td>
                        <td style={{ padding: '10px' }}>{ord.storeName || 'Online'}</td>
                        <td style={{ padding: '10px' }}>
                          <span className="badge-beo gray" style={{ fontSize: '0.72rem' }}>{ord.orderType}</span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: '800', color: '#e60012' }}>{formatPrice(ord.finalAmount)}</td>
                        <td style={{ padding: '10px' }}>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateAdminOrderStatus(ord.id, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              fontWeight: '800',
                              border:
                                ord.status === 'CANCELLED'
                                  ? '1px solid #ffcdd2'
                                  : ord.status === 'CONFIRMED' || ord.status === 'DELIVERED' || ord.status === 'COMPLETED'
                                  ? '1px solid #c8e6c9'
                                  : ord.status === 'PACKING' || ord.status === 'SHIPPING'
                                  ? '1px solid #bbdefb'
                                  : '1px solid #ffe0b2',
                              backgroundColor:
                                ord.status === 'CANCELLED'
                                  ? '#fff0f0'
                                  : ord.status === 'CONFIRMED' || ord.status === 'DELIVERED' || ord.status === 'COMPLETED'
                                  ? '#e8f5e9'
                                  : ord.status === 'PACKING' || ord.status === 'SHIPPING'
                                  ? '#e3f2fd'
                                  : '#fff8e1',
                              color:
                                ord.status === 'CANCELLED'
                                  ? '#e60012'
                                  : ord.status === 'CONFIRMED' || ord.status === 'DELIVERED' || ord.status === 'COMPLETED'
                                  ? '#2e7d32'
                                  : ord.status === 'PACKING' || ord.status === 'SHIPPING'
                                  ? '#1565c0'
                                  : '#e65100',
                              outline: 'none',
                              cursor: 'pointer',
                              borderRadius: '3px'
                            }}
                          >
                            <option value="PENDING">PENDING ({lang === 'vi' ? 'Chờ xác nhận' : 'Pending'})</option>
                            <option value="CONFIRMED">CONFIRMED ({lang === 'vi' ? 'Đã xác nhận' : 'Confirmed'})</option>
                            <option value="PACKING">PACKING ({lang === 'vi' ? 'Đang đóng gói' : 'Packing'})</option>
                            <option value="SHIPPING">SHIPPING ({lang === 'vi' ? 'Đang giao hàng' : 'In Transit'})</option>
                            <option value="DELIVERED">DELIVERED ({lang === 'vi' ? 'Đã giao thành công' : 'Delivered'})</option>
                            <option value="COMPLETED">COMPLETED ({lang === 'vi' ? 'Hoàn tất' : 'Completed'})</option>
                            <option value="CANCELLED">CANCELLED ({lang === 'vi' ? 'Hủy đơn & hoàn kho' : 'Cancelled & Restocked'})</option>
                          </select>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setReceiptOrder(ord)}
                              className="btn-beo btn-beo-outline-gray"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Printer size={12} />
                              <span>{lang === 'vi' ? 'Hóa đơn' : 'Receipt'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Modern Pagination Controls (1, 2, 3, 4...) */}
                {totalOrdersCount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #eee'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#555' }}>
                      <span>
                        {lang === 'vi'
                          ? `Hiển thị ${(currentOrdersPage - 1) * ordersPerPage + 1}–${Math.min(currentOrdersPage * ordersPerPage, totalOrdersCount)} trong số ${totalOrdersCount} đơn hàng`
                          : `Showing ${(currentOrdersPage - 1) * ordersPerPage + 1}–${Math.min(currentOrdersPage * ordersPerPage, totalOrdersCount)} of ${totalOrdersCount} orders`}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'vi' ? 'Số đơn/trang:' : 'Per page:'}</span>
                        <select
                          value={ordersPerPage}
                          onChange={(e) => {
                            setOrdersPerPage(Number(e.target.value));
                            setOrdersPage(1);
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '2px',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>

                    {/* Page Navigation Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                        disabled={currentOrdersPage === 1}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentOrdersPage === 1 ? '#f5f5f5' : '#ffffff',
                          color: currentOrdersPage === 1 ? '#aaa' : '#111',
                          cursor: currentOrdersPage === 1 ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>‹</span>
                        <span>{lang === 'vi' ? 'Trước' : 'Prev'}</span>
                      </button>

                      {Array.from({ length: totalOrderPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalOrderPages || Math.abs(p - currentOrdersPage) <= 2)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span style={{ padding: '0 4px', color: '#888' }}>...</span>}
                              <button
                                onClick={() => setOrdersPage(p)}
                                style={{
                                  minWidth: '34px',
                                  height: '32px',
                                  fontSize: '0.82rem',
                                  fontWeight: currentOrdersPage === p ? '800' : '600',
                                  border: currentOrdersPage === p ? '2px solid #e60012' : '1px solid #ccc',
                                  backgroundColor: currentOrdersPage === p ? '#e60012' : '#ffffff',
                                  color: currentOrdersPage === p ? '#ffffff' : '#333333',
                                  cursor: 'pointer',
                                  borderRadius: '2px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        onClick={() => setOrdersPage((p) => Math.min(totalOrderPages, p + 1))}
                        disabled={currentOrdersPage === totalOrderPages}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentOrdersPage === totalOrderPages ? '#f5f5f5' : '#ffffff',
                          color: currentOrdersPage === totalOrderPages ? '#aaa' : '#111',
                          cursor: currentOrdersPage === totalOrderPages ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{lang === 'vi' ? 'Sau' : 'Next'}</span>
                        <span>›</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= TAB 4: USERS & ROLES ================= */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '20px' }}>
              {lang === 'vi' ? 'Quản Lý Người Dùng & Phân Quyền Hệ Thống' : 'Access Authorization & Role Management'}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>{lang === 'vi' ? 'HỌ VÀ TÊN' : 'FULL NAME'}</th>
                  <th style={{ padding: '10px' }}>EMAIL</th>
                  <th style={{ padding: '10px' }}>{lang === 'vi' ? 'SỐ ĐIỆN THOẠI' : 'PHONE'}</th>
                  <th style={{ padding: '10px' }}>{lang === 'vi' ? 'VAI TRÒ HIỆN TẠI' : 'CURRENT ROLE'}</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>{lang === 'vi' ? 'CHUYỂN PHÂN QUYỀN' : 'ROLE SWITCHER'}</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>{u.fullName}</td>
                    <td style={{ padding: '10px' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>{u.phone || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge-beo red">{u.role}</span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                        style={{ padding: '4px 8px', border: '1px solid #ccc', fontSize: '0.8rem', outline: 'none' }}
                      >
                        <option value="ROLE_CUSTOMER">ROLE_CUSTOMER (Customer)</option>
                        <option value="ROLE_STAFF_MANAGER">ROLE_STAFF_MANAGER (Store Manager)</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN (System Admin)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 5: COUPONS ================= */}
        {activeTab === 'coupons' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Quản Lý Mã Giảm Giá & Số Lượng Khuyến Mãi' : 'Coupons & Promotional Code Inventory'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
                  {lang === 'vi' ? 'Thiết lập giới hạn số lượng mã, theo dõi tỷ lệ đã sử dụng và số lượng còn lại' : 'Configure code quota limits, redemption counters, and usage velocity'}
                </div>
              </div>
              <button onClick={handleOpenCreateCoupon} className="btn-beo btn-beo-red">
                <Plus size={16} />
                <span>{lang === 'vi' ? 'Tạo Mã Mới' : 'Create New Coupon'}</span>
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>{lang === 'vi' ? 'MÃ VOUCHER' : 'CODE'}</th>
                  <th style={{ padding: '10px' }}>{lang === 'vi' ? 'MÔ TẢ' : 'DESCRIPTION'}</th>
                  <th style={{ padding: '10px' }}>{lang === 'vi' ? 'MỨC GIẢM' : 'DISCOUNT'}</th>
                  <th style={{ padding: '10px' }}>{lang === 'vi' ? 'ĐƠN TỐI THIỂU' : 'MIN SPEND'}</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'vi' ? 'TỔNG SỐ LƯỢNG' : 'TOTAL QUOTA'}</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'vi' ? 'ĐÃ DÙNG' : 'REDEEMED'}</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'vi' ? 'SỐ LƯỢNG CÒN LẠI' : 'REMAINING'}</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'vi' ? 'TRẠNG THÁI' : 'STATUS'}</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>{lang === 'vi' ? 'THAO TÁC' : 'ACTION'}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const limit = c.usageLimit || 1000;
                  const used = c.usedCount || 0;
                  const remaining = Math.max(limit - used, 0);
                  const usagePercent = Math.min(Math.round((used / limit) * 100), 100);
                  const isOutOfStock = remaining === 0;

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: '900',
                          color: isOutOfStock ? '#888' : '#e60012',
                          backgroundColor: isOutOfStock ? '#f0f0f0' : '#fff0f0',
                          padding: '3px 8px',
                          border: isOutOfStock ? '1px solid #ccc' : '1px solid #ffcccc',
                          borderRadius: '3px'
                        }}>
                          {c.code}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{c.description}</td>
                      <td style={{ padding: '10px', fontWeight: '700' }}>
                        {c.discountType === 'PERCENT' ? `${c.discountValue}% (${lang === 'vi' ? 'Tối đa ' : 'Cap '}${formatPrice(c.maxDiscountAmount || 100000)})` : formatPrice(c.discountValue)}
                      </td>
                      <td style={{ padding: '10px' }}>{formatPrice(c.minOrderAmount || 0)}</td>
                      
                      {/* Total Usage Limit */}
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: '800', fontSize: '0.95rem' }}>
                        {limit.toLocaleString()}
                      </td>

                      {/* Used Count with Mini Progress */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontWeight: '700' }}>{used.toLocaleString()}</div>
                        <div style={{ width: '80px', height: '4px', backgroundColor: '#e0e0e0', margin: '4px auto 0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${usagePercent}%`, height: '100%', backgroundColor: usagePercent > 90 ? '#e60012' : '#0052cc' }} />
                        </div>
                      </td>

                      {/* Remaining Count */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {isOutOfStock ? (
                          <span className="badge-beo red" style={{ fontWeight: '800' }}>{lang === 'vi' ? 'HẾT MÃ (0)' : 'DEPLETED (0)'}</span>
                        ) : remaining <= 10 ? (
                          <span className="badge-beo red" style={{ fontWeight: '800' }}>{lang === 'vi' ? `Sắp hết (${remaining})` : `Low (${remaining})`}</span>
                        ) : (
                          <span className="badge-beo gray" style={{ color: '#00875a', fontWeight: '800' }}>
                            {remaining.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {isOutOfStock ? (
                          <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600' }}>{lang === 'vi' ? 'Hết lượt dùng' : 'Depleted'}</span>
                        ) : c.active ? (
                          <span className="badge-beo gray" style={{ color: '#00875a' }}>{lang === 'vi' ? 'Đang mở' : 'Active'}</span>
                        ) : (
                          <span className="badge-beo red">{lang === 'vi' ? 'Đã tắt' : 'Inactive'}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditCoupon(c)}
                            className="btn-beo btn-beo-outline-gray"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Edit"
                          >
                            <Edit2 size={12} />
                            <span>{lang === 'vi' ? 'Sửa' : 'Edit'}</span>
                          </button>
                          <button
                            onClick={() => setDeleteCouponId(c.id)}
                            style={{ color: '#d9383a', padding: '4px 8px', cursor: 'pointer', border: '1px solid #ffcdd2', backgroundColor: '#fff5f5' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 6: VIETQR BANK CONFIGURATION ================= */}
        {activeTab === 'bank-config' && (
          <div style={{ backgroundColor: '#ffffff', padding: '28px', border: '1px solid #e0e0e0', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Building size={24} color="#e60012" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, textTransform: 'uppercase' }}>
                {lang === 'vi' ? 'Cấu Hình Tài Khoản Nhận Tiền VietQR (Napas247)' : 'VietQR Beneficiary Settlement Gateway Settings'}
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '24px' }}>
              {lang === 'vi'
                ? 'Tất cả mã QR thanh toán sinh ra tại trang Checkout và In-Store POS sẽ tự động khớp theo cấu hình ngân hàng bên dưới.'
                : 'All dynamic QR codes generated during Checkout and POS automatically reconcile to this bank account.'}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '32px',
              alignItems: 'start'
            }}>
              {/* Left: Configuration Form */}
              <form onSubmit={handleSaveBankConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Mã Ngân Hàng (Bank ID theo chuẩn VietQR) *' : 'Beneficiary Bank ID (VietQR standard) *'}
                  </label>
                  <select
                    value={bankConfig.bankId}
                    onChange={(e) => {
                      const bankMap = {
                        'vietinbank': 'VietinBank (ICB)',
                        'vcb': 'Vietcombank (VCB)',
                        'mbbank': 'MB Bank (MB)',
                        'techcombank': 'Techcombank (TCB)',
                        'acb': 'ACB',
                        'tpbank': 'TPBank',
                        'vpbank': 'VPBank',
                        'bidv': 'BIDV',
                      };
                      setBankConfig({
                        ...bankConfig,
                        bankId: e.target.value,
                        bankName: bankMap[e.target.value] || e.target.value.toUpperCase()
                      });
                    }}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none', fontWeight: '600' }}
                  >
                    <option value="vietinbank">VietinBank (ICB)</option>
                    <option value="vcb">Vietcombank (VCB)</option>
                    <option value="mbbank">MB Bank (MB)</option>
                    <option value="techcombank">Techcombank (TCB)</option>
                    <option value="acb">ACB</option>
                    <option value="tpbank">TPBank</option>
                    <option value="vpbank">VPBank</option>
                    <option value="bidv">BIDV</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Tên đầy đủ Ngân hàng *' : 'Bank Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.bankName}
                    onChange={(e) => setBankConfig({ ...bankConfig, bankName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Số Tài Khoản Nhận Tiền *' : 'Beneficiary Account Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.accountNo}
                    onChange={(e) => setBankConfig({ ...bankConfig, accountNo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none', fontFamily: 'monospace', fontWeight: '700', fontSize: '1.05rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Tên Chủ Tài Khoản (In hoa không dấu) *' : 'Account Holder Name (Uppercase) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankConfig.accountName}
                    onChange={(e) => setBankConfig({ ...bankConfig, accountName: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none', fontWeight: '700' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                    {lang === 'vi' ? 'Mẫu Giao Diện VietQR (Template)' : 'VietQR Image Template'}
                  </label>
                  <select
                    value={bankConfig.template || 'compact2'}
                    onChange={(e) => setBankConfig({ ...bankConfig, template: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                  >
                    <option value="compact2">{lang === 'vi' ? 'Compact 2 (Gọn gàng kèm logo & số tiền - Khuyên dùng)' : 'Compact 2 (Recommended - with brand & amount)'}</option>
                    <option value="compact">{lang === 'vi' ? 'Compact (Đầy đủ thông tin khung viền)' : 'Compact (Full bordered)'}</option>
                    <option value="qr_only">{lang === 'vi' ? 'QR Only (Chỉ hình mã QR)' : 'QR Only (Direct code)'}</option>
                    <option value="print">{lang === 'vi' ? 'Print (Khổ in hóa đơn POS nhiệt)' : 'Print (Thermal slip layout)'}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingBankConfig}
                  className="btn-beo btn-beo-red"
                  style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
                >
                  <Save size={16} />
                  <span>{savingBankConfig ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : (lang === 'vi' ? 'Lưu Cấu Hình Ngân Hàng' : 'Save Gateway Configuration')}</span>
                </button>
              </form>

              {/* Right: Live VietQR Preview */}
              <div style={{ backgroundColor: '#fafafa', border: '1px solid #eee', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '14px', color: '#111' }}>
                  {lang === 'vi' ? 'XEM TRƯỚC MẪU MÃ QR TỰ ĐỘNG' : 'DYNAMIC VIETQR LIVE PREVIEW'}
                </div>

                <img
                  src={`https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-${bankConfig.template || 'compact2'}.png?amount=599000&addInfo=Thanh+toan+don+hang+BEO-TEST&accountName=${encodeURIComponent(bankConfig.accountName)}`}
                  alt="VietQR Preview"
                  style={{
                    width: '260px',
                    height: 'auto',
                    maxWidth: '100%',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    padding: '8px',
                    margin: '0 auto 14px auto',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                />

                <div style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.5, textAlign: 'left', backgroundColor: '#fff', padding: '12px', border: '1px solid #eee' }}>
                  <div>• {lang === 'vi' ? 'Ngân hàng:' : 'Bank:'} <strong>{bankConfig.bankName}</strong></div>
                  <div>• {lang === 'vi' ? 'STK:' : 'Account No:'} <strong style={{ fontFamily: 'monospace' }}>{bankConfig.accountNo}</strong></div>
                  <div>• {lang === 'vi' ? 'Chủ TK:' : 'Account Holder:'} <strong>{bankConfig.accountName}</strong></div>
                  <div>• {lang === 'vi' ? 'Cú pháp tự động:' : 'Payment Memo:'} <code style={{ color: '#0052cc' }}>Thanh toan don hang [ORDER_ID]</code></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Product */}
        {isProductModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#fff',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontWeight: '800', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                  {editingProduct
                    ? (lang === 'vi' ? 'Chỉnh Sửa Thông Tin Sản Phẩm' : 'Edit Product Details')
                    : (lang === 'vi' ? 'Thêm Sản Phẩm Mới & Tạo Ma Trận Biến Thể' : 'Add New Product & Generate Variant Matrix')}
                </div>
                <button onClick={() => setIsProductModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Tên sản phẩm *' : 'Product Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={prodFormName}
                    onChange={(e) => setProdFormName(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Mã sản phẩm *' : 'Product Code *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={prodFormCode}
                      onChange={(e) => setProdFormCode(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Giá niêm yết (VND) *' : 'Base Price (VND) *'}
                    </label>
                    <input
                      type="number"
                      required
                      value={prodFormPrice}
                      onChange={(e) => setProdFormPrice(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Giá khuyến mãi (Tùy chọn)' : 'Sale Price (Optional)'}
                    </label>
                    <input
                      type="number"
                      value={prodFormSalePrice}
                      onChange={(e) => setProdFormSalePrice(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Giới tính *' : 'Gender *'}
                    </label>
                    <select
                      value={prodFormGender}
                      onChange={(e) => setProdFormGender(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    >
                      <option value="MEN">MEN</option>
                      <option value="WOMEN">WOMEN</option>
                      <option value="UNISEX">UNISEX</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Bộ sưu tập *' : 'Collection *'}
                    </label>
                    <input
                      type="text"
                      value={prodFormCollection}
                      onChange={(e) => setProdFormCollection(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Chất liệu *' : 'Material *'}
                    </label>
                    <input
                      type="text"
                      value={prodFormMaterial}
                      onChange={(e) => setProdFormMaterial(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Mô tả sản phẩm' : 'Product Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={prodFormDesc}
                    onChange={(e) => setProdFormDesc(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'URL hình ảnh đại diện *' : 'Primary Image URL *'}
                  </label>
                  <input
                    type="url"
                    required
                    value={prodFormImage}
                    onChange={(e) => setProdFormImage(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                {/* Variant Matrix Checkboxes */}
                {!editingProduct && (
                <div style={{ backgroundColor: '#fafafa', padding: '14px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px' }}>
                    {lang === 'vi' ? 'MA TRẬN BIẾN THỂ TỰ ĐỘNG (VARIANT MATRIX GENERATOR):' : 'AUTOMATIC SKU VARIANT MATRIX GENERATOR:'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px' }}>
                    {lang === 'vi'
                      ? `Hệ thống sẽ tự động tạo ${selectedColorsForMatrix.length * selectedSizesForMatrix.length} SKU và gán mã vạch:`
                      : `Generates ${selectedColorsForMatrix.length * selectedSizesForMatrix.length} unique SKUs and Barcodes:`}
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{lang === 'vi' ? 'Màu sắc: ' : 'Colors: '}</span>
                    {['09 BLACK', '00 WHITE', '68 BLUE', '32 BEIGE', '03 GRAY'].map((c) => (
                      <label key={c} style={{ marginRight: '10px', fontSize: '0.8rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedColorsForMatrix.includes(c)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedColorsForMatrix([...selectedColorsForMatrix, c]);
                            else setSelectedColorsForMatrix(selectedColorsForMatrix.filter((x) => x !== c));
                          }}
                          style={{ accentColor: '#e60012', marginRight: '4px' }}
                        />
                        {c}
                      </label>
                    ))}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{lang === 'vi' ? 'Kích cỡ: ' : 'Sizes: '}</span>
                    {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                      <label key={s} style={{ marginRight: '10px', fontSize: '0.8rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedSizesForMatrix.includes(s)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSizesForMatrix([...selectedSizesForMatrix, s]);
                            else setSelectedSizesForMatrix(selectedSizesForMatrix.filter((x) => x !== s));
                          }}
                          style={{ accentColor: '#e60012', marginRight: '4px' }}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-beo btn-beo-outline-gray" style={{ padding: '10px 18px' }}>
                    {lang === 'vi' ? 'Hủy' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn-beo btn-beo-red" style={{ padding: '10px 24px' }}>
                    {editingProduct ? (lang === 'vi' ? 'Lưu Thay Đổi Sản Phẩm' : 'Save Changes') : (lang === 'vi' ? 'Lưu & Khởi Tạo Biến Thể' : 'Create Product & SKUs')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create / Edit Coupon */}
        {isCouponModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#fff', padding: '24px', boxShadow: 'var(--shadow-lg)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <div style={{ fontWeight: '800', fontSize: '1.15rem', color: '#111', textTransform: 'uppercase' }}>
                  {editingCoupon
                    ? (lang === 'vi' ? `Chỉnh Sửa Mã: ${editingCoupon.code}` : `Edit Coupon: ${editingCoupon.code}`)
                    : (lang === 'vi' ? 'Tạo Mã Giảm Giá Mới' : 'Create New Promotional Coupon')}
                </div>
                <button onClick={() => setIsCouponModalOpen(false)} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Mã Voucher *' : 'Voucher Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BEO20, SUMMER50K..."
                    value={coupCode}
                    onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontWeight: '700', letterSpacing: '1px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Mô tả khuyến mãi *' : 'Promotion Description *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'vi' ? 'Giảm giá 10% đơn từ 300.000đ' : '10% discount on orders from 300,000 VND'}
                    value={coupDesc}
                    onChange={(e) => setCoupDesc(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Loại giảm' : 'Discount Type'}
                    </label>
                    <select
                      value={coupType}
                      onChange={(e) => setCoupType(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                      <option value="PERCENT">{lang === 'vi' ? 'Phần trăm (%)' : 'Percentage (%)'}</option>
                      <option value="FIXED_AMOUNT">{lang === 'vi' ? 'Số tiền cố định (VND)' : 'Fixed Amount (VND)'}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {coupType === 'PERCENT' ? (lang === 'vi' ? 'Giá trị giảm (%) *' : 'Discount Rate (%) *') : (lang === 'vi' ? 'Số tiền giảm (VND) *' : 'Discount Value (VND) *')}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={coupVal}
                      onChange={(e) => setCoupVal(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontWeight: '700' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Đơn hàng tối thiểu (VND)' : 'Min Order Amount (VND)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={coupMin}
                      onChange={(e) => setCoupMin(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Giảm tối đa (VND)' : 'Max Discount Cap (VND)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      placeholder={lang === 'vi' ? 'Không giới hạn' : 'No cap'}
                      value={coupMax}
                      onChange={(e) => setCoupMax(e.target.value)}
                      disabled={coupType !== 'PERCENT'}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', backgroundColor: coupType !== 'PERCENT' ? '#f5f5f5' : '#fff' }}
                    />
                  </div>
                </div>

                {/* QUANTITY / USAGE LIMIT */}
                <div style={{ padding: '12px', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', borderRadius: '4px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#8a6d3b', marginBottom: '4px' }}>
                    🏷️ {lang === 'vi' ? 'SỐ LƯỢNG MÃ KHUYẾN MÃI (LƯỢT SỬ DỤNG TỐI ĐA) *' : 'COUPON QUOTA (MAX REDEMPTION LIMIT) *'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 100, 500, 1000..."
                      value={coupLimit}
                      onChange={(e) => setCoupLimit(e.target.value)}
                      style={{ width: '160px', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontWeight: '800', fontSize: '1rem', color: '#111' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {editingCoupon
                        ? (lang === 'vi' ? `Đã sử dụng: ${editingCoupon.usedCount || 0} lượt` : `Redeemed: ${editingCoupon.usedCount || 0} times`)
                        : (lang === 'vi' ? 'Số lượng mã phát hành cho khách hàng' : 'Total promotional vouchers available')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
                  <button type="button" onClick={() => setIsCouponModalOpen(false)} className="btn-beo btn-beo-outline-gray" style={{ padding: '9px 18px' }}>
                    {lang === 'vi' ? 'Hủy Bỏ' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn-beo btn-beo-red" style={{ padding: '9px 24px', fontWeight: '800' }}>
                    {editingCoupon ? (lang === 'vi' ? 'Cập Nhật Mã Giảm Giá' : 'Save Coupon') : (lang === 'vi' ? 'Tạo Mã Khuyến Mãi' : 'Create Coupon')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        <ReceiptModal
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
        />

        {/* Delete / Deactivate Confirm Modal */}
        <ConfirmModal
          isOpen={!!deleteConfirmId}
          title={lang === 'vi' ? 'Ngừng kinh doanh sản phẩm' : 'Deactivate Product Listing'}
          message={lang === 'vi' ? 'Bạn có chắc chắn muốn ngưng kinh doanh sản phẩm này? Sản phẩm sẽ bị ẩn khỏi trang bán hàng trực tuyến của khách hàng.' : 'Are you sure you want to remove this product from the customer storefront?'}
          confirmText={lang === 'vi' ? 'Đồng ý ngưng bán' : 'Confirm Deactivation'}
          cancelText={lang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
          isDanger={true}
          onConfirm={confirmDeleteProduct}
          onCancel={() => setDeleteConfirmId(null)}
        />

        {/* Delete Coupon Confirm Modal */}
        <ConfirmModal
          isOpen={!!deleteCouponId}
          title={lang === 'vi' ? 'Xóa Mã Khuyến Mãi' : 'Delete Coupon'}
          message={lang === 'vi' ? 'Bạn có chắc chắn muốn xóa mã giảm giá này? Mã sẽ không còn hiệu lực đối với các đơn hàng tiếp theo.' : 'Are you sure you want to delete this coupon? It will no longer be redeemable by customers.'}
          confirmText={lang === 'vi' ? 'Đồng ý xóa' : 'Confirm Deletion'}
          cancelText={lang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
          isDanger={true}
          onConfirm={() => handleDeleteCoupon(deleteCouponId)}
          onCancel={() => setDeleteCouponId(null)}
        />
      </div>
    </div>
  );
};
