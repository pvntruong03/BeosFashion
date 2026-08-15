import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Package, Calendar, Clock, Printer, ChevronRight, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { ConfirmModal } from '../components/ConfirmModal';
import api from '../services/api';

export const OrderHistoryPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { formatPrice, lang } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    if (cancelModalOrder.status !== 'PENDING') {
      showError(lang === 'vi' ? 'Đơn hàng đã được xác nhận hoặc đang xử lý, không thể hủy!' : 'Order is already confirmed or in process and cannot be cancelled!');
      setCancelModalOrder(null);
      return;
    }
    try {
      await api.put(`/orders/${cancelModalOrder.id}/cancel`, null, {
        params: { reason: 'Customer requested cancellation via order history' }
      });
      showSuccess(lang === 'vi' ? `Đã hủy đơn hàng ${cancelModalOrder.orderNumber} thành công!` : `Order ${cancelModalOrder.orderNumber} cancelled successfully!`);
      setCancelModalOrder(null);
      fetchOrders();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi hủy đơn hàng' : 'Failed to cancel order'));
      setCancelModalOrder(null);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#e60012" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
          {lang === 'vi' ? 'Vui lòng đăng nhập' : 'Please Sign In'}
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          {lang === 'vi' ? 'Đăng nhập để theo dõi lịch sử đơn hàng và nhận thông báo vận chuyển.' : 'Sign in to track your order history and receive delivery updates.'}
        </p>
        <button onClick={() => onNavigate('login')} className="btn-uq btn-uq-primary">
          {lang === 'vi' ? 'Đăng nhập ngay' : 'Sign In Now'}
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge-uq gray">{lang === 'vi' ? 'Chờ xác nhận' : 'Pending'}</span>;
      case 'CONFIRMED':
        return <span className="badge-uq black">{lang === 'vi' ? 'Đã xác nhận' : 'Confirmed'}</span>;
      case 'PACKING':
        return <span className="badge-uq" style={{ backgroundColor: '#ffab00', color: '#000' }}>{lang === 'vi' ? 'Đang đóng gói' : 'Packing'}</span>;
      case 'SHIPPING':
        return <span className="badge-uq" style={{ backgroundColor: '#0052cc', color: '#fff' }}>{lang === 'vi' ? 'Đang giao hàng' : 'In Transit'}</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="badge-uq" style={{ backgroundColor: '#00875a', color: '#fff' }}>{lang === 'vi' ? 'Đã giao thành công' : 'Delivered'}</span>;
      case 'CANCELLED':
        return <span className="badge-uq red">{lang === 'vi' ? 'Đã hủy' : 'Cancelled'}</span>;
      default:
        return <span className="badge-uq gray">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '1000px' }}>
      <h1 className="heading-section" style={{ fontSize: '1.8rem', marginBottom: '8px', textTransform: 'uppercase' }}>
        {lang === 'vi' ? 'Lịch Sử Đơn Hàng Của Bạn' : 'My Orders & Purchase History'}
      </h1>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '32px' }}>
        {lang === 'vi' ? 'Theo dõi trạng thái giao nhận và quản lý các đơn hàng đã mua' : 'Track delivery progress and manage your previous orders'}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          {lang === 'vi' ? 'Đang tải danh sách đơn hàng...' : 'Loading order history...'}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
          <Package size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>
            {lang === 'vi' ? 'Bạn chưa có đơn hàng nào' : 'No orders found'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>
            {lang === 'vi' ? 'Hãy khám phá các sản phẩm LifeWear mới nhất của BEO!' : 'Explore our latest LifeWear collection!'}
          </p>
          <button onClick={() => onNavigate('products')} className="btn-uq btn-uq-primary">
            {lang === 'vi' ? 'Khám phá mua sắm ngay' : 'Start Shopping'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                padding: '24px',
                transition: 'var(--transition)'
              }}
            >
              {/* Header card */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#111' }}>{order.orderNumber}</strong>
                    {getStatusBadge(order.status)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#767676', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    <span>{order.createdAt ? new Date(order.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US') : ''}</span>
                    <span>•</span>
                    <span>{order.orderType === 'POS_IN_STORE' ? (lang === 'vi' ? 'Bán tại quầy' : 'In-Store POS') : (lang === 'vi' ? 'Giao hàng tận nơi' : 'Home Delivery')}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{lang === 'vi' ? 'Tổng thanh toán:' : 'Total Amount:'}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#e60012' }}>
                    {formatPrice(order.finalAmount)}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items?.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <img src={it.imageUrl} alt={it.productName} style={{ width: '50px', height: '62px', objectFit: 'cover', backgroundColor: '#f8f8f8' }} />
                    <div style={{ flex: 1, fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: '700', color: '#111' }}>{it.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                        {lang === 'vi' ? 'Màu:' : 'Color:'} {it.color} | Size: <strong>{it.size}</strong> | {lang === 'vi' ? 'Số lượng:' : 'Qty:'} {it.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                      {formatPrice(it.subTotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer action bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {lang === 'vi' ? 'Địa chỉ giao:' : 'Delivery address:'} <strong>{order.shippingAddress}</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Cancel button: ACTIVE ONLY when order is PENDING */}
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => setCancelModalOrder(order)}
                      className="btn-uq"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        backgroundColor: '#fff0f0',
                        color: '#e60012',
                        border: '1px solid #ffcccc',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                      title={lang === 'vi' ? 'Hủy đơn hàng đang chờ xác nhận' : 'Cancel pending order'}
                    >
                      <XCircle size={14} />
                      <span>{lang === 'vi' ? 'Hủy Đơn' : 'Cancel Order'}</span>
                    </button>
                  )}

                  {/* Informative status badge when confirmed / processing */}
                  {order.status === 'CONFIRMED' && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#00875a',
                        fontWeight: '700',
                        backgroundColor: '#e8f5e9',
                        border: '1px solid #c8e6c9',
                        padding: '6px 12px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>{lang === 'vi' ? 'Đã Xác Nhận' : 'Confirmed'}</span>
                    </span>
                  )}

                  {order.status === 'PACKING' && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#0052cc',
                        fontWeight: '700',
                        backgroundColor: '#deebff',
                        border: '1px solid #b3d4ff',
                        padding: '6px 12px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Package size={13} />
                      <span>{lang === 'vi' ? 'Đang Chuẩn Bị Hàng' : 'Packing'}</span>
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedOrderForReceipt(order)}
                    className="btn-uq btn-uq-outline-gray"
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    <Printer size={14} />
                    <span>{lang === 'vi' ? 'Xem hóa đơn' : 'Receipt'}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('order-success', { order })}
                    className="btn-uq btn-uq-primary"
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    <span>{lang === 'vi' ? 'Xem hành trình đơn' : 'Track Order'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        order={selectedOrderForReceipt}
      />

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={!!cancelModalOrder}
        title={lang === 'vi' ? 'Xác Nhận Hủy Đơn Hàng' : 'Cancel Order Confirmation'}
        message={lang === 'vi'
          ? `Bạn có chắc chắn muốn hủy đơn hàng ${cancelModalOrder?.orderNumber}? Sau khi hủy, toàn bộ sản phẩm sẽ được tự động hoàn lại vào kho.`
          : `Are you sure you want to cancel order ${cancelModalOrder?.orderNumber}? All items will be restocked to inventory.`}
        confirmText={lang === 'vi' ? 'Xác Nhận Hủy Đơn' : 'Confirm Cancellation'}
        cancelText={lang === 'vi' ? 'Đóng' : 'Close'}
        type="danger"
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelModalOrder(null)}
      />
    </div>
  );
};
