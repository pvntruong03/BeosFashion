import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const DEFAULT_BANK_CONFIG = {
  bankId: 'mbbank',
  bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
  accountNo: '190019199999',
  accountName: 'PHAM VO NHUT TRUONG',
  template: 'compact2'
};

export const VietQrPaymentCard = ({ order, onPaymentConfirmed }) => {
  const { formatPrice, lang } = useLanguage();
  const { showSuccess } = useToast();

  const [copiedField, setCopiedField] = useState(null);
  const [, setIsPolling] = useState(true);
  const [isPaid, setIsPaid] = useState(order?.payment?.paymentStatus === 'SUCCESS');
  const [bankConfig, setBankConfig] = useState(DEFAULT_BANK_CONFIG);

  const transferContent = `Thanh toan don hang ${order?.orderNumber}`;
  const qrData = {
    ...order?.vietQr,
    ...bankConfig,
    amount: order?.finalAmount || 0,
    transferContent,
    qrImageUrl: `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-${bankConfig.template}.png?amount=${Math.round(order?.finalAmount || 0)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankConfig.accountName)}`
  };

  useEffect(() => {
    api.get('/payments/vietqr/config')
      .then((config) => {
        if (config?.bankId && config?.accountNo) {
          setBankConfig({ ...DEFAULT_BANK_CONFIG, ...config });
        }
      })
      .catch(() => {});
  }, []);

  const copyToClipboard = (text, fieldName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showSuccess(lang === 'vi' ? `Đã sao chép ${fieldName}!` : `Copied ${fieldName}!`);
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
          } catch {}
          showSuccess(lang === 'vi' ? 'Trạng thái thanh toán đã được xác nhận.' : 'Payment status confirmed.');
          if (onPaymentConfirmed) onPaymentConfirmed();
        }
      } catch {
        // Silent error during polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaid, order?.orderNumber, onPaymentConfirmed, showSuccess, lang]);

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
              {isPaid
                ? (lang === 'vi' ? 'THANH TOÁN ĐÃ XÁC NHẬN' : 'PAYMENT CONFIRMED')
                : (lang === 'vi' ? 'THANH TOÁN VIETQR' : 'VIETQR PAYMENT')}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>
              {lang === 'vi' ? 'Chuyển khoản nhanh qua mã QR • Tự động điền nội dung' : 'Fast QR bank transfer • Reference is filled automatically'}
            </div>
          </div>
        </div>

        {isPaid ? (
          <span className="badge-beo" style={{ backgroundColor: '#00875a', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> {lang === 'vi' ? 'ĐÃ THANH TOÁN' : 'PAID'}
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#e60012', fontWeight: '700' }}>
            <RefreshCw size={14} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
            <span>{lang === 'vi' ? 'Đang chờ xác nhận...' : 'Awaiting confirmation...'}</span>
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
            {lang === 'vi' ? 'Thanh Toán Đã Được Xác Nhận' : 'Payment Confirmed Successfully'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#555' }}>
            {lang === 'vi'
              ? `Đơn hàng ${order.orderNumber} đã ghi nhận thanh toán ${formatPrice(order.finalAmount)} và chuyển sang bước xử lý tiếp theo.`
              : `Order ${order.orderNumber} recorded a payment of ${formatPrice(order.finalAmount)} and moved to the next processing step.`}
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
              alt="VietQR Payment QR Code"
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
              {lang === 'vi'
                ? 'Mở ứng dụng ngân hàng, quét mã và kiểm tra đúng số tiền cùng nội dung chuyển khoản.'
                : 'Open your banking app, scan the code, and verify the amount and payment reference.'}
            </div>
          </div>

          {/* Right: Bank Account Breakdown & Copy Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            {/* Bank Name */}
            <div style={{ padding: '8px 12px', backgroundColor: '#fcfcfc', border: '1px solid #eee' }}>
              <div style={{ fontSize: '0.72rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Ngân hàng thụ hưởng' : 'Beneficiary Bank'}
              </div>
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
                <div style={{ fontSize: '0.72rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Số tài khoản' : 'Account Number'}
                </div>
                <div style={{ fontWeight: '900', color: '#111', fontSize: '1rem', fontFamily: 'monospace' }}>{qrData.accountNo}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(qrData.accountNo, 'Account Number')}
                className="btn-beo btn-beo-outline-gray"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedField === 'Account Number' ? <Check size={12} color="#00875a" /> : <Copy size={12} />}
                <span>{copiedField === 'Account Number' ? (lang === 'vi' ? 'Đã sao chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
              </button>
            </div>

            {/* Account Name */}
            <div style={{ padding: '8px 12px', backgroundColor: '#fcfcfc', border: '1px solid #eee' }}>
              <div style={{ fontSize: '0.72rem', color: '#777', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Chủ tài khoản' : 'Account Holder'}
              </div>
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
                <div style={{ fontSize: '0.72rem', color: '#e60012', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Số tiền chính xác' : 'Exact Amount'}
                </div>
                <div style={{ fontWeight: '900', color: '#e60012', fontSize: '1.1rem' }}>{formatPrice(order.finalAmount)}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(String(Math.round(order.finalAmount)), 'Amount')}
                className="btn-beo btn-beo-outline-gray"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedField === 'Amount' ? <Check size={12} color="#00875a" /> : <Copy size={12} />}
                <span>{copiedField === 'Amount' ? (lang === 'vi' ? 'Đã sao chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
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
                <div style={{ fontSize: '0.72rem', color: '#0052cc', textTransform: 'uppercase', fontWeight: '700' }}>
                  {lang === 'vi' ? 'Nội dung chuyển khoản (Bắt buộc)' : 'Payment Reference Code (Required)'}
                </div>
                <div style={{ fontWeight: '900', color: '#0052cc', fontSize: '0.95rem', fontFamily: 'monospace' }}>{qrData.transferContent}</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(qrData.transferContent, 'Reference Code')}
                className="btn-beo btn-beo-outline-gray"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedField === 'Reference Code' ? <Check size={12} color="#00875a" /> : <Copy size={12} />}
                <span>{copiedField === 'Reference Code' ? (lang === 'vi' ? 'Đã sao chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
              </button>
            </div>

            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '0.73rem', color: '#666', textAlign: 'center', marginTop: '6px', lineHeight: 1.4 }}>
                {lang === 'vi'
                  ? 'Sau khi ngân hàng ghi nhận giao dịch, trạng thái thanh toán sẽ tự động cập nhật.'
                  : 'Payment status updates automatically after the bank records your transfer.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
