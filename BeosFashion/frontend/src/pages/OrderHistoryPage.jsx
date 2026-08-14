import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Calendar, Clock, Printer, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ReceiptModal } from '../components/ReceiptModal';
import api from '../services/api';

export const OrderHistoryPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { formatPrice } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
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
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#e60012" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Vui lòng đăng nhập</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Đăng nhập để theo dõi lịch sử đơn hàng và nhận thông báo vận chuyển.</p>
        <button onClick={() => onNavigate('login')} className="btn-uq btn-uq-primary">
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge-uq gray">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="badge-uq black">Đã xác nhận</span>;
      case 'PACKING':
        return <span className="badge-uq" style={{ backgroundColor: '#ffab00', color: '#000' }}>Đang đóng gói</span>;
      case 'SHIPPING':
        return <span className="badge-uq" style={{ backgroundColor: '#0052cc', color: '#fff' }}>Đang giao hàng</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="badge-uq" style={{ backgroundColor: '#00875a', color: '#fff' }}>Đã giao thành công</span>;
      case 'CANCELLED':
        return <span className="badge-uq red">Đã hủy</span>;
      default:
        return <span className="badge-uq gray">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '1000px' }}>
      <h1 className="heading-section" style={{ fontSize: '1.8rem', marginBottom: '8px', textTransform: 'uppercase' }}>
        Lịch Sử Đơn Hàng Của Bạn
      </h1>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '32px' }}>
        Theo dõi trạng thái giao nhận và quản lý các đơn hàng đã mua
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải danh sách đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
          <Package size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Bạn chưa có đơn hàng nào</h3>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>Hãy khám phá các sản phẩm LifeWear mới nhất của Uniqlo!</p>
          <button onClick={() => onNavigate('products')} className="btn-uq btn-uq-primary">
            Khám phá mua sắm ngay
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
                    <span>{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}</span>
                    <span>•</span>
                    <span>{order.orderType === 'POS_IN_STORE' ? 'Bán tại quầy' : 'Giao hàng tận nơi'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Tổng thanh toán:</div>
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
                        Màu: {it.color} | Size: <strong>{it.size}</strong> | Số lượng: {it.quantity}
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
                  Địa chỉ giao: <strong>{order.shippingAddress}</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setSelectedOrderForReceipt(order)}
                    className="btn-uq btn-uq-outline-gray"
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    <Printer size={14} />
                    <span>Xem hóa đơn</span>
                  </button>

                  <button
                    onClick={() => onNavigate('order-success', { order })}
                    className="btn-uq btn-uq-primary"
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    <span>Xem hành trình đơn</span>
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
    </div>
  );
};
