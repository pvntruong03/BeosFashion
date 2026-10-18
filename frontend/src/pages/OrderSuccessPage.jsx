import React, { useEffect, useState } from 'react';
import { CheckCircle2, Printer, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import { ReceiptModal } from '../components/ReceiptModal';
import { VietQrPaymentCard } from '../components/VietQrPaymentCard';
import api from '../services/api';

const getParamFromHashOrSearch = (key) => {
  try {
    const hash = window.location.hash || '';
    const queryIdx = hash.indexOf('?');
    if (queryIdx !== -1) {
      const params = new URLSearchParams(hash.substring(queryIdx));
      if (params.get(key)) return params.get(key);
    }
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(key);
  } catch {
    return null;
  }
};

const readSavedOrder = (orderNumber) => {
  if (!orderNumber) return null;
  const cleanNumber = orderNumber.trim().replace(/\s+/g, '-').toUpperCase();
  try {
    const saved = sessionStorage.getItem(`beo_order_${cleanNumber}`) || sessionStorage.getItem(`beo_order_${orderNumber}`);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const OrderSuccessPage = ({ order: initialOrder, orderNumber: propOrderNumber, onNavigate }) => {
  const { formatPrice, lang } = useLanguage();
  
  const resolvedOrderNumber = (
    propOrderNumber ||
    getParamFromHashOrSearch('orderNumber') ||
    initialOrder?.orderNumber ||
    ''
  ).trim().replace(/\s+/g, '-').toUpperCase();

  const [order, setOrder] = useState(() => (
    readSavedOrder(resolvedOrderNumber) || initialOrder || null
  ));
  const [isLoadingOrder, setIsLoadingOrder] = useState(!order && Boolean(resolvedOrderNumber));
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // If order was not in session storage (e.g. direct URL visit or refreshed), fetch from public tracking API
  useEffect(() => {
    if (!order && resolvedOrderNumber) {
      setIsLoadingOrder(true);
      api.get(`/orders/track/${encodeURIComponent(resolvedOrderNumber)}`)
        .then((res) => {
          const orderData = res?.data || res;
          if (orderData && orderData.orderNumber) {
            setOrder(orderData);
            sessionStorage.setItem(`beo_order_${orderData.orderNumber}`, JSON.stringify(orderData));
          }
        })
        .catch((err) => {
          console.debug('Failed to fetch order details from tracking API:', err.message);
        })
        .finally(() => {
          setIsLoadingOrder(false);
        });
    }
  }, [order, resolvedOrderNumber]);

  useEffect(() => {
    const currentOrder = order || initialOrder;
    if (!currentOrder?.orderNumber) return;

    const cleanNum = currentOrder.orderNumber.trim().replace(/\s+/g, '-').toUpperCase();
    sessionStorage.setItem(`beo_order_${cleanNum}`, JSON.stringify(currentOrder));

    const currentHashParam = getParamFromHashOrSearch('orderNumber');
    if (!currentHashParam || currentHashParam !== cleanNum) {
      const nextHash = `#/order-success?orderNumber=${encodeURIComponent(cleanNum)}`;
      window.history.replaceState(null, '', nextHash);
    }
  }, [initialOrder, order]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      console.log('Confetti effect');
    }
  }, []);

  if (isLoadingOrder) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <Loader2 size={40} className="spin" style={{ margin: '0 auto 16px auto', animation: 'spin 1.5s linear infinite', color: '#e60012' }} />
        <h3>{lang === 'vi' ? 'Đang tải thông tin đơn hàng...' : 'Loading order details...'}</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>{lang === 'vi' ? 'Không tìm thấy thông tin đơn hàng' : 'Order Information Not Found'}</h2>
        <button onClick={() => onNavigate('home')} className="btn-beo btn-beo-primary" style={{ marginTop: '16px' }}>
          {lang === 'vi' ? 'Về trang chủ' : 'Return to Home'}
        </button>
      </div>
    );
  }

  const handlePaymentConfirmed = (updatedOrder) => {
    if (updatedOrder) {
      setOrder(updatedOrder);
      sessionStorage.setItem(`beo_order_${updatedOrder.orderNumber}`, JSON.stringify(updatedOrder));
    } else {
      setOrder((prev) => {
        const nextOrder = {
          ...prev,
          status: 'CONFIRMED',
          payment: {
            ...prev?.payment,
            paymentStatus: 'SUCCESS'
          }
        };
        sessionStorage.setItem(`beo_order_${nextOrder.orderNumber}`, JSON.stringify(nextOrder));
        return nextOrder;
      });
    }
  };

  const isConfirmedOrPaid = order.status === 'CONFIRMED' || order.payment?.paymentStatus === 'SUCCESS';

  const steps = [
    { title: lang === 'vi' ? 'Đặt hàng' : 'Placed', desc: lang === 'vi' ? 'Đã nhận đơn' : 'Received', active: true, done: true },
    {
      title: lang === 'vi' ? 'Xác nhận' : 'Confirmed',
      desc: isConfirmedOrPaid || ['PACKING', 'SHIPPING', 'DELIVERED'].includes(order.status)
        ? (lang === 'vi' ? 'Đã thanh toán' : 'Paid')
        : (lang === 'vi' ? 'Chờ thanh toán' : 'Pending'),
      active: true,
      done: isConfirmedOrPaid || ['PACKING', 'SHIPPING', 'DELIVERED'].includes(order.status)
    },
    {
      title: lang === 'vi' ? 'Đóng gói' : 'Packing',
      desc: lang === 'vi' ? 'Đang chuẩn bị hàng' : 'Processing',
      active: ['PACKING', 'SHIPPING', 'DELIVERED'].includes(order.status),
      done: ['SHIPPING', 'DELIVERED'].includes(order.status)
    },
    {
      title: lang === 'vi' ? 'Vận chuyển' : 'Shipping',
      desc: lang === 'vi' ? 'Bàn giao shipper' : 'In Transit',
      active: ['SHIPPING', 'DELIVERED'].includes(order.status),
      done: order.status === 'DELIVERED'
    },
    {
      title: lang === 'vi' ? 'Hoàn tất' : 'Delivered',
      desc: lang === 'vi' ? 'Đã nhận hàng' : 'Completed',
      active: ['DELIVERED', 'COMPLETED'].includes(order.status),
      done: ['DELIVERED', 'COMPLETED'].includes(order.status)
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

        <span className="badge-beo red" style={{ marginBottom: '8px' }}>
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
      {(['BANK_TRANSFER', 'VIETQR'].includes(order.payment?.paymentMethod)) && (
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
          className="btn-beo btn-beo-primary"
          style={{ padding: '12px 24px' }}
        >
          <Printer size={16} />
          <span>{lang === 'vi' ? 'In Hóa Đơn Điện Tử' : 'Print E-Receipt'}</span>
        </button>

        <button
          onClick={() => onNavigate('orders')}
          className="btn-beo btn-beo-secondary"
          style={{ padding: '12px 24px' }}
        >
          <span>{lang === 'vi' ? 'Xem Lịch Sử Đơn Hàng' : 'View Order History'}</span>
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="btn-beo btn-beo-red"
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
