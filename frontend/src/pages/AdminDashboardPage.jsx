import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  CheckCircle,
  Eye,
  X,
  Printer,
  QrCode,
  Building,
  Save,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { exportOrdersToExcel, exportProductsToExcel } from '../utils/excelExporter';
import api from '../services/api';

export const AdminDashboardPage = ({ onNavigate }) => {
  const { formatPrice } = useLanguage();
  const { showSuccess, showError } = useToast();

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
    } catch (e) {
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
  const [loading, setLoading] = useState(true);

  // Product Create/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCode, setProdFormCode] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState(399000);
  const [prodFormSalePrice, setProdFormSalePrice] = useState('');
  const [prodFormCategoryId, setProdFormCategoryId] = useState(1);
  const [prodFormGender, setProdFormGender] = useState('MEN');
  const [prodFormCollection, setProdFormCollection] = useState('AIRism');
  const [prodFormMaterial, setProdFormMaterial] = useState('100% Cotton');
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

  // Orders Management Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const [receiptOrder, setReceiptOrder] = useState(null);

  // VietQR Config State
  const [bankConfig, setBankConfig] = useState({
    bankId: 'vietinbank',
    bankName: 'VietinBank (Ngân hàng TMCP Công Thương Việt Nam)',
    accountNo: '113366668888',
    accountName: 'BEO FASHION VIETNAM',
    template: 'compact2'
  });
  const [savingBankConfig, setSavingBankConfig] = useState(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [resStats, resProds, resOrders, resUsers, resCoups, resCats, resBank] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/products?sizePerPage=100'),
        api.get('/admin/orders?size=100'),
        api.get('/admin/users'),
        api.get('/admin/coupons'),
        api.get('/categories'),
        api.get('/payments/vietqr/config'),
      ]);

      if (resStats.data) setStats(resStats.data);
      if (resProds.data) setProducts(resProds.data.content || []);
      if (resOrders.data) setOrders(resOrders.data.content || []);
      if (resUsers.data) setUsersList(resUsers.data);
      if (resCoups.data) setCoupons(resCoups.data);
      if (resCats.data) setCategories(resCats.data);
      if (resBank.data) setBankConfig(resBank.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveBankConfig = async (e) => {
    e.preventDefault();
    setSavingBankConfig(true);
    try {
      await api.put('/payments/vietqr/config', bankConfig);
      showSuccess('Cập nhật thông tin tài khoản nhận tiền VietQR thành công!');
    } catch (err) {
      showError(err.message || 'Lỗi khi lưu cấu hình ngân hàng');
    } finally {
      setSavingBankConfig(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // --- PRODUCT MANAGEMENT ---
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdFormName('');
    setProdFormCode('UQ-' + Math.floor(100000 + Math.random() * 900000));
    setProdFormPrice(399000);
    setProdFormSalePrice('');
    setProdFormCategoryId(categories[0]?.id || 1);
    setProdFormGender('MEN');
    setProdFormCollection('LifeWear Essentials');
    setProdFormMaterial('100% Cotton cao cấp');
    setProdFormDesc('Thiết kế chuẩn Nhật Bản mang lại sự thoải mái tối ưu.');
    setProdFormImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
    setProdFormFeatured(true);
    setProdFormNew(true);
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
    setProdFormCollection(prod.collection || 'LifeWear Essentials');
    setProdFormMaterial(prod.material || '100% Cotton cao cấp');
    setProdFormDesc(prod.description || '');
    setProdFormImage(prod.primaryImageUrl || '');
    setProdFormFeatured(prod.featured || false);
    setProdFormNew(prod.new || false);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      // Build variant matrix
      const variants = [];
      const colorHexMap = {
        '09 BLACK': '#111111',
        '00 WHITE': '#ffffff',
        '68 BLUE': '#2980b9',
        '32 BEIGE': '#d2b48c',
        '03 GRAY': '#7f8c8d',
        '12 PINK': '#fadbd8',
      };

      for (const col of selectedColorsForMatrix) {
        for (const sz of selectedSizesForMatrix) {
          variants.push({
            colorName: col,
            colorHex: colorHexMap[col] || '#000000',
            size: sz,
            sku: `${prodFormCode}-${col.substring(0, 2)}-${sz}`,
            barcode: '45500' + Math.floor(1000000 + Math.random() * 9000000),
            totalStock: 50,
            imageUrl: prodFormImage
          });
        }
      }

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
        showSuccess('Cập nhật sản phẩm thành công!');
      } else {
        await api.post('/admin/products', payload);
        showSuccess('Tạo mới sản phẩm với ma trận biến thể thành công!');
      }

      setIsProductModalOpen(false);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/admin/products/${deleteConfirmId}`);
      showSuccess('Đã chuyển sản phẩm sang trạng thái ngừng kinh doanh');
      setDeleteConfirmId(null);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Lỗi khi xóa sản phẩm');
      setDeleteConfirmId(null);
    }
  };

  // --- ORDER STATUS UPDATE ---
  const handleUpdateAdminOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      showSuccess(`Đã cập nhật trạng thái đơn hàng sang ${newStatus}`);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  // --- USER ROLE MANAGEMENT ---
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      showSuccess(`Đã cập nhật phân quyền người dùng sang ${newRole}`);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Lỗi khi cập nhật quyền');
    }
  };

  // --- COUPON CRUD OPERATIONS ---
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

  const handleOpenEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCoupCode(coupon.code);
    setCoupDesc(coupon.description || '');
    setCoupType(coupon.discountType);
    setCoupVal(coupon.discountValue);
    setCoupMin(coupon.minOrderAmount || 0);
    setCoupMax(coupon.maxDiscountAmount || 0);
    setCoupLimit(coupon.usageLimit || 500);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: coupCode.toUpperCase().trim(),
        description: coupDesc,
        discountType: coupType,
        discountValue: Number(coupVal),
        minOrderAmount: Number(coupMin),
        maxDiscountAmount: coupType === 'PERCENT' ? Number(coupMax) : null,
        usageLimit: Number(coupLimit),
        active: true
      };

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, payload);
        showSuccess(`Cập nhật mã khuyến mãi ${payload.code} thành công!`);
      } else {
        await api.post('/admin/coupons', payload);
        showSuccess(`Tạo mã khuyến mãi ${payload.code} thành công!`);
      }

      setIsCouponModalOpen(false);
      setEditingCoupon(null);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Lỗi khi lưu mã khuyến mãi');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      showSuccess('Đã xóa mã khuyến mãi thành công');
      setDeleteCouponId(null);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Lỗi khi xóa mã khuyến mãi');
    }
  };

  // Filtered Orders calculation based on status classifier & search query
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = orderStatusFilter === 'ALL' || ord.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(q)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.includes(q)) ||
      (ord.shippingCity && ord.shippingCity.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

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
            <div style={{ backgroundColor: '#e60012', color: '#fff', padding: '6px 8px', fontWeight: '900', fontSize: '1.1rem', lineHeight: 1 }}>UNI<br/>QLO</div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                HỆ THỐNG QUẢN TRỊ TOÀN DIỆN (ADMIN CMS)
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '2px' }}>
                Tổng quan doanh thu, danh mục hàng hóa, nhân sự và đơn hàng toàn quốc
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => onNavigate('staff')} className="btn-uq btn-uq-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Mở Staff POS Portal
            </button>
            <button onClick={() => onNavigate('home')} className="btn-uq btn-uq-outline-gray" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#fff', borderColor: '#444' }}>
              Về Storefront
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
          {[
            { id: 'overview', label: '1. Tổng Quan Doanh Thu & KPI', icon: <TrendingUp size={16} /> },
            { id: 'products', label: `2. Quản Lý Sản Phẩm (${products.length})`, icon: <ShoppingBag size={16} /> },
            { id: 'orders', label: `3. Toàn Bộ Đơn Hàng (${orders.length})`, icon: <Package size={16} /> },
            { id: 'users', label: `4. Phân Quyền Nhân Sự & User (${usersList.length})`, icon: <Users size={16} /> },
            { id: 'coupons', label: `5. Mã Khuyến Mãi (${coupons.length})`, icon: <Tag size={16} /> },
            { id: 'bank-config', label: '6. Cấu Hình VietQR Nhận Tiền', icon: <QrCode size={16} /> },
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
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>TỔNG DOANH THU HỆ THỐNG</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#e60012', marginTop: '6px' }}>
                  {formatPrice(stats?.totalRevenue || 0)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#00875a', marginTop: '4px', fontWeight: '700' }}>
                  ↑ +18.5% so với cùng kỳ tháng trước
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>TỔNG SỐ ĐƠN HÀNG</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111', marginTop: '6px' }}>
                  {stats?.totalOrders || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                  Bao gồm đơn Online & POS tại quầy
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>TỔNG KHÁCH HÀNG & USER</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#111', marginTop: '6px' }}>
                  {stats?.totalCustomers || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#00875a', marginTop: '4px', fontWeight: '700' }}>
                  100% tài khoản đã kích hoạt
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', textTransform: 'uppercase' }}>CẢNH BÁO TỒN KHO THẤP</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffab00', marginTop: '6px' }}>
                  {stats?.lowStockItemsCount || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                  Biến thể cần nhập bổ sung
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
                      Biểu Đồ Doanh Thu 7 Ngày Gần Nhất
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                      Thống kê doanh thu bán hàng & số lượng đơn qua từng ngày
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#fff0f0', color: '#e60012', padding: '3px 8px', borderRadius: '3px', border: '1px solid #ffd0d0' }}>
                      Tổng 7 ngày: {formatPrice(stats?.revenueLast7Days?.reduce((s, d) => s + (Number(d.revenue) || 0), 0) || 0)}
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
                      {/* Subtle background guides */}
                      <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '1px', borderTop: '1px dashed #e0e0e0', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '1px', borderTop: '1px dashed #e0e0e0', pointerEvents: 'none' }} />

                      {stats?.revenueLast7Days?.map((d, idx) => {
                        const isToday = idx === (stats.revenueLast7Days.length - 1);
                        const rev = Number(d.revenue) || 0;
                        const barHeight = Math.max(Math.round((rev / max7DayRevenue) * 115), 10);
                        const formattedShortRev = rev >= 1000000 ? `${(rev / 1000000).toFixed(1)}Tr` : `${Math.round(rev / 1000)}k`;

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
                            title={`📅 Ngày ${d.date}\n💰 Doanh thu: ${formatPrice(rev)}\n📦 Số đơn: ${d.orderCount || 0} đơn`}
                          >
                            {/* Value label on top of bar */}
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              color: isToday ? '#e60012' : '#444',
                              marginBottom: '6px',
                              whiteSpace: 'nowrap'
                            }}>
                              {formattedShortRev}
                            </span>

                            {/* Bar Column */}
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

                            {/* Date label below bar */}
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
                                {d.orderCount || 0} đơn
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
                  Cửa Hàng BEO Modern Fashion & Vận Hành
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#111' }}>BEO Modern Fashion Showroom</strong>
                      <span className="badge-uq red">FLAGSHIP STORE</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5, marginBottom: '8px' }}>
                      📍 209 Đường 30 Tháng 4, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>📞 Hotline: <strong>1900019199999</strong></span>
                      <span>💬 Zalo: <strong>0567740000</strong></span>
                      <span>⏰ Mở cửa: <strong>08:00 - 22:00</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '14px', backgroundColor: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#e60012', textTransform: 'uppercase' }}>DOANH THU CỬA HÀNG</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#e60012', marginTop: '4px' }}>
                        {formatPrice(stats?.totalRevenue || 0)}
                      </div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>ĐƠN HÀNG ĐÃ XỬ LÝ</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0284c7', marginTop: '4px' }}>
                        {stats?.totalOrders || 0} Đơn
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS CRUD ================= */}
        {activeTab === 'products' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>Danh Sách Sản Phẩm ({products.length})</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Quản lý danh mục, giá bán và ma trận biến thể</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => exportProductsToExcel(products)}
                  className="btn-uq btn-uq-outline-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Download size={15} />
                  <span>Xuất Excel Sản Phẩm</span>
                </button>
                <button onClick={handleOpenCreateProduct} className="btn-uq btn-uq-red">
                  <Plus size={16} />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>ẢNH / TÊN</th>
                  <th style={{ padding: '10px' }}>MÃ SP</th>
                  <th style={{ padding: '10px' }}>GIỚI TÍNH</th>
                  <th style={{ padding: '10px' }}>BST</th>
                  <th style={{ padding: '10px' }}>GIÁ NIÊM YẾT</th>
                  <th style={{ padding: '10px' }}>SỐ BIẾN THỂ</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={prod.primaryImageUrl} alt={prod.name} style={{ width: '40px', height: '48px', objectFit: 'cover' }} />
                        <strong>{prod.name}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{prod.code}</td>
                    <td style={{ padding: '10px' }}>{prod.gender}</td>
                    <td style={{ padding: '10px' }}>{prod.collection || 'LifeWear'}</td>
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
                          className="btn-uq btn-uq-outline-gray"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit2 size={12} />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(prod.id)}
                          style={{ color: '#d9383a', padding: '4px 8px', cursor: 'pointer', border: '1px solid #ffcdd2', backgroundColor: '#fff5f5' }}
                          title="Ngừng bán / Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 3: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.15rem', textTransform: 'uppercase', color: '#111' }}>
                  Quản Lý Toàn Bộ Đơn Hàng ({filteredOrders.length} / {orders.length} đơn)
                </div>
                <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '2px' }}>
                  Theo dõi, lọc phân loại trạng thái và chuyển bước xử lý đơn hàng toàn hệ thống
                </div>
              </div>

              {/* Status Classifier Dropdown - Exact styling matching user requirement */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={16} color="#e60012" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#111' }}>
                    Phân Loại Trạng Thái:
                  </span>
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  style={{
                    padding: '9px 14px',
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
                  <option value="ALL">TẤT CẢ TRẠNG THÁI (Toàn bộ {orders.length} đơn)</option>
                  <option value="PENDING">PENDING (Chờ xác nhận)</option>
                  <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
                  <option value="PACKING">PACKING (Đang đóng gói)</option>
                  <option value="SHIPPING">SHIPPING (Đang giao hàng)</option>
                  <option value="DELIVERED">DELIVERED (Đã giao thành công)</option>
                  <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
                  <option value="CANCELLED">CANCELLED (Hủy đơn & hoàn kho)</option>
                </select>

                <button
                  onClick={() => exportOrdersToExcel(filteredOrders)}
                  className="btn-uq btn-uq-outline-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '9px 14px' }}
                >
                  <Download size={15} />
                  <span>Xuất Excel ({filteredOrders.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Status Chips / Count Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid #eee' }}>
              {[
                { id: 'ALL', label: 'Tất cả', count: orders.length, color: '#111' },
                { id: 'PENDING', label: 'Chờ xác nhận', count: orders.filter((o) => o.status === 'PENDING').length, color: '#f57c00' },
                { id: 'CONFIRMED', label: 'Đã xác nhận', count: orders.filter((o) => o.status === 'CONFIRMED').length, color: '#00875a' },
                { id: 'PACKING', label: 'Đang đóng gói', count: orders.filter((o) => o.status === 'PACKING').length, color: '#0052cc' },
                { id: 'SHIPPING', label: 'Đang giao hàng', count: orders.filter((o) => o.status === 'SHIPPING').length, color: '#6554c0' },
                { id: 'DELIVERED', label: 'Đã giao thành công', count: orders.filter((o) => o.status === 'DELIVERED').length, color: '#00875a' },
                { id: 'COMPLETED', label: 'Hoàn tất', count: orders.filter((o) => o.status === 'COMPLETED').length, color: '#2e7d32' },
                { id: 'CANCELLED', label: 'Hủy đơn', count: orders.filter((o) => o.status === 'CANCELLED').length, color: '#e60012' }
              ].map((chip) => {
                const isSelected = orderStatusFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setOrderStatusFilter(chip.id)}
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
                placeholder="Tìm kiếm theo mã đơn (UQ-...), tên khách hàng, số điện thoại, tỉnh thành..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem' }}
              />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery('')}
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
                  Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                  Thử chọn trạng thái "TẤT CẢ TRẠNG THÁI" hoặc xóa từ khóa tìm kiếm.
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px' }}>MÃ ĐƠN</th>
                    <th style={{ padding: '10px' }}>KHÁCH HÀNG</th>
                    <th style={{ padding: '10px' }}>CHI NHÁNH</th>
                    <th style={{ padding: '10px' }}>LOẠI ĐƠN</th>
                    <th style={{ padding: '10px' }}>TỔNG TIỀN</th>
                    <th style={{ padding: '10px' }}>TRẠNG THÁI</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
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
                        <span className="badge-uq gray" style={{ fontSize: '0.72rem' }}>{ord.orderType}</span>
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
                          <option value="PENDING">PENDING (Chờ xác nhận)</option>
                          <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
                          <option value="PACKING">PACKING (Đang đóng gói)</option>
                          <option value="SHIPPING">SHIPPING (Đang giao hàng)</option>
                          <option value="DELIVERED">DELIVERED (Đã giao thành công)</option>
                          <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
                          <option value="CANCELLED">CANCELLED (Hủy đơn & hoàn kho)</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setReceiptOrder(ord)}
                            className="btn-uq btn-uq-outline-gray"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Printer size={12} />
                            <span>Hóa đơn</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ================= TAB 4: USERS & ROLES ================= */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '20px' }}>
              Quản Lý Người Dùng & Phân Quyền Hệ Thống
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>HỌ VÀ TÊN</th>
                  <th style={{ padding: '10px' }}>EMAIL</th>
                  <th style={{ padding: '10px' }}>SỐ ĐIỆN THOẠI</th>
                  <th style={{ padding: '10px' }}>VAI TRÒ HIỆN TẠI</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>CHUYỂN PHÂN QUYỀN</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '700' }}>{u.fullName}</td>
                    <td style={{ padding: '10px' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>{u.phone || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge-uq red">{u.role}</span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                        style={{ padding: '4px 8px', border: '1px solid #ccc', fontSize: '0.8rem', outline: 'none' }}
                      >
                        <option value="ROLE_CUSTOMER">ROLE_CUSTOMER (Khách hàng)</option>
                        <option value="ROLE_STAFF_MANAGER">ROLE_STAFF_MANAGER (Quản lý chi nhánh)</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN (Quản trị viên Admin)</option>
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
                  Quản Lý Mã Giảm Giá & Số Lượng Khuyến Mãi
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
                  Thiết lập giới hạn số lượng mã, theo dõi tỷ lệ đã sử dụng và số lượng còn lại
                </div>
              </div>
              <button onClick={handleOpenCreateCoupon} className="btn-uq btn-uq-red">
                <Plus size={16} />
                <span>Tạo Mã Mới</span>
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>MÃ VOUCHER</th>
                  <th style={{ padding: '10px' }}>MÔ TẢ</th>
                  <th style={{ padding: '10px' }}>MỨC GIẢM</th>
                  <th style={{ padding: '10px' }}>ĐƠN TỐI THIỂU</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>TỔNG SỐ LƯỢNG</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>ĐÃ DÙNG</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>SỐ LƯỢNG CÒN LẠI</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>THAO TÁC</th>
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
                        {c.discountType === 'PERCENT' ? `${c.discountValue}% (Tối đa ${formatPrice(c.maxDiscountAmount || 100000)})` : formatPrice(c.discountValue)}
                      </td>
                      <td style={{ padding: '10px' }}>{formatPrice(c.minOrderAmount || 0)}</td>
                      
                      {/* Total Usage Limit */}
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: '800', fontSize: '0.95rem' }}>
                        {limit.toLocaleString('vi-VN')} mã
                      </td>

                      {/* Used Count with Mini Progress */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontWeight: '700' }}>{used.toLocaleString('vi-VN')} lượt</div>
                        <div style={{ width: '80px', height: '4px', backgroundColor: '#e0e0e0', margin: '4px auto 0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${usagePercent}%`, height: '100%', backgroundColor: usagePercent > 90 ? '#e60012' : '#0052cc' }} />
                        </div>
                      </td>

                      {/* Remaining Count */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {isOutOfStock ? (
                          <span className="badge-uq red" style={{ fontWeight: '800' }}>HẾT MÃ (0)</span>
                        ) : remaining <= 10 ? (
                          <span className="badge-uq red" style={{ fontWeight: '800' }}>Sắp hết ({remaining})</span>
                        ) : (
                          <span className="badge-uq gray" style={{ color: '#00875a', fontWeight: '800' }}>
                            {remaining.toLocaleString('vi-VN')} mã
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {isOutOfStock ? (
                          <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600' }}>Hết lượt dùng</span>
                        ) : c.active ? (
                          <span className="badge-uq gray" style={{ color: '#00875a' }}>Đang mở</span>
                        ) : (
                          <span className="badge-uq red">Đã tắt</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditCoupon(c)}
                            className="btn-uq btn-uq-outline-gray"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Chỉnh sửa số lượng / mã"
                          >
                            <Edit2 size={12} />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => setDeleteCouponId(c.id)}
                            style={{ color: '#d9383a', padding: '4px 8px', cursor: 'pointer', border: '1px solid #ffcdd2', backgroundColor: '#fff5f5' }}
                            title="Xóa mã khuyến mãi"
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
                Cấu Hình Tài Khoản Nhận Tiền VietQR (Napas247)
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '24px' }}>
              Tất cả mã QR thanh toán sinh ra tại trang Checkout và In-Store POS sẽ tự động khớp theo cấu hình ngân hàng bên dưới.
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
                    Mã Ngân Hàng (Bank ID theo chuẩn VietQR) *
                  </label>
                  <select
                    value={bankConfig.bankId}
                    onChange={(e) => {
                      const bankMap = {
                        'vietinbank': 'VietinBank (Ngân hàng TMCP Công Thương Việt Nam)',
                        'vcb': 'Vietcombank (Ngân hàng TMCP Ngoại Thương Việt Nam)',
                        'mbbank': 'MB Bank (Ngân hàng TMCP Quân Đội)',
                        'techcombank': 'Techcombank (Ngân hàng TMCP Kỹ Thương Việt Nam)',
                        'acb': 'ACB (Ngân hàng TMCP Á Châu)',
                        'tpbank': 'TPBank (Ngân hàng TMCP Tiên Phong)',
                        'vpbank': 'VPBank (Ngân hàng TMCP Việt Nam Thịnh Vượng)',
                        'bidv': 'BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam)',
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
                    Tên đầy đủ Ngân hàng *
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
                    Số Tài Khoản Nhận Tiền *
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
                    Tên Chủ Tài Khoản (In hoa không dấu) *
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
                    Mẫu Giao Diện VietQR (Template)
                  </label>
                  <select
                    value={bankConfig.template || 'compact2'}
                    onChange={(e) => setBankConfig({ ...bankConfig, template: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                  >
                    <option value="compact2">Compact 2 (Gọn gàng kèm logo & số tiền - Khuyên dùng)</option>
                    <option value="compact">Compact (Đầy đủ thông tin khung viền)</option>
                    <option value="qr_only">QR Only (Chỉ hình mã QR)</option>
                    <option value="print">Print (Khổ in hóa đơn POS nhiệt)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingBankConfig}
                  className="btn-uq btn-uq-red"
                  style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
                >
                  <Save size={16} />
                  <span>{savingBankConfig ? 'Đang lưu...' : 'Lưu Cấu Hình Ngân Hàng'}</span>
                </button>
              </form>

              {/* Right: Live VietQR Preview */}
              <div style={{ backgroundColor: '#fafafa', border: '1px solid #eee', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '14px', color: '#111' }}>
                  XEM TRƯỚC MẪU MÃ QR TỰ ĐỘNG
                </div>

                <img
                  src={`https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-${bankConfig.template || 'compact2'}.png?amount=599000&addInfo=Thanh+toan+don+hang+UQ-TEST&accountName=${encodeURIComponent(bankConfig.accountName)}`}
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
                  <div>• Ngân hàng: <strong>{bankConfig.bankName}</strong></div>
                  <div>• STK: <strong style={{ fontFamily: 'monospace' }}>{bankConfig.accountNo}</strong></div>
                  <div>• Chủ TK: <strong>{bankConfig.accountName}</strong></div>
                  <div>• Cú pháp tự động: <code style={{ color: '#0052cc' }}>Thanh toan don hang [MÃ_ĐƠN]</code></div>
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
                  Thêm Sản Phẩm Mới & Tạo Ma Trận Biến Thể
                </div>
                <button onClick={() => setIsProductModalOpen(false)}><X size={22} /></button>
              </div>

              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Tên sản phẩm *</label>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Mã sản phẩm *</label>
                    <input
                      type="text"
                      required
                      value={prodFormCode}
                      onChange={(e) => setProdFormCode(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Giá niêm yết (VND) *</label>
                    <input
                      type="number"
                      required
                      value={prodFormPrice}
                      onChange={(e) => setProdFormPrice(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Giá khuyến mãi (Tùy chọn)</label>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Giới tính *</label>
                    <select
                      value={prodFormGender}
                      onChange={(e) => setProdFormGender(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    >
                      <option value="MEN">Nam (MEN)</option>
                      <option value="WOMEN">Nữ (WOMEN)</option>
                      <option value="KIDS">Trẻ em (KIDS)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Bộ sưu tập *</label>
                    <input
                      type="text"
                      value={prodFormCollection}
                      onChange={(e) => setProdFormCollection(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Chất liệu *</label>
                    <input
                      type="text"
                      value={prodFormMaterial}
                      onChange={(e) => setProdFormMaterial(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>URL hình ảnh đại diện *</label>
                  <input
                    type="url"
                    required
                    value={prodFormImage}
                    onChange={(e) => setProdFormImage(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                {/* Variant Matrix Checkboxes */}
                <div style={{ backgroundColor: '#fafafa', padding: '14px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px' }}>
                    MA TRẬN BIẾN THỂ TỰ ĐỘNG (VARIANT MATRIX GENERATOR):
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px' }}>
                    Hệ thống sẽ tự động tạo {selectedColorsForMatrix.length * selectedSizesForMatrix.length} SKU và gán mã vạch:
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Màu sắc: </span>
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
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Kích cỡ: </span>
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

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-uq btn-uq-outline-gray" style={{ padding: '10px 18px' }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-uq btn-uq-red" style={{ padding: '10px 24px' }}>
                    Lưu & Khởi Tạo Biến Thể
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
                  {editingCoupon ? `Chỉnh Sửa Mã: ${editingCoupon.code}` : 'Tạo Mã Giảm Giá Mới'}
                </div>
                <button onClick={() => setIsCouponModalOpen(false)} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Mã Voucher *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: BEO20, SUMMER50K..."
                    value={coupCode}
                    onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontWeight: '700', letterSpacing: '1px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Mô tả khuyến mãi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Giảm giá 10% đơn từ 300.000đ"
                    value={coupDesc}
                    onChange={(e) => setCoupDesc(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Loại giảm</label>
                    <select
                      value={coupType}
                      onChange={(e) => setCoupType(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                      <option value="PERCENT">Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {coupType === 'PERCENT' ? 'Giá trị giảm (%) *' : 'Số tiền giảm (VND) *'}
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Đơn hàng tối thiểu (VND)</label>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Giảm tối đa (VND)</label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      placeholder="Không giới hạn"
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
                    🏷️ SỐ LƯỢNG MÃ KHUYẾN MÃI (LƯỢT SỬ DỤNG TỐI ĐA) *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="VD: 100, 500, 1000..."
                      value={coupLimit}
                      onChange={(e) => setCoupLimit(e.target.value)}
                      style={{ width: '160px', padding: '9px 12px', border: '1px solid #ccc', outline: 'none', fontWeight: '800', fontSize: '1rem', color: '#111' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {editingCoupon ? `Đã sử dụng: ${editingCoupon.usedCount || 0} lượt` : 'Số lượng mã phát hành cho khách hàng'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
                  <button type="button" onClick={() => setIsCouponModalOpen(false)} className="btn-uq btn-uq-outline-gray" style={{ padding: '9px 18px' }}>
                    Hủy Bỏ
                  </button>
                  <button type="submit" className="btn-uq btn-uq-red" style={{ padding: '9px 24px', fontWeight: '800' }}>
                    {editingCoupon ? 'Cập Nhật Mã Giảm Giá' : 'Tạo Mã Khuyến Mãi'}
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
          title="Ngừng kinh doanh sản phẩm"
          message="Bạn có chắc chắn muốn ngưng kinh doanh sản phẩm này? Sản phẩm sẽ bị ẩn khỏi trang bán hàng trực tuyến của khách hàng."
          confirmText="Đồng ý ngưng bán"
          cancelText="Hủy bỏ"
          isDanger={true}
          onConfirm={confirmDeleteProduct}
          onCancel={() => setDeleteConfirmId(null)}
        />

        {/* Delete Coupon Confirm Modal */}
        <ConfirmModal
          isOpen={!!deleteCouponId}
          title="Xóa Mã Khuyến Mãi"
          message="Bạn có chắc chắn muốn xóa mã giảm giá này? Mã sẽ không còn hiệu lực đối với các đơn hàng tiếp theo."
          confirmText="Đồng ý xóa"
          cancelText="Hủy bỏ"
          isDanger={true}
          onConfirm={() => handleDeleteCoupon(deleteCouponId)}
          onCancel={() => setDeleteCouponId(null)}
        />
      </div>
    </div>
  );
};
