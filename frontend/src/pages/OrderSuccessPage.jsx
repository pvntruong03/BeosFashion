import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShoppingBag, Truck, MapPin, Printer, ArrowRight, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { VietQrPaymentCard } from '../components/VietQrPaymentCard';

export const OrderSuccessPage = ({ order: initialOrder, onNavigate }) => {
  const { formatPrice } = useLanguage();
  const [order, setOrder] = useState(initialOrder);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti effect');
    }
  }, []);

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Không tìm thấy thông tin đơn hàng</h2>
        <button onClick={() => onNavigate('home')} className="btn-uq btn-uq-primary" style={{ marginTop: '16px' }}>
          Về trang chủ
        </button>
      </div>
    );
  }

  const handlePaymentConfirmed = (updatedOrder) => {
    if (updatedOrder) {
      setOrder(updatedOrder);
    } else {
      setOrder((prev) => ({
        ...prev,
        status: 'CONFIRMED',
        payment: {
          ...prev.payment,
          paymentStatus: 'SUCCESS'
        }
      }));
    }
  };

  const steps = [
    { title: 'Đặt hàng', desc: 'Đã nhận đơn', active: true, done: true },
    { title: 'Xác nhận', desc: order.status === 'CONFIRMED' || order.status === 'PACKING' || order.status === 'SHIPPING' || order.status === 'DELIVERED' ? 'Đã thanh toán' : 'Chờ thanh toán', active: true, done: order.status === 'CONFIRMED' || order.status === 'PACKING' || order.status === 'SHIPPING' || order.status === 'DELIVERED' },
    { title: 'Đóng gói', desc: 'Đang chuẩn bị hàng', active: order.status === 'PACKING' || order.status === 'SHIPPING' || order.status === 'DELIVERED', done: order.status === 'SHIPPING' || order.status === 'DELIVERED' },
    { title: 'Vận chuyển', desc: 'Bàn giao shipper', active: order.status === 'SHIPPING' || order.status === 'DELIVERED', done: order.status === 'DELIVERED' },
    { title: 'Hoàn tất', desc: 'Đã nhận hàng', active: order.status === 'DELIVERED' || order.status === 'COMPLETED', done: order.status === 'DELIVERED' || order.status === 'COMPLETED' },
  ];

  return (
    <div className="container" style={{ padding: '48px 24px', maxWidth: '840px' }}>
      {/* Celebration Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <CheckCircle2 size={42} />
        </div>

        <span className="badge-uq red" style={{ marginBottom: '8px' }}>ĐẶT HÀNG THÀNH CÔNG</span>
        <h1 className="heading-display" style={{ fontSize: '2rem', marginTop: '6px', marginBottom: '8px' }}>
          Cảm ơn bạn đã mua sắm tại BEO!
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#666' }}>
          Mã đơn hàng: <strong style={{ color: '#111', fontSize: '1.1rem' }}>{order.orderNumber}</strong>
        </p>
      </div>

      {/* VietQR Payment Card (For Bank Transfer / Online QR payments) */}
      {(order.payment?.paymentMethod === 'BANK_TRANSFER' || order.payment?.paymentMethod === 'VNPAY' || order.payment?.paymentStatus === 'PENDING') && (
        <VietQrPaymentCard order={order} onPaymentConfirmed={handlePaymentConfirmed} />
      )}

      {/* Timeline Status Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', padding: '28px', marginBottom: '32px' }}>
        <div style={{ fontWeight: '800', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '24px', textAlign: 'center' }}>
          TIẾN ĐỘ XỬ LÝ ĐƠN HÀNG
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {/* Progress bar background line */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '30px',
            right: '30px',
            height: '2px',
            backgroundColor: '#e5e5e5',
            zIndex: 1
          }} />

          {steps.map((st, idx) => (
            <div key={idx} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '80px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: st.done ? '#111' : (st.active ? '#e60012' : '#f0f0f0'),
                color: st.active || st.done ? '#fff' : '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.8rem',
                marginBottom: '8px'
              }}>
                {st.done ? '✓' : idx + 1}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#111' }}>{st.title}</div>
              <div style={{ fontSize: '0.72rem', color: '#777' }}>{st.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5', padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#777', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Người nhận hàng:</div>
            <div style={{ fontWeight: '700' }}>{order.customerName}</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{order.customerPhone}</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{order.customerEmail}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#777', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Địa chỉ giao hàng:</div>
            <div style={{ fontWeight: '700' }}>{order.shippingAddress}</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{order.shippingCity}</div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
              Phương thức: <strong>{order.payment?.paymentMethod || 'VNPay / Tiền mặt'}</strong>
            </div>
          </div>
        </div>

        {/* Ordered items */}
        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '12px' }}>SẢN PHẨM ĐÃ ĐẶT:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {order.items?.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div>
                  <strong>{it.productName}</strong> ({it.color} / Size {it.size}) × {it.quantity}
                </div>
                <div style={{ fontWeight: '700' }}>{formatPrice(it.subTotal)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final amount */}
        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.1rem', fontWeight: '900' }}>
          <span>TỔNG THANH TOÁN:</span>
          <span style={{ color: '#e60012' }}>{formatPrice(order.finalAmount)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setIsReceiptOpen(true)}
          className="btn-uq btn-uq-primary"
          style={{ padding: '12px 24px' }}
        >
          <Printer size={16} />
          <span>In Hóa Đơn Điện Tử</span>
        </button>

        <button
          onClick={() => onNavigate('orders')}
          className="btn-uq btn-uq-secondary"
          style={{ padding: '12px 24px' }}
        >
          <span>Xem Lịch Sử Đơn Hàng</span>
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="btn-uq btn-uq-red"
          style={{ padding: '12px 24px' }}
        >
          <span>Tiếp tục Mua sắm</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Thermal receipt modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={order}
      />
    </div>
  );
};
