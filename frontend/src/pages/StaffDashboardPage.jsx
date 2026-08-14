import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  ShoppingBag,
  Package,
  Boxes,
  Truck,
  FileText,
  Scan,
  Printer,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  CreditCard,
  QrCode,
  DollarSign,
  ArrowRightLeft,
  RotateCcw,
  Edit2,
  X,
  Tag,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { ConfirmModal } from '../components/ConfirmModal';
import api from '../services/api';

export const StaffDashboardPage = ({ onNavigate }) => {
  const { user, isStaff, isAdmin } = useAuth();
  const { formatPrice } = useLanguage();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState('products'); // 'products', 'fulfillment', 'inventory', 'transfers', 'report'
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // POS State
  const [posProducts, setPosProducts] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [posCart, setPosCart] = useState([]);
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCouponCode, setPosCouponCode] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState('CASH_POS');
  const [posCashTendered, setPosCashTendered] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Fulfillment State
  const [storeOrders, setStoreOrders] = useState([]);

  // Inventory State
  const [inventoryList, setInventoryList] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [newStockQty, setNewStockQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Kiểm kê định kỳ');

  // Transfers State
  const [transfers, setTransfers] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [transferVariantId, setTransferVariantId] = useState('');
  const [transferFromStoreId, setTransferFromStoreId] = useState(4); // default central warehouse
  const [transferQty, setTransferQty] = useState(20);
  const [transferReason, setTransferReason] = useState('Bổ sung hàng bán chạy');

  // Daily report State
  const [dailyReport, setDailyReport] = useState(null);

  // Store Manager Product Management State
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
  const [prodFormMaterial, setProdFormMaterial] = useState('100% Cotton cao cấp');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormImage, setProdFormImage] = useState('');
  const [prodFormFeatured, setProdFormFeatured] = useState(true);
  const [prodFormNew, setProdFormNew] = useState(true);
  const [selectedColorsForMatrix, setSelectedColorsForMatrix] = useState(['09 BLACK', '00 WHITE']);
  const [selectedSizesForMatrix, setSelectedSizesForMatrix] = useState(['S', 'M', 'L', 'XL']);
  const [managerProdSearch, setManagerProdSearch] = useState('');

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
      fetchStaffData();
    } catch (err) {
      showError(err.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/admin/products/${deleteConfirmId}`);
      showSuccess('Đã cập nhật trạng thái sản phẩm thành công');
      setDeleteConfirmId(null);
      fetchStaffData();
    } catch (err) {
      showError(err.message || 'Lỗi khi xóa/ngừng bán sản phẩm');
      setDeleteConfirmId(null);
    }
  };

  // --- POS TERMINAL LOGIC ---
  const handlePosAddToCart = (variant, product) => {
    const existing = posCart.find((it) => it.variantId === variant.id);
    const unitPrice = (product.salePrice || product.basePrice) + (variant.priceAdjustment || 0);

    if (existing) {
      setPosCart(posCart.map((it) =>
        it.variantId === variant.id ? { ...it, quantity: it.quantity + 1, subTotal: (it.quantity + 1) * unitPrice } : it
      ));
    } else {
      setPosCart([
        ...posCart,
        {
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          color: variant.colorName,
          size: variant.size,
          barcode: variant.barcode,
          unitPrice,
          quantity: 1,
          subTotal: unitPrice,
          imageUrl: variant.imageUrl || product.primaryImageUrl
        }
      ]);
    }
    showSuccess(`Đã thêm ${product.name} (${variant.size})`);
  };

  const handleBarcodeScanned = (barcode) => {
    let found = false;
    for (const p of posProducts) {
      const v = p.variants?.find((varItem) => varItem.barcode === barcode || varItem.sku === barcode);
      if (v) {
        handlePosAddToCart(v, p);
        found = true;
        break;
      }
    }
    if (!found) {
      showError(`Không tìm thấy sản phẩm với mã vạch: ${barcode}`);
    }
  };

  const updatePosQty = (variantId, delta) => {
    setPosCart(posCart.map((it) => {
      if (it.variantId === variantId) {
        const newQty = it.quantity + delta;
        return newQty > 0 ? { ...it, quantity: newQty, subTotal: newQty * it.unitPrice } : null;
      }
      return it;
    }).filter(Boolean));
  };

  const removePosItem = (variantId) => {
    setPosCart(posCart.filter((it) => it.variantId !== variantId));
  };

  const posSubTotal = posCart.reduce((sum, it) => sum + it.subTotal, 0);
  const posDiscount = (posCouponCode === 'BEO10' || posCouponCode === 'UNIQLO10') ? Math.min(posSubTotal * 0.1, 100000) : 0;
  const posFinalAmount = Math.max(posSubTotal - posDiscount, 0);
  const cashChange = posCashTendered ? Math.max(Number(posCashTendered) - posFinalAmount, 0) : 0;

  const handlePosCheckout = async () => {
    if (posCart.length === 0) {
      showError('Giỏ hàng POS đang trống');
      return;
    }

    try {
      const payload = {
        storeId: storeInfo?.id,
        customerName: posCustomerName || 'Khách mua tại quầy',
        customerPhone: posCustomerPhone,
        couponCode: posCouponCode,
        paymentMethod: posPaymentMethod,
        cashTendered: posPaymentMethod === 'CASH_POS' && posCashTendered ? Number(posCashTendered) : null,
        items: posCart.map((it) => ({ variantId: it.variantId, quantity: it.quantity }))
      };

      const res = await api.post('/staff/pos/orders', payload);
      showSuccess('Thanh toán POS thành công!');
      setReceiptOrder(res.data);
      setPosCart([]);
      setPosCustomerName('');
      setPosCustomerPhone('');
      setPosCouponCode('');
      setPosCashTendered('');
      fetchStaffData();
    } catch (err) {
      showError(err.message || 'Lỗi khi xử lý đơn POS');
    }
  };

  // --- ORDER FULFILLMENT LOGIC ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/staff/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Cập nhật bởi ${user.fullName} (${user.role})`
      });
      showSuccess(`Đã chuyển trạng thái đơn sang ${newStatus}`);
      fetchStaffData();
    } catch (err) {
      showError(err.message || 'Lỗi khi cập nhật trạng thái');
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
      showSuccess('Đã cập nhật tồn kho chi nhánh thành công');
      setAdjustModalItem(null);
      fetchStaffData();
    } catch (err) {
      showError(err.message || 'Lỗi khi cập nhật tồn kho');
    }
  };

  // --- STOCK TRANSFER LOGIC ---
  const handleCreateTransferRequest = async (e) => {
    e.preventDefault();
    if (!transferVariantId) {
      showError('Vui lòng chọn sản phẩm cần điều chuyển');
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
      showSuccess('Đã gửi yêu cầu điều chuyển hàng thành công!');
      fetchStaffData();
    } catch (err) {
      showError(err.message || 'Lỗi khi gửi yêu cầu điều chuyển');
    }
  };

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
                  {storeInfo?.name || 'BEO Vincom Xuân Khánh Cần Thơ'}
                </h1>
                <span className="badge-uq red">{user?.role}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>
                Mã chi nhánh: <strong>{storeInfo?.code || 'STR-CT-01'}</strong> | Quản lý: <strong>{user?.fullName}</strong> ({user?.email})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onNavigate('home')}
              className="btn-uq btn-uq-outline-gray"
              style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#fff', borderColor: '#444' }}
            >
              Về Storefront
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
          {[
            { id: 'products', label: `1. Quản Lý Sản Phẩm (${posProducts.length})`, icon: <Tag size={16} /> },
            { id: 'fulfillment', label: `2. Xử Lý Đơn Hàng (${storeOrders.length})`, icon: <Package size={16} /> },
            { id: 'inventory', label: '3. Tồn Kho Chi Nhánh', icon: <Boxes size={16} /> },
            { id: 'transfers', label: `4. Điều Chuyển Hàng (${transfers.length})`, icon: <ArrowRightLeft size={16} /> },
            { id: 'report', label: '5. Báo Cáo Doanh Thu Chi Nhánh', icon: <FileText size={16} /> },
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
                whiteSpace: 'nowrap',
                transition: 'var(--transition)'
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
                Hàng Đợi Xử Lý Đơn Hàng (Order Fulfillment Queue)
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                {storeOrders.length} đơn hàng thuộc chi nhánh {storeInfo?.name}
              </div>
            </div>

            {storeOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                Hiện không có đơn hàng nào cần xử lý tại chi nhánh này.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {storeOrders.map((order) => (
                  <div key={order.id} style={{ border: '1px solid #e5e5e5', padding: '16px', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ fontSize: '1rem' }}>{order.orderNumber}</strong>
                        <span className="badge-uq red">{order.status}</span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                          Khách: {order.customerName} ({order.customerPhone})
                        </span>
                      </div>
                      <div style={{ fontWeight: '800', color: '#e60012' }}>
                        {formatPrice(order.finalAmount)}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#555', marginBottom: '12px' }}>
                      Địa chỉ: {order.shippingAddress} • Loại: <strong>{order.orderType}</strong>
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
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'PACKING')}
                          className="btn-uq btn-uq-primary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Soạn hàng & Đóng gói
                        </button>
                      )}
                      {order.status === 'PACKING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPING')}
                          className="btn-uq btn-uq-primary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Bàn giao Shipper / Đang giao
                        </button>
                      )}
                      {order.status === 'SHIPPING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                          className="btn-uq btn-uq-red"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Xác nhận Đã giao thành công
                        </button>
                      )}
                      <button
                        onClick={() => setReceiptOrder(order)}
                        className="btn-uq btn-uq-outline-gray"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        <Printer size={12} /> In Phiếu Đóng Gói
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: STORE INVENTORY ================= */}
        {activeTab === 'inventory' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
                  Quản Lý Tồn Kho Chi Nhánh
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Kiểm kê, điều chỉnh số lượng và theo dõi hàng sắp hết tại {storeInfo?.name}
                </div>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <input
                  type="text"
                  placeholder="Lọc theo SKU, màu, size..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                />
                <Search size={14} color="#888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>SẢN PHẨM / BIẾN THỂ</th>
                  <th style={{ padding: '10px' }}>SKU</th>
                  <th style={{ padding: '10px' }}>BARCODE</th>
                  <th style={{ padding: '10px' }}>SIZE</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>TỒN KHO CHI NHÁNH</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {inventoryList
                  .filter((v) => !inventorySearch || v.sku.toLowerCase().includes(inventorySearch.toLowerCase()) || v.colorName.toLowerCase().includes(inventorySearch.toLowerCase()))
                  .map((variant) => (
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
                          <span className="badge-uq red">Sắp hết ({variant.totalStock})</span>
                        ) : (
                          <span className="badge-uq gray" style={{ color: '#00875a' }}>Đủ hàng</span>
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
                          Kiểm kê / Điều chỉnh
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 4: STOCK TRANSFERS ================= */}
        {activeTab === 'transfers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* Create Transfer Request Form */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                Tạo Yêu Cầu Điều Chuyển Hàng
              </div>

              <form onSubmit={handleCreateTransferRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    Chi nhánh xuất hàng (Nguồn) *
                  </label>
                  <select
                    value={transferFromStoreId}
                    onChange={(e) => setTransferFromStoreId(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  >
                    {allStores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.isCentralWarehouse ? '(Kho Tổng)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    Chọn sản phẩm & biến thể cần nhập *
                  </label>
                  <select
                    value={transferVariantId}
                    onChange={(e) => setTransferVariantId(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                    required
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {inventoryList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.sku} - {v.colorName} ({v.size})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    Số lượng yêu cầu *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    Lý do điều chuyển
                  </label>
                  <input
                    type="text"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                <button type="submit" className="btn-uq btn-uq-red" style={{ padding: '12px' }}>
                  <ArrowRightLeft size={16} />
                  <span>Gửi Yêu Cầu Điều Chuyển</span>
                </button>
              </form>
            </div>

            {/* Transfer History Table */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                Lịch Sử Điều Chuyển Của Chi Nhánh ({transfers.length})
              </div>

              {transfers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  Chưa có yêu cầu điều chuyển nào.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                  {transfers.map((tr) => (
                    <div key={tr.id} style={{ padding: '12px', border: '1px solid #eee', backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong>{tr.requestCode}</strong>
                        <span className="badge-uq black">{tr.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#555' }}>
                        Từ: <strong>{tr.fromStoreName}</strong> → Tới: <strong>{tr.toStoreName}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        SP: {tr.productName} ({tr.color} - Size {tr.size}) • SL: <strong>{tr.quantity}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                        Lý do: {tr.reason} | Người tạo: {tr.requesterName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: DAILY REPORT ================= */}
        {activeTab === 'report' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '20px' }}>
              Báo Cáo Doanh Thu Ca & Tình Trạng Chi Nhánh ({dailyReport?.reportDate})
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>Doanh thu hôm nay</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#e60012', marginTop: '6px' }}>
                  {formatPrice(dailyReport?.todayRevenue || 0)}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>Tổng đơn đã xử lý</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#111', marginTop: '6px' }}>
                  {dailyReport?.totalOrdersToday || 0}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>Đơn POS tại quầy</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#00875a', marginTop: '6px' }}>
                  {dailyReport?.posOrdersCount || 0}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>Cảnh báo sắp hết hàng</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffab00', marginTop: '6px' }}>
                  {dailyReport?.lowStockVariantsCount || 0}
                </div>
              </div>
            </div>

            {/* Print shift report button */}
            <button onClick={() => window.print()} className="btn-uq btn-uq-primary">
              <Printer size={16} />
              <span>In Biên Bản Chốt Ca Bán Hàng</span>
            </button>
          </div>
        )}

        {/* ================= TAB 6: STORE MANAGER PRODUCT MANAGEMENT ================= */}
        {activeTab === 'products' && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e0e0e0', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
                  Quản Lý Danh Mục & Sản Phẩm (Store Manager)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Thêm mới, cập nhật giá bán, sửa chi tiết và ma trận biến thể
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '240px' }}>
                  <input
                    type="text"
                    placeholder="Tìm theo tên, mã SP..."
                    value={managerProdSearch}
                    onChange={(e) => setManagerProdSearch(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                  />
                  <Search size={14} color="#888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                </div>
                <button onClick={handleOpenCreateProduct} className="btn-uq btn-uq-red" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Plus size={16} />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>ẢNH / TÊN SẢN PHẨM</th>
                  <th style={{ padding: '10px' }}>MÃ SP</th>
                  <th style={{ padding: '10px' }}>GIỚI TÍNH</th>
                  <th style={{ padding: '10px' }}>BỘ SƯU TẬP</th>
                  <th style={{ padding: '10px' }}>GIÁ NIÊM YẾT</th>
                  <th style={{ padding: '10px' }}>BIẾN THỂ</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {posProducts
                  .filter((p) => !managerProdSearch || p.name.toLowerCase().includes(managerProdSearch.toLowerCase()) || p.code.toLowerCase().includes(managerProdSearch.toLowerCase()))
                  .map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={prod.primaryImageUrl} alt={prod.name} style={{ width: '40px', height: '48px', objectFit: 'cover' }} />
                          <div>
                            <strong>{prod.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{prod.categoryName || 'Thời trang'}</div>
                          </div>
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
                            title="Sửa sản phẩm"
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

        {/* Modal: Create/Edit Product for Store Manager & Admin */}
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
                  {editingProduct ? 'Chỉnh Sửa Thông Tin Sản Phẩm' : 'Thêm Sản Phẩm Mới & Tạo Ma Trận Biến Thể'}
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Mô tả sản phẩm</label>
                  <textarea
                    rows={2}
                    value={prodFormDesc}
                    onChange={(e) => setProdFormDesc(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
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

                {/* Variant Matrix Checkboxes (Only shown on Create or when adding new variants) */}
                {!editingProduct && (
                  <div style={{ backgroundColor: '#fafafa', padding: '14px', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px' }}>
                      MA TRẬN BIẾN THỂ TỰ ĐỘNG (VARIANT MATRIX GENERATOR):
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px' }}>
                      Tự động tạo {selectedColorsForMatrix.length * selectedSizesForMatrix.length} SKU và gán mã vạch Barcode:
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
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-uq btn-uq-outline-gray" style={{ padding: '10px 18px' }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-uq btn-uq-red" style={{ padding: '10px 24px' }}>
                    {editingProduct ? 'Lưu Thay Đổi Sản Phẩm' : 'Tạo Sản Phẩm & Biến Thể'}
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
                Điều Chỉnh Kiểm Kê Tồn Kho
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
                SKU: <strong>{adjustModalItem.sku}</strong> ({adjustModalItem.colorName} - Size {adjustModalItem.size})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    Số lượng tồn kho thực tế mới:
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
                    Lý do điều chỉnh:
                  </label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
                  >
                    <option value="Kiểm kê định kỳ">Kiểm kê định kỳ</option>
                    <option value="Hàng lỗi / hỏng / bẩn">Hàng lỗi / hỏng / bẩn</option>
                    <option value="Nhập bổ sung từ kho tổng">Nhập bổ sung từ kho tổng</option>
                    <option value="Khách đổi hàng tại quầy">Khách đổi hàng tại quầy</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdjustModalItem(null)} className="btn-uq btn-uq-outline-gray" style={{ padding: '8px 16px' }}>
                  Hủy
                </button>
                <button onClick={handleConfirmStockAdjust} className="btn-uq btn-uq-red" style={{ padding: '8px 16px' }}>
                  Xác nhận lưu
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
          title="Cập nhật trạng thái sản phẩm"
          message="Bạn có chắc chắn muốn ngưng kinh doanh sản phẩm này? Sản phẩm sẽ được chuyển sang trạng thái tạm ngưng bán."
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
