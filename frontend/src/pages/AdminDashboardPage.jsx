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
  Save
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { ConfirmModal } from '../components/ConfirmModal';
import api from '../services/api';

export const AdminDashboardPage = ({ onNavigate }) => {
  const { formatPrice } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'orders', 'users', 'coupons'
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

  // Coupon Create Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [coupCode, setCoupCode] = useState('');
  const [coupDesc, setCoupDesc] = useState('');
  const [coupType, setCoupType] = useState('PERCENT');
  const [coupVal, setCoupVal] = useState(10);
  const [coupMin, setCoupMin] = useState(300000);
  const [coupMax, setCoupMax] = useState(100000);

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

  // --- COUPON CREATE ---
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        code: coupCode.toUpperCase(),
        description: coupDesc,
        discountType: coupType,
        discountValue: Number(coupVal),
        minOrderAmount: Number(coupMin),
        maxDiscountAmount: Number(coupMax),
        usageLimit: 1000,
        active: true
      });
      showSuccess('Tạo mã khuyến mãi thành công!');
      setIsCouponModalOpen(false);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Lỗi khi tạo coupon');
    }
  };

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
              onClick={() => setActiveTab(tab.id)}
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
              <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
                <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '20px' }}>
                  Biểu Đồ Doanh Thu 7 Ngày Gần Nhất
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', borderBottom: '1px solid #eee' }}>
                  {stats?.revenueLast7Days?.map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '40px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: `${Math.max((d.revenue / 5000000) * 120, 20)}px`,
                          backgroundColor: idx === 6 ? '#e60012' : '#111',
                          transition: 'height 0.3s'
                        }}
                        title={`${d.date}: ${formatPrice(d.revenue)}`}
                      />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{d.date}</span>
                    </div>
                  ))}
                </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>Danh Sách Sản Phẩm</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Quản lý danh mục, giá bán và ma trận biến thể</div>
              </div>
              <button onClick={handleOpenCreateProduct} className="btn-uq btn-uq-red">
                <Plus size={16} />
                <span>Thêm Sản Phẩm Mới</span>
              </button>
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
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '20px' }}>
              Quản Lý Toàn Bộ Đơn Hàng Hệ Thống
            </div>

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
                {orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '800' }}>{ord.orderNumber}</td>
                    <td style={{ padding: '10px' }}>
                      <div>{ord.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{ord.customerPhone}</div>
                    </td>
                    <td style={{ padding: '10px' }}>{ord.storeName || 'Online'}</td>
                    <td style={{ padding: '10px' }}>{ord.orderType}</td>
                    <td style={{ padding: '10px', fontWeight: '800', color: '#e60012' }}>{formatPrice(ord.finalAmount)}</td>
                    <td style={{ padding: '10px' }}>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateAdminOrderStatus(ord.id, e.target.value)}
                        style={{
                          padding: '6px 8px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          border: ord.status === 'CANCELLED' ? '1px solid #ffcdd2' : '1px solid #ccc',
                          backgroundColor: ord.status === 'CANCELLED' ? '#fff0f0' : '#ffffff',
                          color: ord.status === 'CANCELLED' ? '#e60012' : '#111',
                          outline: 'none',
                          cursor: 'pointer'
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
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          <Printer size={12} /> Hóa đơn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
                Danh Sách Mã Giảm Giá & Khuyến Mãi
              </div>
              <button onClick={() => setIsCouponModalOpen(true)} className="btn-uq btn-uq-red">
                <Plus size={16} />
                <span>Tạo Mã Mới</span>
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>MÃ VOUCHER</th>
                  <th style={{ padding: '10px' }}>MÔ TẢ</th>
                  <th style={{ padding: '10px' }}>LOẠI GIẢM</th>
                  <th style={{ padding: '10px' }}>GIÁ TRỊ GIẢM</th>
                  <th style={{ padding: '10px' }}>ĐƠN TỐI THIỂU</th>
                  <th style={{ padding: '10px' }}>ĐÃ DÙNG</th>
                  <th style={{ padding: '10px' }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '900', color: '#e60012' }}>{c.code}</td>
                    <td style={{ padding: '10px' }}>{c.description}</td>
                    <td style={{ padding: '10px' }}>{c.discountType}</td>
                    <td style={{ padding: '10px', fontWeight: '700' }}>
                      {c.discountType === 'PERCENT' ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                    </td>
                    <td style={{ padding: '10px' }}>{formatPrice(c.minOrderAmount || 0)}</td>
                    <td style={{ padding: '10px' }}>{c.usedCount} lượt</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge-uq gray" style={{ color: '#00875a' }}>Đang hoạt động</span>
                    </td>
                  </tr>
                ))}
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

        {/* Modal: Create Coupon */}
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
            <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#fff', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Tạo Mã Giảm Giá Mới</div>
                <button onClick={() => setIsCouponModalOpen(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Mã Voucher *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: FLASH50"
                    value={coupCode}
                    onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', outline: 'none' }}
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
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Loại giảm</label>
                    <select
                      value={coupType}
                      onChange={(e) => setCoupType(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', outline: 'none' }}
                    >
                      <option value="PERCENT">Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Giá trị giảm *</label>
                    <input
                      type="number"
                      required
                      value={coupVal}
                      onChange={(e) => setCoupVal(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsCouponModalOpen(false)} className="btn-uq btn-uq-outline-gray" style={{ padding: '8px 14px' }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-uq btn-uq-red" style={{ padding: '8px 18px' }}>
                    Tạo Coupon
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
      </div>
    </div>
  );
};
