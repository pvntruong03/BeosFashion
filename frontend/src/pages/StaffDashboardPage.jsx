import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Package,
  Boxes,
  Truck,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowRightLeft,
  Edit2,
  X,
  Tag,
  Save,
  Printer,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { ConfirmModal } from '../components/ConfirmModal';
import api from '../services/api';

export const StaffDashboardPage = ({ onNavigate }) => {
  const { user, isStaff, isAdmin } = useAuth();
  const { formatPrice, lang } = useLanguage();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const hash = window.location.hash || '';
      if (hash.includes('tab=')) {
        const queryPart = hash.split('?')[1];
        const params = new URLSearchParams(queryPart);
        const tab = params.get('tab');
        if (tab) return tab;
      }
      return localStorage.getItem('beo_staff_active_tab') || 'products';
    } catch (e) {
      return 'products';
    }
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('beo_staff_active_tab', tabId);
    const newHash = `#/staff?tab=${tabId}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  };
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Store Products State
  const [posProducts, setPosProducts] = useState([]);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Fulfillment State & Filters
  const [storeOrders, setStoreOrders] = useState([]);
  const [staffOrderStatusFilter, setStaffOrderStatusFilter] = useState('ALL');
  const [staffOrderSearch, setStaffOrderSearch] = useState('');
  const [staffOrdersPage, setStaffOrdersPage] = useState(1);
  const [staffOrdersPerPage, setStaffOrdersPerPage] = useState(20);

  // Inventory State & Pagination
  const [inventoryList, setInventoryList] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPerPage, setInventoryPerPage] = useState(20);
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [newStockQty, setNewStockQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Routine Physical Inventory');

  // Transfers State
  const [transfers, setTransfers] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [transferVariantId, setTransferVariantId] = useState('');
  const [transferFromStoreId, setTransferFromStoreId] = useState(4);
  const [transferQty, setTransferQty] = useState(20);
  const [transferReason, setTransferReason] = useState('Restock Best Sellers');

  // Daily report State
  const [dailyReport, setDailyReport] = useState(null);

  // Store Manager Product Management State & Pagination
  const [categories, setCategories] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCode, setProdFormCode] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState(399000);
  const [prodFormSalePrice, setProdFormSalePrice] = useState('');
  const [prodFormCategoryId, setProdFormCategoryId] = useState(1);
  const [prodFormGender, setProdFormGender] = useState('MEN');
  const [prodFormCollection, setProdFormCollection] = useState('LifeWear Essentials');
  const [prodFormMaterial, setProdFormMaterial] = useState('100% Supima Cotton');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormImage, setProdFormImage] = useState('');
  const [prodFormFeatured, setProdFormFeatured] = useState(true);
  const [prodFormNew, setProdFormNew] = useState(true);
  const [selectedColorsForMatrix, setSelectedColorsForMatrix] = useState(['09 BLACK', '00 WHITE']);
  const [selectedSizesForMatrix, setSelectedSizesForMatrix] = useState(['S', 'M', 'L', 'XL']);
  const [managerProdSearch, setManagerProdSearch] = useState('');
  const [staffProductsPage, setStaffProductsPage] = useState(1);
  const [staffProductsPerPage, setStaffProductsPerPage] = useState(20);

  const fetchStaffData = useCallback(async () => {
    setLoading(true);
    try {
      const [resStore, resProducts, resOrders, resInvs, resTrans, resReport, resAllStores, resCats] = await Promise.all([
        api.get('/staff/store-info'),
        api.get('/products?sizePerPage=100'),
        api.get('/staff/orders'),
        api.get('/staff/inventory'),
        api.get('/staff/transfers'),
        api.get('/staff/reports/daily'),
        api.get('/stores'),
        api.get('/categories'),
      ]);

      if (resStore.data) setStoreInfo(resStore.data);
      if (resProducts.data) setPosProducts(resProducts.data.content || []);
      if (resOrders.data) setStoreOrders(resOrders.data);
      if (resInvs.data) setInventoryList(resInvs.data);
      if (resTrans.data) setTransfers(resTrans.data);
      if (resReport.data) setDailyReport(resReport.data);
      if (resAllStores.data) setAllStores(resAllStores.data);
      if (resCats.data) setCategories(resCats.data);
    } catch (err) {
      console.error('Error loading staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // --- STORE MANAGER PRODUCT CRUD HANDLERS ---
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdFormName('');
    setProdFormCode('UQ-' + Math.floor(100000 + Math.random() * 900000));
    setProdFormPrice(399000);
    setProdFormSalePrice('');
    setProdFormCategoryId(categories[0]?.id || 1);
    setProdFormGender('MEN');
    setProdFormCollection('LifeWear Essentials');
    setProdFormMaterial('100% Supima Cotton');
    setProdFormDesc('Precision engineered Japanese LifeWear delivering supreme comfort and longevity.');
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
    setProdFormMaterial(prod.material || '100% Supima Cotton');
    setProdFormDesc(prod.description || '');
    setProdFormImage(prod.primaryImageUrl || '');
    setProdFormFeatured(prod.featured || false);
    setProdFormNew(prod.new || false);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
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
        showSuccess(lang === 'vi' ? 'Cập nhật sản phẩm thành công!' : 'Product updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        showSuccess(lang === 'vi' ? 'Tạo mới sản phẩm với ma trận biến thể thành công!' : 'Created new product with full variant matrix!');
      }

      setIsProductModalOpen(false);
      fetchStaffData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi lưu sản phẩm' : 'Failed to save product'));
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/admin/products/${deleteConfirmId}`);
      showSuccess(lang === 'vi' ? 'Đã cập nhật trạng thái sản phẩm thành công' : 'Product status updated successfully');
      setDeleteConfirmId(null);
      fetchStaffData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi xóa/ngừng bán sản phẩm' : 'Failed to deactivate product'));
      setDeleteConfirmId(null);
    }
  };

  // --- ORDER FULFILLMENT LOGIC ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/staff/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Updated by ${user.fullName} (${user.role})`
      });
      showSuccess(lang === 'vi' ? `Đã chuyển trạng thái đơn sang ${newStatus}` : `Order transitioned to ${newStatus}`);
      fetchStaffData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi cập nhật trạng thái' : 'Failed to update order status'));
    }
  };

  // --- INVENTORY ADJUST LOGIC ---
  const handleConfirmStockAdjust = async () => {
    if (!adjustModalItem) return;
    try {
      await api.put('/staff/inventory/adjust', {
        variantId: adjustModalItem.id,
        newQuantity: Number(newStockQty),
        reason: adjustReason
      });
      showSuccess(lang === 'vi' ? 'Đã cập nhật tồn kho chi nhánh thành công' : 'Store inventory updated successfully');
      setAdjustModalItem(null);
      fetchStaffData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi cập nhật tồn kho' : 'Failed to adjust inventory'));
    }
  };

  // --- STOCK TRANSFER LOGIC ---
  const handleCreateTransferRequest = async (e) => {
    e.preventDefault();
    if (!transferVariantId) {
      showError(lang === 'vi' ? 'Vui lòng chọn sản phẩm cần điều chuyển' : 'Please select a variant to transfer');
      return;
    }

    try {
      await api.post('/staff/transfers', {
        fromStoreId: Number(transferFromStoreId),
        toStoreId: storeInfo?.id,
        variantId: Number(transferVariantId),
        quantity: Number(transferQty),
        reason: transferReason
      });
      showSuccess(lang === 'vi' ? 'Đã gửi yêu cầu điều chuyển hàng thành công!' : 'Stock transfer request submitted successfully!');
      fetchStaffData();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi gửi yêu cầu điều chuyển' : 'Failed to request stock transfer'));
    }
  };

  const filteredStoreOrders = storeOrders.filter((ord) => {
    const matchesStatus = staffOrderStatusFilter === 'ALL' || ord.status === staffOrderStatusFilter;
    const q = staffOrderSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(q)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.includes(q)) ||
      (ord.shippingAddress && ord.shippingAddress.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const totalStaffOrdersCount = filteredStoreOrders.length;
  const totalStaffOrderPages = Math.max(1, Math.ceil(totalStaffOrdersCount / staffOrdersPerPage));
  const currentStaffOrdersPage = Math.min(Math.max(1, staffOrdersPage), totalStaffOrderPages);
  const paginatedStoreOrders = filteredStoreOrders.slice(
    (currentStaffOrdersPage - 1) * staffOrdersPerPage,
    currentStaffOrdersPage * staffOrdersPerPage
  );

  // Store Manager Products Pagination
  const filteredManagerProducts = (posProducts || []).filter(
    (p) => !managerProdSearch || p.name.toLowerCase().includes(managerProdSearch.toLowerCase()) || p.code.toLowerCase().includes(managerProdSearch.toLowerCase())
  );
  const totalStaffProductsCount = filteredManagerProducts.length;
  const totalStaffProductPages = Math.max(1, Math.ceil(totalStaffProductsCount / staffProductsPerPage));
  const currentStaffProductsPage = Math.min(Math.max(1, staffProductsPage), totalStaffProductPages);
  const paginatedStaffProducts = filteredManagerProducts.slice(
    (currentStaffProductsPage - 1) * staffProductsPerPage,
    currentStaffProductsPage * staffProductsPerPage
  );

  // Store Manager Inventory Pagination
  const filteredInventory = (inventoryList || []).filter(
    (v) => !inventorySearch || v.sku.toLowerCase().includes(inventorySearch.toLowerCase()) || v.colorName.toLowerCase().includes(inventorySearch.toLowerCase())
  );
  const totalInventoryCount = filteredInventory.length;
  const totalInventoryPages = Math.max(1, Math.ceil(totalInventoryCount / inventoryPerPage));
  const currentInventoryPage = Math.min(Math.max(1, inventoryPage), totalInventoryPages);
  const paginatedInventory = filteredInventory.slice(
    (currentInventoryPage - 1) * inventoryPerPage,
    currentInventoryPage * inventoryPerPage
  );

  return (
    <div style={{ backgroundColor: '#f4f5f7', minHeight: 'calc(100vh - 70px)', padding: '24px 0' }}>
      <div className="container">
        {/* Staff Store Header Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ backgroundColor: '#e60012', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={26} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                  {storeInfo?.name || 'BEO STORE FLAGSHIP'}
                </h1>
                <span className="badge-uq red">{user?.role}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>
                {lang === 'vi' ? 'Cửa hàng:' : 'Store:'} <strong>{storeInfo?.address || '209 30th April Street, Xuan Khanh, Can Tho City'}</strong> | {lang === 'vi' ? 'Quản lý:' : 'Manager:'} <strong>{user?.fullName}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onNavigate('home')}
              className="btn-uq btn-uq-outline-gray"
              style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#fff', borderColor: '#444' }}
            >
              {lang === 'vi' ? 'Về Storefront' : 'Storefront'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
          {[
            { id: 'products', label: lang === 'vi' ? `1. Quản Lý Sản Phẩm (${posProducts.length})` : `1. Products Catalog (${posProducts.length})`, icon: <Tag size={16} /> },
            { id: 'fulfillment', label: lang === 'vi' ? `2. Xử Lý Đơn Hàng (${storeOrders.length})` : `2. Order Fulfillment (${storeOrders.length})`, icon: <Package size={16} /> },
            { id: 'inventory', label: lang === 'vi' ? `3. Quản Lý Kho Hàng (${inventoryList.length})` : `3. Store Inventory (${inventoryList.length})`, icon: <Boxes size={16} /> },
            { id: 'report', label: lang === 'vi' ? '4. Báo Cáo Doanh Thu' : '4. Sales & Shift Report', icon: <FileText size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                fontSize: '0.85rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                border: activeTab === tab.id ? '2px solid #111' : '1px solid #ddd',
                backgroundColor: activeTab === tab.id ? '#111' : '#fff',
                color: activeTab === tab.id ? '#fff' : '#333',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ================= TAB 2: ORDER FULFILLMENT ================= */}
        {activeTab === 'fulfillment' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.15rem', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? `Hàng Đợi Xử Lý Đơn Hàng (${filteredStoreOrders.length} / ${storeOrders.length} đơn)` : `Store Order Fulfillment Queue (${filteredStoreOrders.length} / ${storeOrders.length})`}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '2px' }}>
                  {lang === 'vi' ? `Đơn hàng cần tiếp nhận và phân bổ tại showroom ${storeInfo?.name}` : `Orders allocated for pickup/dispatch at ${storeInfo?.name}`}
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
                  value={staffOrderStatusFilter}
                  onChange={(e) => {
                    setStaffOrderStatusFilter(e.target.value);
                    setStaffOrdersPage(1);
                  }}
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
                  <option value="ALL">{lang === 'vi' ? `TẤT CẢ TRẠNG THÁI (${storeOrders.length} đơn)` : `ALL ORDERS (${storeOrders.length})`}</option>
                  <option value="PENDING">PENDING ({lang === 'vi' ? 'Chờ xác nhận' : 'Pending Confirmation'})</option>
                  <option value="CONFIRMED">CONFIRMED ({lang === 'vi' ? 'Đã xác nhận' : 'Confirmed'})</option>
                  <option value="PACKING">PACKING ({lang === 'vi' ? 'Đang đóng gói' : 'Packing'})</option>
                  <option value="SHIPPING">SHIPPING ({lang === 'vi' ? 'Đang giao hàng' : 'In Transit'})</option>
                  <option value="DELIVERED">DELIVERED ({lang === 'vi' ? 'Đã giao thành công' : 'Delivered'})</option>
                  <option value="COMPLETED">COMPLETED ({lang === 'vi' ? 'Hoàn tất' : 'Completed'})</option>
                  <option value="CANCELLED">CANCELLED ({lang === 'vi' ? 'Hủy đơn & hoàn kho' : 'Cancelled & Restocked'})</option>
                </select>
              </div>
            </div>

            {/* Quick Status Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid #eee' }}>
              {[
                { id: 'ALL', label: lang === 'vi' ? 'Tất cả' : 'All', count: storeOrders.length, color: '#111' },
                { id: 'PENDING', label: lang === 'vi' ? 'Chờ xác nhận' : 'Pending', count: storeOrders.filter((o) => o.status === 'PENDING').length, color: '#f57c00' },
                { id: 'CONFIRMED', label: lang === 'vi' ? 'Đã xác nhận' : 'Confirmed', count: storeOrders.filter((o) => o.status === 'CONFIRMED').length, color: '#00875a' },
                { id: 'PACKING', label: lang === 'vi' ? 'Đang đóng gói' : 'Packing', count: storeOrders.filter((o) => o.status === 'PACKING').length, color: '#0052cc' },
                { id: 'SHIPPING', label: lang === 'vi' ? 'Đang giao hàng' : 'In Transit', count: storeOrders.filter((o) => o.status === 'SHIPPING').length, color: '#6554c0' },
                { id: 'DELIVERED', label: lang === 'vi' ? 'Đã giao thành công' : 'Delivered', count: storeOrders.filter((o) => o.status === 'DELIVERED').length, color: '#00875a' },
                { id: 'COMPLETED', label: lang === 'vi' ? 'Hoàn tất' : 'Completed', count: storeOrders.filter((o) => o.status === 'COMPLETED').length, color: '#2e7d32' },
                { id: 'CANCELLED', label: lang === 'vi' ? 'Hủy đơn' : 'Cancelled', count: storeOrders.filter((o) => o.status === 'CANCELLED').length, color: '#e60012' }
              ].map((chip) => {
                const isSelected = staffOrderStatusFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setStaffOrderStatusFilter(chip.id);
                      setStaffOrdersPage(1);
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
                placeholder={lang === 'vi' ? 'Tìm kiếm theo mã đơn (UQ-...), tên khách hàng, số điện thoại, địa chỉ...' : 'Search by Order ID (UQ-...), customer name, phone, address...'}
                value={staffOrderSearch}
                onChange={(e) => {
                  setStaffOrderSearch(e.target.value);
                  setStaffOrdersPage(1);
                }}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem' }}
              />
              {staffOrderSearch && (
                <button
                  onClick={() => {
                    setStaffOrderSearch('');
                    setStaffOrdersPage(1);
                  }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {filteredStoreOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888', backgroundColor: '#fafafa', border: '1px dashed #ddd' }}>
                {lang === 'vi' ? 'Không tìm thấy đơn hàng nào thuộc bộ lọc đã chọn.' : 'No orders matched current filter criteria.'}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {paginatedStoreOrders.map((order) => (
                    <div key={order.id} style={{ border: '1px solid #e5e5e5', padding: '16px', backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong style={{ fontSize: '1rem' }}>{order.orderNumber}</strong>
                          <span className="badge-uq red">{order.status}</span>
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>
                            {lang === 'vi' ? 'Khách:' : 'Customer:'} {order.customerName} ({order.customerPhone})
                          </span>
                        </div>
                        <div style={{ fontWeight: '800', color: '#e60012' }}>
                          {formatPrice(order.finalAmount)}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#555', marginBottom: '12px' }}>
                        {lang === 'vi' ? 'Địa chỉ:' : 'Address:'} {order.shippingAddress} • {lang === 'vi' ? 'Loại:' : 'Type:'} <strong>{order.orderType}</strong>
                      </div>

                      {/* Items table */}
                      <div style={{ backgroundColor: '#fff', border: '1px solid #eee', padding: '10px', marginBottom: '12px' }}>
                        {order.items?.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0' }}>
                            <span>{it.productName} ({it.color} / Size {it.size}) × <strong>{it.quantity}</strong></span>
                            <span>{formatPrice(it.subTotal)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Transition buttons */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'PACKING')}
                            className="btn-uq btn-uq-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            {lang === 'vi' ? 'Soạn hàng & Đóng gói' : 'Pick & Pack'}
                          </button>
                        )}
                        {order.status === 'PACKING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPING')}
                            className="btn-uq btn-uq-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            {lang === 'vi' ? 'Bàn giao Shipper / Đang giao' : 'Handover to Courier / In Transit'}
                          </button>
                        )}
                        {order.status === 'SHIPPING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                            className="btn-uq btn-uq-red"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            {lang === 'vi' ? 'Xác nhận Đã giao thành công' : 'Mark as Delivered'}
                          </button>
                        )}
                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                            className="btn-uq"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              backgroundColor: '#fff0f0',
                              color: '#e60012',
                              border: '1px solid #ffcdd2',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {lang === 'vi' ? 'Hủy Đơn Hàng' : 'Cancel Order'}
                          </button>
                        )}
                        <button
                          onClick={() => setReceiptOrder(order)}
                          className="btn-uq btn-uq-outline-gray"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          <Printer size={12} /> {lang === 'vi' ? 'In Phiếu Đóng Gói' : 'Print Slip'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modern Pagination Controls (1, 2, 3, 4...) */}
                {totalStaffOrdersCount > 0 && (
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
                          ? `Hiển thị ${(currentStaffOrdersPage - 1) * staffOrdersPerPage + 1}–${Math.min(currentStaffOrdersPage * staffOrdersPerPage, totalStaffOrdersCount)} trong số ${totalStaffOrdersCount} đơn hàng`
                          : `Showing ${(currentStaffOrdersPage - 1) * staffOrdersPerPage + 1}–${Math.min(currentStaffOrdersPage * staffOrdersPerPage, totalStaffOrdersCount)} of ${totalStaffOrdersCount} orders`}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'vi' ? 'Số đơn/trang:' : 'Per page:'}</span>
                        <select
                          value={staffOrdersPerPage}
                          onChange={(e) => {
                            setStaffOrdersPerPage(Number(e.target.value));
                            setStaffOrdersPage(1);
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
                        onClick={() => setStaffOrdersPage((p) => Math.max(1, p - 1))}
                        disabled={currentStaffOrdersPage === 1}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentStaffOrdersPage === 1 ? '#f5f5f5' : '#ffffff',
                          color: currentStaffOrdersPage === 1 ? '#aaa' : '#111',
                          cursor: currentStaffOrdersPage === 1 ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>‹</span>
                        <span>{lang === 'vi' ? 'Trước' : 'Prev'}</span>
                      </button>

                      {Array.from({ length: totalStaffOrderPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalStaffOrderPages || Math.abs(p - currentStaffOrdersPage) <= 2)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span style={{ padding: '0 4px', color: '#888' }}>...</span>}
                              <button
                                onClick={() => setStaffOrdersPage(p)}
                                style={{
                                  minWidth: '34px',
                                  height: '32px',
                                  fontSize: '0.82rem',
                                  fontWeight: currentStaffOrdersPage === p ? '800' : '600',
                                  border: currentStaffOrdersPage === p ? '2px solid #e60012' : '1px solid #ccc',
                                  backgroundColor: currentStaffOrdersPage === p ? '#e60012' : '#ffffff',
                                  color: currentStaffOrdersPage === p ? '#ffffff' : '#333333',
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
                        onClick={() => setStaffOrdersPage((p) => Math.min(totalStaffOrderPages, p + 1))}
                        disabled={currentStaffOrdersPage === totalStaffOrderPages}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentStaffOrdersPage === totalStaffOrderPages ? '#f5f5f5' : '#ffffff',
                          color: currentStaffOrdersPage === totalStaffOrderPages ? '#aaa' : '#111',
                          cursor: currentStaffOrdersPage === totalStaffOrderPages ? 'not-allowed' : 'pointer',
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

        {/* ================= TAB 3: STORE INVENTORY ================= */}
        {activeTab === 'inventory' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? `Quản Lý Tồn Kho Chi Nhánh (${filteredInventory.length} biến thể)` : `Store Inventory & Real-Time Stock (${filteredInventory.length})`}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {lang === 'vi' ? `Kiểm kê, điều chỉnh số lượng và theo dõi hàng sắp hết tại ${storeInfo?.name}` : `Inventory audit, manual adjustments, and low-stock alerts at ${storeInfo?.name}`}
                </div>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <input
                  type="text"
                  placeholder={lang === 'vi' ? 'Lọc theo SKU, màu, size...' : 'Filter by SKU, color, size...'}
                  value={inventorySearch}
                  onChange={(e) => {
                    setInventorySearch(e.target.value);
                    setInventoryPage(1);
                  }}
                  style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                />
                <Search size={14} color="#888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              </div>
            </div>

            {filteredInventory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888', backgroundColor: '#fafafa', border: '1px dashed #ddd' }}>
                {lang === 'vi' ? 'Không tìm thấy biến thể nào trong kho phù hợp với từ khóa.' : 'No inventory items matched current filter criteria.'}
              </div>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'SẢN PHẨM / BIẾN THỂ' : 'PRODUCT / VARIANT'}</th>
                      <th style={{ padding: '10px' }}>SKU</th>
                      <th style={{ padding: '10px' }}>BARCODE</th>
                      <th style={{ padding: '10px' }}>SIZE</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'vi' ? 'TỒN KHO' : 'STOCK ON HAND'}</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'vi' ? 'TRẠNG THÁI' : 'STATUS'}</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>{lang === 'vi' ? 'THAO TÁC' : 'ACTION'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInventory.map((variant) => (
                      <tr key={variant.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: variant.colorHex }} />
                            <strong>{variant.colorName}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>{variant.sku}</td>
                        <td style={{ padding: '10px', fontFamily: 'monospace', color: '#0052cc' }}>{variant.barcode}</td>
                        <td style={{ padding: '10px', fontWeight: '700' }}>{variant.size}</td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: '800', fontSize: '1rem' }}>
                          {variant.totalStock}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {variant.totalStock <= 5 ? (
                            <span className="badge-uq red">{lang === 'vi' ? `Sắp hết (${variant.totalStock})` : `Low Stock (${variant.totalStock})`}</span>
                          ) : (
                            <span className="badge-uq gray" style={{ color: '#00875a' }}>{lang === 'vi' ? 'Đủ hàng' : 'In Stock'}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setAdjustModalItem(variant);
                              setNewStockQty(variant.totalStock);
                            }}
                            className="btn-uq btn-uq-outline-gray"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            {lang === 'vi' ? 'Kiểm kê / Điều chỉnh' : 'Audit / Adjust'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Inventory Pagination Controls (1, 2, 3, 4...) */}
                {totalInventoryCount > 0 && (
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
                          ? `Hiển thị ${(currentInventoryPage - 1) * inventoryPerPage + 1}–${Math.min(currentInventoryPage * inventoryPerPage, totalInventoryCount)} trong số ${totalInventoryCount} biến thể`
                          : `Showing ${(currentInventoryPage - 1) * inventoryPerPage + 1}–${Math.min(currentInventoryPage * inventoryPerPage, totalInventoryCount)} of ${totalInventoryCount} variants`}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'vi' ? 'Số mục/trang:' : 'Per page:'}</span>
                        <select
                          value={inventoryPerPage}
                          onChange={(e) => {
                            setInventoryPerPage(Number(e.target.value));
                            setInventoryPage(1);
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
                        onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                        disabled={currentInventoryPage === 1}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentInventoryPage === 1 ? '#f5f5f5' : '#ffffff',
                          color: currentInventoryPage === 1 ? '#aaa' : '#111',
                          cursor: currentInventoryPage === 1 ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>‹</span>
                        <span>{lang === 'vi' ? 'Trước' : 'Prev'}</span>
                      </button>

                      {Array.from({ length: totalInventoryPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalInventoryPages || Math.abs(p - currentInventoryPage) <= 2)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span style={{ padding: '0 4px', color: '#888' }}>...</span>}
                              <button
                                onClick={() => setInventoryPage(p)}
                                style={{
                                  minWidth: '34px',
                                  height: '32px',
                                  fontSize: '0.82rem',
                                  fontWeight: currentInventoryPage === p ? '800' : '600',
                                  border: currentInventoryPage === p ? '2px solid #e60012' : '1px solid #ccc',
                                  backgroundColor: currentInventoryPage === p ? '#e60012' : '#ffffff',
                                  color: currentInventoryPage === p ? '#ffffff' : '#333333',
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
                        onClick={() => setInventoryPage((p) => Math.min(totalInventoryPages, p + 1))}
                        disabled={currentInventoryPage === totalInventoryPages}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentInventoryPage === totalInventoryPages ? '#f5f5f5' : '#ffffff',
                          color: currentInventoryPage === totalInventoryPages ? '#aaa' : '#111',
                          cursor: currentInventoryPage === totalInventoryPages ? 'not-allowed' : 'pointer',
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

        {/* ================= TAB 4: DAILY REPORT ================= */}
        {activeTab === 'report' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '20px' }}>
              {lang === 'vi' ? `Báo Cáo Doanh Thu Ca & Tình Trạng Chi Nhánh (${dailyReport?.reportDate})` : `Daily Shift & Store Sales Performance (${dailyReport?.reportDate || 'Today'})`}
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Doanh thu hôm nay' : 'Today Revenue'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#e60012', marginTop: '6px' }}>
                  {formatPrice(dailyReport?.todayRevenue || 0)}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Tổng đơn đã xử lý' : 'Orders Processed'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#111', marginTop: '6px' }}>
                  {dailyReport?.totalOrdersToday || 0}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Đơn POS tại quầy' : 'In-Store POS Orders'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#00875a', marginTop: '6px' }}>
                  {dailyReport?.posOrdersCount || 0}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Cảnh báo sắp hết hàng' : 'Low Stock Alerts'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffab00', marginTop: '6px' }}>
                  {dailyReport?.lowStockVariantsCount || 0}
                </div>
              </div>
            </div>

            {/* Print shift report button */}
            <button onClick={() => window.print()} className="btn-uq btn-uq-primary">
              <Printer size={16} />
              <span>{lang === 'vi' ? 'In Biên Bản Chốt Ca Bán Hàng' : 'Print Shift Settlement Report'}</span>
            </button>
          </div>
        )}

        {/* ================= TAB 1: STORE MANAGER PRODUCT MANAGEMENT ================= */}
        {activeTab === 'products' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? `Quản Lý Danh Mục & Sản Phẩm (${filteredManagerProducts.length} sản phẩm)` : `Products & Catalog Matrix Management (${filteredManagerProducts.length})`}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {lang === 'vi' ? 'Thêm mới, cập nhật giá bán, sửa chi tiết và ma trận biến thể' : 'Add new styles, adjust retail prices, descriptions, and SKU matrices'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '240px' }}>
                  <input
                    type="text"
                    placeholder={lang === 'vi' ? 'Tìm theo tên, mã SP...' : 'Search by name, SKU...'}
                    value={managerProdSearch}
                    onChange={(e) => {
                      setManagerProdSearch(e.target.value);
                      setStaffProductsPage(1);
                    }}
                    style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                  />
                  <Search size={14} color="#888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                </div>
                <button onClick={handleOpenCreateProduct} className="btn-uq btn-uq-red" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Plus size={16} />
                  <span>{lang === 'vi' ? 'Thêm Sản Phẩm Mới' : 'Add New Product'}</span>
                </button>
              </div>
            </div>

            {filteredManagerProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888', backgroundColor: '#fafafa', border: '1px dashed #ddd' }}>
                {lang === 'vi' ? 'Không tìm thấy sản phẩm nào phù hợp với từ khóa tìm kiếm.' : 'No products matched current search keyword.'}
              </div>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'ẢNH / TÊN SẢN PHẨM' : 'PRODUCT DETAILS'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'MÃ SP' : 'CODE'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'GIỚI TÍNH' : 'GENDER'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'BỘ SƯU TẬP' : 'COLLECTION'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'GIÁ NIÊM YẾT' : 'RETAIL PRICE'}</th>
                      <th style={{ padding: '10px' }}>{lang === 'vi' ? 'BIẾN THỂ' : 'VARIANTS'}</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>{lang === 'vi' ? 'THAO TÁC' : 'ACTIONS'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStaffProducts.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={prod.primaryImageUrl} alt={prod.name} style={{ width: '40px', height: '48px', objectFit: 'cover' }} />
                            <div>
                              <strong>{prod.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#666' }}>{prod.categoryName || 'LifeWear'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>{prod.code}</td>
                        <td style={{ padding: '10px' }}>{prod.gender}</td>
                        <td style={{ padding: '10px' }}>{prod.collection || 'LifeWear Essentials'}</td>
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

                {/* Staff Products Pagination Controls (1, 2, 3, 4...) */}
                {totalStaffProductsCount > 0 && (
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
                          ? `Hiển thị ${(currentStaffProductsPage - 1) * staffProductsPerPage + 1}–${Math.min(currentStaffProductsPage * staffProductsPerPage, totalStaffProductsCount)} trong số ${totalStaffProductsCount} sản phẩm`
                          : `Showing ${(currentStaffProductsPage - 1) * staffProductsPerPage + 1}–${Math.min(currentStaffProductsPage * staffProductsPerPage, totalStaffProductsCount)} of ${totalStaffProductsCount} products`}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{lang === 'vi' ? 'Số mục/trang:' : 'Per page:'}</span>
                        <select
                          value={staffProductsPerPage}
                          onChange={(e) => {
                            setStaffProductsPerPage(Number(e.target.value));
                            setStaffProductsPage(1);
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
                        onClick={() => setStaffProductsPage((p) => Math.max(1, p - 1))}
                        disabled={currentStaffProductsPage === 1}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentStaffProductsPage === 1 ? '#f5f5f5' : '#ffffff',
                          color: currentStaffProductsPage === 1 ? '#aaa' : '#111',
                          cursor: currentStaffProductsPage === 1 ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>‹</span>
                        <span>{lang === 'vi' ? 'Trước' : 'Prev'}</span>
                      </button>

                      {Array.from({ length: totalStaffProductPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalStaffProductPages || Math.abs(p - currentStaffProductsPage) <= 2)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span style={{ padding: '0 4px', color: '#888' }}>...</span>}
                              <button
                                onClick={() => setStaffProductsPage(p)}
                                style={{
                                  minWidth: '34px',
                                  height: '32px',
                                  fontSize: '0.82rem',
                                  fontWeight: currentStaffProductsPage === p ? '800' : '600',
                                  border: currentStaffProductsPage === p ? '2px solid #e60012' : '1px solid #ccc',
                                  backgroundColor: currentStaffProductsPage === p ? '#e60012' : '#ffffff',
                                  color: currentStaffProductsPage === p ? '#ffffff' : '#333333',
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
                        onClick={() => setStaffProductsPage((p) => Math.min(totalStaffProductPages, p + 1))}
                        disabled={currentStaffProductsPage === totalStaffProductPages}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          border: '1px solid #ccc',
                          backgroundColor: currentStaffProductsPage === totalStaffProductPages ? '#f5f5f5' : '#ffffff',
                          color: currentStaffProductsPage === totalStaffProductPages ? '#aaa' : '#111',
                          cursor: currentStaffProductsPage === totalStaffProductPages ? 'not-allowed' : 'pointer',
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

        {/* Modal: Create/Edit Product for Store Manager */}
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
                    : (lang === 'vi' ? 'Thêm Sản Phẩm Mới & Tạo Ma Trận Biến Thể' : 'Create New Product & Generate SKU Matrix')}
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
                      {lang === 'vi' ? 'Chất liệu *' : 'Fabric / Material *'}
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

                {!editingProduct && (
                  <div style={{ backgroundColor: '#fafafa', padding: '14px', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px' }}>
                      {lang === 'vi' ? 'MA TRẬN BIẾN THỂ TỰ ĐỘNG (VARIANT MATRIX GENERATOR):' : 'AUTOMATIC SKU VARIANT MATRIX GENERATOR:'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px' }}>
                      {lang === 'vi'
                        ? `Tự động tạo ${selectedColorsForMatrix.length * selectedSizesForMatrix.length} SKU và gán mã vạch Barcode:`
                        : `Auto-generates ${selectedColorsForMatrix.length * selectedSizesForMatrix.length} unique SKUs and Barcodes:`}
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
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-uq btn-uq-outline-gray" style={{ padding: '10px 18px' }}>
                    {lang === 'vi' ? 'Hủy' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn-uq btn-uq-red" style={{ padding: '10px 24px' }}>
                    {editingProduct ? (lang === 'vi' ? 'Lưu Thay Đổi Sản Phẩm' : 'Save Changes') : (lang === 'vi' ? 'Tạo Sản Phẩm & Biến Thể' : 'Create Product & SKUs')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Adjust Store Inventory */}
        {adjustModalItem && (
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
            <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#fff', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '14px' }}>
                {lang === 'vi' ? 'Điều Chỉnh Kiểm Kê Tồn Kho' : 'Manual Inventory Stock Adjustment'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
                SKU: <strong>{adjustModalItem.sku}</strong> ({adjustModalItem.colorName} - Size {adjustModalItem.size})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Số lượng tồn kho thực tế mới:' : 'New Physical Stock Count:'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none', fontWeight: '700', fontSize: '1.1rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Lý do điều chỉnh:' : 'Adjustment Reason:'}
                  </label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  >
                    <option value="Routine Physical Inventory">{lang === 'vi' ? 'Kiểm kê định kỳ' : 'Routine Physical Inventory'}</option>
                    <option value="Damaged / Defective Stock">{lang === 'vi' ? 'Hàng lỗi / hỏng / bẩn' : 'Damaged / Defective Stock'}</option>
                    <option value="Warehouse Inbound">{lang === 'vi' ? 'Nhập bổ sung từ kho tổng' : 'Warehouse Inbound'}</option>
                    <option value="Customer Counter Exchange">{lang === 'vi' ? 'Khách đổi hàng tại quầy' : 'Customer Counter Exchange'}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdjustModalItem(null)} className="btn-uq btn-uq-outline-gray" style={{ padding: '8px 16px' }}>
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button onClick={handleConfirmStockAdjust} className="btn-uq btn-uq-red" style={{ padding: '8px 16px' }}>
                  {lang === 'vi' ? 'Xác nhận lưu' : 'Save Adjustment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thermal receipt modal */}
        <ReceiptModal
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
        />

        {/* Delete / Deactivate Confirm Modal */}
        <ConfirmModal
          isOpen={!!deleteConfirmId}
          title={lang === 'vi' ? 'Cập nhật trạng thái sản phẩm' : 'Deactivate Product Listing'}
          message={lang === 'vi' ? 'Bạn có chắc chắn muốn ngưng kinh doanh sản phẩm này? Sản phẩm sẽ được chuyển sang trạng thái tạm ngưng bán.' : 'Are you sure you want to deactivate this product from the public catalog?'}
          confirmText={lang === 'vi' ? 'Đồng ý ngưng bán' : 'Confirm Deactivation'}
          cancelText={lang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
          isDanger={true}
          onConfirm={confirmDeleteProduct}
          onCancel={() => setDeleteConfirmId(null)}
        />
      </div>
    </div>
  );
};
