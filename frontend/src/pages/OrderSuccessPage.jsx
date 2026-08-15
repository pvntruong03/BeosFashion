import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShoppingBag, Truck, MapPin, Printer, ArrowRight, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { VietQrPaymentCard } from '../components/VietQrPaymentCard';

export const OrderSuccessPage = ({ order: initialOrder, onNavigate }) => {
  const { formatPrice, lang } = useLanguage();
  const [order, setOrder] = useState(initialOrder);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
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
        <h2>{lang === 'vi' ? 'Không tìm thấy thông tin đơn hàng' : 'Order Information Not Found'}</h2>
        <button onClick={() => onNavigate('home')} className="btn-uq btn-uq-primary" style={{ marginTop: '16px' }}>
          {lang === 'vi' ? 'Về trang chủ' : 'Return to Home'}
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
    { title: lang === 'vi' ? 'Đặt hàng' : 'Placed', desc: lang === 'vi' ? 'Đã nhận đơn' : 'Received', active: true, done: true },
    {
      title: lang === 'vi' ? 'Xác nhận' : 'Confirmed',
      desc: order.status === 'CONFIRMED' || order.status === 'PACKING' || order.status === 'SHIPPING' || order.status === 'DELIVERED'
        ? (lang === 'vi' ? 'Đã thanh toán' : 'Paid')
        : (lang === 'vi' ? 'Chờ thanh toán' : 'Pending'),
      active: true,
      done: order.status === 'CONFIRMED' || order.status === 'PACKING' || order.status === 'SHIPPING' || order.status === 'DELIVERED'
    },
    {
      title: lang === 'vi' ? 'Đóng gói' : 'Packing',
      desc: lang === 'vi' ? 'Đang chuẩn bị hàng' : 'Processing',
      active: order.status === 'PACKING' || order.status === 'SHIPPING' || order.status === 'DELIVERED',
      done: order.status === 'SHIPPING' || order.status === 'DELIVERED'
    },
    {
      title: lang === 'vi' ? 'Vận chuyển' : 'Shipping',
      desc: lang === 'vi' ? 'Bàn giao shipper' : 'In Transit',
      active: order.status === 'SHIPPING' || order.status === 'DELIVERED',
      done: order.status === 'DELIVERED'
    },
    {
      title: lang === 'vi' ? 'Hoàn tất' : 'Delivered',
      desc: lang === 'vi' ? 'Đã nhận hàng' : 'Completed',
      active: order.status === 'DELIVERED' || order.status === 'COMPLETED',
      done: order.status === 'DELIVERED' || order.status === 'COMPLETED'
    },
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

        <span className="badge-uq red" style={{ marginBottom: '8px' }}>
          {lang === 'vi' ? 'ĐẶT HÀNG THÀNH CÔNG' : 'ORDER PLACED SUCCESSFULLY'}
        </span>
        <h1 className="heading-display" style={{ fontSize: '2rem', marginTop: '6px', marginBottom: '8px' }}>
          {lang === 'vi' ? 'Cảm ơn bạn đã mua sắm tại BEO STORE!' : 'Thank you for shopping at BEO STORE!'}
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#666' }}>
          {lang === 'vi' ? 'Mã đơn hàng:' : 'Order Number:'} <strong style={{ color: '#111', fontSize: '1.1rem' }}>{order.orderNumber}</strong>
        </p>
      </div>

      {/* VietQR Payment Card (For Bank Transfer / Online QR payments) */}
      {(order.payment?.paymentMethod === 'BANK_TRANSFER' || order.payment?.paymentMethod === 'VNPAY' || order.payment?.paymentStatus === 'PENDING') && (
        <VietQrPaymentCard order={order} onPaymentConfirmed={handlePaymentConfirmed} />
      )}

      {/* Timeline Status Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', padding: '28px', marginBottom: '32px' }}>
        <div style={{ fontWeight: '800', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '24px', textAlign: 'center' }}>
          {lang === 'vi' ? 'TIẾN ĐỘ XỬ LÝ ĐƠN HÀNG' : 'ORDER FULFILLMENT STATUS'}
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
            <div style={{ fontSize: '0.8rem', color: '#777', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
              {lang === 'vi' ? 'Người nhận hàng:' : 'Recipient:'}
            </div>
            <div style={{ fontWeight: '700' }}>{order.customerName}</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{order.customerPhone}</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{order.customerEmail}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#777', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
              {lang === 'vi' ? 'Địa chỉ giao hàng:' : 'Delivery Address:'}
            </div>
            <div style={{ fontWeight: '700' }}>{order.shippingAddress}</div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{order.shippingCity}</div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
              {lang === 'vi' ? 'Phương thức:' : 'Payment:'} <strong>{order.payment?.paymentMethod || 'Bank Transfer / Cash'}</strong>
            </div>
          </div>
        </div>

        {/* Ordered items */}
        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '12px' }}>
            {lang === 'vi' ? 'SẢN PHẨM ĐÃ ĐẶT:' : 'ORDERED ITEMS:'}
          </div>
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
          <span>{lang === 'vi' ? 'TỔNG THANH TOÁN:' : 'ORDER TOTAL:'}</span>
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
          <span>{lang === 'vi' ? 'In Hóa Đơn Điện Tử' : 'Print E-Receipt'}</span>
        </button>

        <button
          onClick={() => onNavigate('orders')}
          className="btn-uq btn-uq-secondary"
          style={{ padding: '12px 24px' }}
        >
          <span>{lang === 'vi' ? 'Xem Lịch Sử Đơn Hàng' : 'View Order History'}</span>
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="btn-uq btn-uq-red"
          style={{ padding: '12px 24px' }}
        >
          <span>{lang === 'vi' ? 'Tiếp tục Mua sắm' : 'Continue Shopping'}</span>
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
