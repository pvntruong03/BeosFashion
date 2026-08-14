import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, RefreshCw, ShieldCheck, CheckCircle2, Sparkles, Building, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

export const VietQrPaymentCard = ({ order, onPaymentConfirmed }) => {
  const { formatPrice } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [copiedField, setCopiedField] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isPaid, setIsPaid] = useState(order?.payment?.paymentStatus === 'SUCCESS');
  const [isSimulating, setIsSimulating] = useState(false);

  const qrData = order?.vietQr || {
    bankId: 'vietinbank',
    bankName: 'VietinBank (Ngân hàng TMCP Công Thương Việt Nam)',
    accountNo: '113366668888',
    accountName: 'BEO FASHION VIETNAM',
    amount: order?.finalAmount || 0,
    transferContent: `Thanh toan don hang ${order?.orderNumber}`,
    qrImageUrl: `https://img.vietqr.io/image/vietinbank-113366668888-compact2.png?amount=${Math.round(order?.finalAmount || 0)}&addInfo=Thanh+toan+don+hang+${order?.orderNumber}&accountName=BEO+FASHION+VIETNAM`
  };

  const copyToClipboard = (text, fieldName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showSuccess(`Đã sao chép ${fieldName}!`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Real-time Polling for payment status
  useEffect(() => {
    if (isPaid || !order?.orderNumber) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/payments/vietqr/${order.orderNumber}/status`);
        if (res.data && res.data.isPaid) {
          setIsPaid(true);
          setIsPolling(false);
          clearInterval(interval);
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch (e) {}
          showSuccess('Hệ thống đã nhận được chuyển khoản! Đơn hàng được xác nhận.');
          if (onPaymentConfirmed) onPaymentConfirmed();
        }
      } catch (err) {
        // Silent error during polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaid, order?.orderNumber, onPaymentConfirmed, showSuccess]);

  // Simulate payment (SePay/Casso/Bank webhook)
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post('/payments/vietqr/simulate-transfer', {
        orderNumber: order.orderNumber,
        amount: order.finalAmount,
        transactionRef: 'SEPAY-' + Math.floor(100000 + Math.random() * 900000)
      });
      setIsPaid(true);
      setIsPolling(false);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
      } catch (e) {}
      showSuccess('Giả lập chuyển khoản thành công! Đơn hàng đã được xác nhận.');
      if (onPaymentConfirmed) onPaymentConfirmed(res.data?.data);
    } catch (err) {
      showError(err.message || 'Lỗi khi giả lập chuyển khoản');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: isPaid ? '2px solid #00875a' : '2px solid #e60012',
      boxShadow: 'var(--shadow-md)',
      padding: '24px',
      borderRadius: '2px',
      margin: '20px 0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        paddingBottom: '14px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: isPaid ? '#00875a' : '#e60012',
            color: '#fff',
            padding: '6px 8px',
            fontWeight: '900',
            fontSize: '0.85rem'
          }}>
            VietQR
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, textTransform: 'uppercase' }}>
              {isPaid ? 'THANH TOÁN THÀNH CÔNG' : 'QUÉT MÃ VIETQR ĐỂ THANH TOÁN TỰ ĐỘNG'}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>
              Chuẩn Napas247 • Tự động xác nhận sau 2-5 giây
            </div>
          </div>
        </div>

        {isPaid ? (
          <span className="badge-uq" style={{ backgroundColor: '#00875a', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> ĐÃ THANH TOÁN
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#e60012', fontWeight: '700' }}>
            <RefreshCw size={14} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
            <span>Đang chờ chuyển khoản...</span>
          </div>
        )}
      </div>

      {isPaid ? (
        /* Success State */
        <div style={{ textAlign: 'center', padding: '24px 10px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#e8f5e9',
            color: '#00875a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <CheckCircle2 size={38} />
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111', marginBottom: '6px' }}>
            Giao Dịch Đã Khớp Hoàn Toàn!
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#555' }}>
            Hệ thống ngân hàng đã xác nhận thanh toán số tiền <strong>{formatPrice(order.finalAmount)}</strong> cho đơn hàng <strong>{order.orderNumber}</strong>.
          </p>
        </div>
      ) : (
        /* QR Code & Bank Transfer Details */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}>
          {/* Left: Dynamic QR Code Image */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#fafafa',
            padding: '16px',
            border: '1px solid #eee'
          }}>
            <img
              src={qrData.qrImageUrl}
              alt="Mã QR Chuyển Khoản VietQR"
              style={{
                width: '260px',
                height: 'auto',
                maxWidth: '100%',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                padding: '8px'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '10px', textAlign: 'center' }}>
              Mở App Ngân hàng bất kỳ hoặc Ví MoMo/ZaloPay<br />để quét mã chuyển khoản tự động khớp số tiền
            </div>
          </div>

          {/* Right: Bank Account Breakdown & Copy Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            {/* Bank Name */}
            <div style={{ padding: '8px 12px', backgroundColor: '#fcfcfc', border: '1px solid #eee' }}>
              <div style={{ fontSize: '0.72rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>Ngân hàng thụ hưởng</div>
              <div style={{ fontWeight: '800', color: '#111', marginTop: '2px' }}>{qrData.bankName}</div>
            </div>

            {/* Account Number */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: '#fcfcfc',
              border: '1px solid #eee'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>Số tài khoản</div>
                <div style={{ fontWeight: '900', color: '#111', fontSize: '1rem', fontFamily: 'monospace' }}>{qrData.accountNo}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(qrData.accountNo, 'Số tài khoản')}
                className="btn-uq btn-uq-outline-gray"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedField === 'Số tài khoản' ? <Check size={12} color="#00875a" /> : <Copy size={12} />}
                <span>{copiedField === 'Số tài khoản' ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Account Name */}
            <div style={{ padding: '8px 12px', backgroundColor: '#fcfcfc', border: '1px solid #eee' }}>
              <div style={{ fontSize: '0.72rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>Chủ tài khoản</div>
              <div style={{ fontWeight: '800', color: '#111', marginTop: '2px' }}>{qrData.accountName}</div>
            </div>

            {/* Exact Amount */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: '#fff9f9',
              border: '1px solid #ffd2d2'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#e60012', textTransform: 'uppercase', fontWeight: '700' }}>Số tiền chính xác</div>
                <div style={{ fontWeight: '900', color: '#e60012', fontSize: '1.1rem' }}>{formatPrice(order.finalAmount)}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(String(Math.round(order.finalAmount)), 'Số tiền')}
                className="btn-uq btn-uq-outline-gray"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedField === 'Số tiền' ? <Check size={12} color="#00875a" /> : <Copy size={12} />}
                <span>{copiedField === 'Số tiền' ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Transfer Content */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: '#f0f7ff',
              border: '1px solid #cce5ff'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#0052cc', textTransform: 'uppercase', fontWeight: '700' }}>Nội dung chuyển khoản (Bắt buộc)</div>
                <div style={{ fontWeight: '900', color: '#0052cc', fontSize: '0.95rem', fontFamily: 'monospace' }}>{qrData.transferContent}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(qrData.transferContent, 'Nội dung CK')}
                className="btn-uq btn-uq-outline-gray"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedField === 'Nội dung CK' ? <Check size={12} color="#00875a" /> : <Copy size={12} />}
                <span>{copiedField === 'Nội dung CK' ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Test Simulation Button */}
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className="btn-uq btn-uq-primary"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Sparkles size={16} />
                <span>{isSimulating ? 'Đang giả lập...' : '🧪 Giả lập Chuyển Khoản Thành Công (Test Webhook/SePay)'}</span>
              </button>
              <div style={{ fontSize: '0.72rem', color: '#777', textAlign: 'center', marginTop: '4px' }}>
                * Bấm nút trên để thử nghiệm luồng Webhook tự động khớp tiền mà không cần quét mã thật.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
