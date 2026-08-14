import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  Store as StoreIcon,
  CreditCard,
  QrCode,
  Wallet,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Lock,
  Sparkles,
  Award
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { isFeatureEnabled } from '../services/featureToggleService';
import api from '../services/api';

export const CheckoutPage = ({ onNavigate }) => {
  const { cart, fetchCart, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice, t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const items = cart?.items || [];
  const subTotal = cart?.subTotal || 0;

  // Checkout form states
  const [orderType, setOrderType] = useState('ONLINE_DELIVERY');
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [shippingCity, setShippingCity] = useState(user?.city || 'Cần Thơ');
  const [selectedStoreId, setSelectedStoreId] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('VIETQR');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const freeShippingThreshold = 500000;
  const standardShippingFee = 30000;
  const shippingFee = (orderType === 'IN_STORE_PICKUP' || subTotal >= freeShippingThreshold) ? 0 : standardShippingFee;
  const couponDiscount = appliedCoupon?.calculatedDiscount || 0;
  const availablePoints = user?.points || 1500;
  const pointsDiscountValue = (useLoyaltyPoints && isFeatureEnabled('loyaltyPoints')) ? Math.min(availablePoints * 100, subTotal * 0.3) : 0;
  const totalDiscount = couponDiscount + pointsDiscountValue;
  const finalAmount = Math.max(subTotal - totalDiscount + shippingFee, 0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        orderAmount: subTotal
      });
      setAppliedCoupon(res.data);
      showSuccess(`Áp dụng thành công mã "${res.data.code}"! Giảm ${formatPrice(res.data.calculatedDiscount)}`);
    } catch (err) {
      showError(err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setAppliedCoupon(null);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      showError('Giỏ hàng của bạn đang trống!');
      return;
    }

    if (!customerName || !customerPhone) {
      showError('Vui lòng điền họ tên và số điện thoại nhận hàng!');
      return;
    }

    if (orderType === 'ONLINE_DELIVERY' && !shippingAddress) {
      showError('Vui lòng điền địa chỉ nhận hàng!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderType,
        storeId: orderType === 'IN_STORE_PICKUP' ? selectedStoreId : null,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress: orderType === 'ONLINE_DELIVERY' ? shippingAddress : 'Nhận tại cửa hàng',
        shippingCity,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        notes,
        items: items.map((it) => ({ variantId: it.variantId, quantity: it.quantity }))
      };

      const res = await api.post('/orders', payload);
      await clearCart();
      await fetchCart();
      showSuccess('Đặt hàng thành công!');
      onNavigate('order-success', { order: res.data });
    } catch (err) {
      showError(err.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>{t('empty_cart')}</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Hãy chọn sản phẩm để tiến hành thanh toán.</p>
        <button onClick={() => onNavigate('products')} className="btn-uq btn-uq-primary">
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Header back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => onNavigate('home')} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Quay lại trang chủ
        </button>
      </div>

      <h1 className="heading-section" style={{ fontSize: '1.8rem', marginBottom: '32px', textTransform: 'uppercase' }}>
        Thanh Toán Đơn Hàng
      </h1>

      <form onSubmit={handleSubmitOrder}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Left Column: Delivery details & Payment method */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 1. Delivery Type Selection */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                1. Hình thức nhận hàng
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setOrderType('ONLINE_DELIVERY')}
                  style={{
                    padding: '16px',
                    border: orderType === 'ONLINE_DELIVERY' ? '2px solid #111' : '1px solid #ddd',
                    backgroundColor: orderType === 'ONLINE_DELIVERY' ? '#fafafa' : '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center'
                  }}
                >
                  <Truck size={24} color={orderType === 'ONLINE_DELIVERY' ? '#e60012' : '#666'} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Giao hàng tận nơi</span>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>Giao hàng tiêu chuẩn 2-3 ngày</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('IN_STORE_PICKUP')}
                  style={{
                    padding: '16px',
                    border: orderType === 'IN_STORE_PICKUP' ? '2px solid #111' : '1px solid #ddd',
                    backgroundColor: orderType === 'IN_STORE_PICKUP' ? '#fafafa' : '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'center'
                  }}
                >
                  <StoreIcon size={24} color={orderType === 'IN_STORE_PICKUP' ? '#e60012' : '#666'} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Nhận tại Cửa hàng (Click & Collect)</span>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>Miễn phí nhận tại quầy</span>
                </button>
              </div>
            </div>

            {/* 2. Customer & Shipping Info */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                2. Thông tin khách hàng & Địa chỉ
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Email nhận thông báo đơn hàng</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>

                {orderType === 'ONLINE_DELIVERY' ? (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Địa chỉ nhận hàng chi tiết *</label>
                      <input
                        type="text"
                        required
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Tỉnh / Thành phố *</label>
                      <select
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                      >
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Hải Phòng">Hải Phòng</option>
                        <option value="Bình Dương">Bình Dương</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Chọn cửa hàng nhận hàng *</label>
                    <select
                      value={selectedStoreId}
                      onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                    >
                      <option value={1}>BEO Vincom Xuân Khánh (Ninh Kiều, Cần Thơ)</option>
                      <option value={2}>BEO Landmark 81 (Bình Thạnh, TP.HCM)</option>
                      <option value={3}>BEO Vincom Bà Triệu (Hai Bà Trưng, Hà Nội)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Ghi chú đơn hàng (Tùy chọn)</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                3. Phương thức thanh toán
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    id: 'BANK_TRANSFER',
                    label: 'Chuyển khoản VietQR 24/7 (Khuyên dùng)',
                    icon: <QrCode size={20} color="#e60012" />,
                    desc: 'Tự động sinh mã QR khớp số tiền và mã đơn, hệ thống tự động xác nhận qua Webhook Napas'
                  },
                  {
                    id: 'COD',
                    label: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                    icon: <Truck size={20} color="#111" />,
                    desc: 'Thanh toán trực tiếp cho nhân viên giao hàng khi nhận'
                  },
                  {
                    id: 'VNPAY',
                    label: 'Cổng thanh toán VNPay Sandbox (Quét mã QR / Thẻ ATM)',
                    icon: <CreditCard size={20} color="#005baa" />,
                    desc: 'Thanh toán trực tuyến bảo mật qua cổng VNPay'
                  },
                  {
                    id: 'MOMO',
                    label: 'Ví Điện Tử MoMo',
                    icon: <Wallet size={20} color="#a50064" />,
                    desc: 'Thanh toán nhanh bằng ứng dụng ví điện tử MoMo'
                  },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      border: paymentMethod === pm.id ? '2px solid #111' : '1px solid #eee',
                      backgroundColor: paymentMethod === pm.id ? '#fafafa' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      style={{ accentColor: '#e60012' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      {pm.icon}
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{pm.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{pm.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div style={{
            position: 'sticky',
            top: '90px',
            backgroundColor: '#fafafa',
            padding: '24px',
            border: '1px solid #e5e5e5'
          }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
              Đơn hàng của bạn ({items.length} món)
            </div>

            {/* Items summary list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.imageUrl} alt={item.productName} style={{ width: '48px', height: '60px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: '700', color: '#111' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      {item.colorName} / Size {item.size} • SL: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                    {formatPrice(item.subTotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon input */}
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>MÃ GIẢM GIÁ / COUPON:</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="VD: BEO10, LIFEWEAR50K"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-uq btn-uq-primary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  {t('apply')}
                </button>
              </div>

              {appliedCoupon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00875a', fontSize: '0.8rem', fontWeight: '700', marginTop: '6px' }}>
                  <Tag size={14} />
                  <span>Đã giảm {formatPrice(couponDiscount)} ({appliedCoupon.code})</span>
                </div>
              )}

              {/* Loyalty Points Redemption */}
              {isFeatureEnabled('loyaltyPoints') && (
                <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '2px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700' }}>
                    <input
                      type="checkbox"
                      checked={useLoyaltyPoints}
                      onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                      style={{ accentColor: '#e60012', width: '16px', height: '16px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={16} color="#ffab00" />
                      <span>Dùng {availablePoints.toLocaleString()} điểm BEO Club</span>
                    </div>
                  </label>
                  {useLoyaltyPoints && (
                    <div style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: '700', marginTop: '4px', paddingLeft: '24px' }}>
                      ✓ Giảm trực tiếp {formatPrice(pointsDiscountValue)} vào đơn hàng
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Financial breakdown */}
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Tạm tính hàng:</span>
                <span style={{ fontWeight: '700' }}>{formatPrice(subTotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e60012' }}>
                  <span>Giảm giá mã khuyến mãi:</span>
                  <span style={{ fontWeight: '700' }}>-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              {pointsDiscountValue > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
                  <span>Giảm điểm thưởng BEO Club:</span>
                  <span style={{ fontWeight: '700' }}>-{formatPrice(pointsDiscountValue)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Phí vận chuyển:</span>
                <span style={{ fontWeight: '700' }}>
                  {shippingFee === 0 ? <span style={{ color: '#00875a' }}>Miễn phí</span> : formatPrice(shippingFee)}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid #111',
                paddingTop: '12px',
                marginTop: '6px',
                fontSize: '1.2rem',
                fontWeight: '900'
              }}>
                <span>TỔNG CỘNG:</span>
                <span style={{ color: '#e60012' }}>{formatPrice(finalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-uq btn-uq-red"
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', marginTop: '24px' }}
            >
              <Lock size={18} />
              <span>{loading ? 'Đang xử lý...' : t('place_order')}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', color: '#666' }}>
              <ShieldCheck size={16} color="#00875a" />
              <span>Bảo mật thanh toán SSL 256-bit chuẩn quốc tế</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
