import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  Store as StoreIcon,
  CreditCard,
  QrCode,
  Wallet,
  Tag,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

export const CheckoutPage = ({ onNavigate }) => {
  const { cart, fetchCart, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice, t, lang } = useLanguage();
  const { showSuccess, showError } = useToast();

  const items = cart?.items || [];
  const subTotal = cart?.subTotal || 0;

  // Checkout form states
  const [orderType, setOrderType] = useState('ONLINE_DELIVERY');
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [shippingCity, setShippingCity] = useState(user?.city || 'Can Tho');
  const [selectedStoreId, setSelectedStoreId] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const freeShippingThreshold = 500000;
  const standardShippingFee = 30000;
  const shippingFee = (orderType === 'IN_STORE_PICKUP' || subTotal >= freeShippingThreshold) ? 0 : standardShippingFee;
  const couponDiscount = appliedCoupon?.calculatedDiscount || 0;
  const finalAmount = Math.max(subTotal - couponDiscount + shippingFee, 0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        orderAmount: subTotal
      });
      setAppliedCoupon(res.data);
      showSuccess(lang === 'vi' ? `Áp dụng thành công mã "${res.data.code}"! Giảm ${formatPrice(res.data.calculatedDiscount)}` : `Promo code "${res.data.code}" applied! Discount ${formatPrice(res.data.calculatedDiscount)}`);
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Mã giảm giá không hợp lệ hoặc đã hết hạn' : 'Invalid or expired promo code'));
      setAppliedCoupon(null);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      showError(lang === 'vi' ? 'Giỏ hàng của bạn đang trống!' : 'Your shopping bag is empty!');
      return;
    }

    if (!customerName || !customerPhone) {
      showError(lang === 'vi' ? 'Vui lòng điền họ tên và số điện thoại nhận hàng!' : 'Please enter recipient name and phone number!');
      return;
    }

    if (orderType === 'ONLINE_DELIVERY' && !shippingAddress) {
      showError(lang === 'vi' ? 'Vui lòng điền địa chỉ nhận hàng!' : 'Please enter shipping address!');
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
        shippingAddress: orderType === 'ONLINE_DELIVERY' ? shippingAddress : 'In-Store Pickup',
        shippingCity,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        notes,
        items: items.map((it) => ({ variantId: it.variantId, quantity: it.quantity }))
      };

      const res = await api.post('/orders', payload);
      await clearCart();
      await fetchCart();
      showSuccess(lang === 'vi' ? 'Đặt hàng thành công!' : 'Order placed successfully!');
      if (res.data?.orderNumber) {
        sessionStorage.setItem(`beo_order_${res.data.orderNumber}`, JSON.stringify(res.data));
      }
      onNavigate('order-success', { order: res.data, orderNumber: res.data?.orderNumber });
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi tạo đơn hàng' : 'Failed to place order'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>{t('empty_cart')}</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>{lang === 'vi' ? 'Hãy chọn sản phẩm để tiến hành thanh toán.' : 'Please add items to your shopping bag to checkout.'}</p>
        <button onClick={() => onNavigate('products')} className="btn-beo btn-beo-primary">
          {lang === 'vi' ? 'Tiếp tục mua sắm' : 'Continue Shopping'}
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Header back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => onNavigate('home')} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '0.85rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> {lang === 'vi' ? 'Quay lại trang chủ' : 'Back to Home'}
        </button>
      </div>

      <h1 className="heading-section" style={{ fontSize: '1.8rem', marginBottom: '32px', textTransform: 'uppercase' }}>
        {lang === 'vi' ? 'Thanh Toán Đơn Hàng' : 'Checkout & Order Confirmation'}
      </h1>

      <form onSubmit={handleSubmitOrder}>
        <div className="checkout-layout">
          {/* Left Column: Delivery details & Payment method */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 1. Delivery Type Selection */}
            <div className="checkout-card" style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                {lang === 'vi' ? '1. Hình thức nhận hàng' : '1. Delivery Method'}
              </div>

              <div className="checkout-delivery-grid">
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
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Truck size={24} color={orderType === 'ONLINE_DELIVERY' ? '#e60012' : '#666'} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'vi' ? 'Giao hàng tận nơi' : 'Home Delivery'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>{lang === 'vi' ? 'Giao hàng tiêu chuẩn 2-3 ngày' : 'Standard shipping 2-3 business days'}</span>
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
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <StoreIcon size={24} color={orderType === 'IN_STORE_PICKUP' ? '#e60012' : '#666'} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'vi' ? 'Nhận tại Cửa hàng (Click & Collect)' : 'Click & Collect In-Store'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>{lang === 'vi' ? 'Miễn phí nhận tại quầy' : 'Free in-store pickup within 2h'}</span>
                </button>
              </div>
            </div>

            {/* 2. Customer & Shipping Info */}
            <div className="checkout-card" style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                {lang === 'vi' ? '2. Thông tin khách hàng & Địa chỉ' : '2. Contact & Delivery Details'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="checkout-contact-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Họ và tên *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Johnson"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Số điện thoại *' : 'Phone Number *'}
                    </label>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Email nhận thông báo đơn hàng' : 'Email Address for Order Confirmation'}
                  </label>
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
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                        {lang === 'vi' ? 'Địa chỉ nhận hàng chi tiết *' : 'Street Address & Apartment *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'vi' ? 'Số nhà, tên đường, phường/xã, quận/huyện...' : 'Street name, house number, ward, district...'}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                        {lang === 'vi' ? 'Tỉnh / Thành phố *' : 'City / Province *'}
                      </label>
                      <select
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                      >
                        <option value="Can Tho">Can Tho</option>
                        <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                        <option value="Ha Noi">Ha Noi</option>
                        <option value="Da Nang">Da Nang</option>
                        <option value="Hai Phong">Hai Phong</option>
                        <option value="Binh Duong">Binh Duong</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                      {lang === 'vi' ? 'Chọn cửa hàng nhận hàng *' : 'Select Pickup Flagship Store *'}
                    </label>
                    <select
                      value={selectedStoreId}
                      onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                    >
                      <option value={1}>BEO Vincom Xuan Khanh (Ninh Kieu, Can Tho)</option>
                      <option value={2}>BEO Landmark 81 (Binh Thanh, HCMC)</option>
                      <option value={3}>BEO Vincom Ba Trieu (Hai Ba Trung, Hanoi)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Ghi chú đơn hàng (Tùy chọn)' : 'Delivery Notes (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={lang === 'vi' ? 'VD: Giao giờ hành chính, gọi trước khi giao...' : 'e.g. Leave at front door, call before arrival...'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="checkout-card" style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                {lang === 'vi' ? '3. Phương thức thanh toán' : '3. Payment Method'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    id: 'BANK_TRANSFER',
                    label: 'VietQR',
                    icon: <QrCode size={20} color="#e60012" />,
                    desc: lang === 'vi' ? 'Quét mã QR để chuyển khoản với số tiền và nội dung được điền sẵn' : 'Scan the QR code to transfer with the amount and reference filled automatically'
                  },
                  {
                    id: 'COD',
                    label: lang === 'vi' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' : 'Cash on Delivery (COD)',
                    icon: <Truck size={20} color="#111" />,
                    desc: lang === 'vi' ? 'Thanh toán trực tiếp cho nhân viên giao hàng khi nhận' : 'Pay in cash directly to the courier upon delivery'
                  },
                  {
                    id: 'VNPAY',
                    label: 'VNPay',
                    icon: <CreditCard size={20} color="#005baa" />,
                    desc: lang === 'vi' ? 'Thanh toán trực tuyến qua cổng VNPay' : 'Online payment through the VNPay gateway'
                  },
                  {
                    id: 'MOMO',
                    label: lang === 'vi' ? 'Ví MoMo' : 'MoMo Wallet',
                    icon: <Wallet size={20} color="#a50064" />,
                    desc: lang === 'vi' ? 'Thanh toán nhanh qua ví điện tử MoMo' : 'Fast payment through the MoMo e-wallet'
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
          <div className="checkout-summary" style={{
            position: 'sticky',
            top: '90px',
            backgroundColor: '#fafafa',
            padding: '24px',
            border: '1px solid #e5e5e5'
          }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'vi' ? `Đơn hàng của bạn (${items.length} món)` : `Order Summary (${items.length} items)`}
            </div>

            {/* Items summary list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.imageUrl} alt={item.productName} style={{ width: '48px', height: '60px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: '700', color: '#111' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      {item.colorName} / Size {item.size} • Qty: {item.quantity}
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
              <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                {lang === 'vi' ? 'MÃ GIẢM GIÁ / PROMO CODE:' : 'PROMO CODE / COUPON:'}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="e.g. BEO10, BEO50K"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #ccc', outline: 'none', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-beo btn-beo-primary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  {t('apply')}
                </button>
              </div>

              {appliedCoupon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00875a', fontSize: '0.8rem', fontWeight: '700', marginTop: '6px' }}>
                  <Tag size={14} />
                  <span>{lang === 'vi' ? `Đã giảm ${formatPrice(couponDiscount)} (${appliedCoupon.code})` : `Saved ${formatPrice(couponDiscount)} with (${appliedCoupon.code})`}</span>
                </div>
              )}

            </div>

            {/* Financial breakdown */}
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>{t('subtotal')}:</span>
                <span style={{ fontWeight: '700' }}>{formatPrice(subTotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e60012' }}>
                  <span>{lang === 'vi' ? 'Giảm giá mã khuyến mãi:' : 'Promo Discount:'}</span>
                  <span style={{ fontWeight: '700' }}>-{formatPrice(couponDiscount)}</span>
                </div>
              )}


              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>{t('shipping_fee')}:</span>
                <span style={{ fontWeight: '700' }}>
                  {shippingFee === 0 ? <span style={{ color: '#00875a' }}>{lang === 'vi' ? 'Miễn phí' : 'Free'}</span> : formatPrice(shippingFee)}
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
                <span>{t('total')}:</span>
                <span style={{ color: '#e60012' }}>{formatPrice(finalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-beo btn-beo-red"
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', marginTop: '24px' }}
            >
              <Lock size={18} />
              <span>{loading ? (lang === 'vi' ? 'Đang xử lý...' : 'Processing...') : t('place_order')}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', color: '#666' }}>
              <ShieldCheck size={16} color="#00875a" />
              <span>{lang === 'vi' ? 'Bảo mật thanh toán SSL 256-bit chuẩn quốc tế' : '256-bit SSL encrypted & secure checkout'}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
