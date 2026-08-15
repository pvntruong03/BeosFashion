import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ReceiptModal = ({ isOpen, onClose, order }) => {
  const { formatPrice, lang } = useLanguage();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Actions bar (hidden during print) */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: '#111',
          color: '#fff'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
            {lang === 'vi' ? 'HÓA ĐƠN ĐIỆN TỬ / PHIẾU BÁN HÀNG' : 'ELECTRONIC RECEIPT & SALES SLIP'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', padding: '4px 8px', backgroundColor: '#333', border: 'none', cursor: 'pointer' }}
            >
              <Printer size={14} /> {lang === 'vi' ? 'In hóa đơn' : 'Print'}
            </button>
            <button onClick={onClose} style={{ color: '#fff', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Thermal Slip Content */}
        <div style={{
          padding: '24px',
          fontFamily: 'monospace, sans-serif',
          fontSize: '0.85rem',
          color: '#111',
          lineHeight: 1.4
        }}>
          {/* Store header */}
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #999', paddingBottom: '14px', marginBottom: '14px' }}>
            <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px' }}>BEO STORE VIETNAM</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '2px' }}>
              {order.storeName || (lang === 'vi' ? 'CỬA HÀNG TRỰC TUYẾN BEO' : 'BEO ONLINE STORE')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
              {order.shippingAddress || 'Can Tho City, Vietnam'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555' }}>
              Hotline: 1900019199999 • Tax ID: 0315891234
            </div>
          </div>

          {/* Order Meta */}
          <div style={{ borderBottom: '1px dashed #999', paddingBottom: '10px', marginBottom: '12px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{lang === 'vi' ? 'MÃ ĐƠN HÀNG:' : 'ORDER ID:'}</span>
              <strong style={{ fontSize: '0.9rem' }}>{order.orderNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span>{lang === 'vi' ? 'NGÀY GIỜ:' : 'DATE & TIME:'}</span>
              <span>{order.createdAt ? new Date(order.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US') : new Date().toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span>{lang === 'vi' ? 'KHÁCH HÀNG:' : 'CUSTOMER:'}</span>
              <span>{order.customerName || (lang === 'vi' ? 'Khách vãng lai' : 'Walk-in Guest')} ({order.customerPhone || 'N/A'})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span>{lang === 'vi' ? 'LOẠI ĐƠN:' : 'ORDER TYPE:'}</span>
              <span>{order.orderType === 'POS_IN_STORE' ? (lang === 'vi' ? 'Bán tại quầy (POS)' : 'In-Store POS') : (lang === 'vi' ? 'Giao hàng tận nơi' : 'Home Delivery')}</span>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ borderBottom: '1px dashed #999', paddingBottom: '12px', marginBottom: '12px' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #111', textAlign: 'left' }}>
                  <th style={{ padding: '4px 0' }}>{lang === 'vi' ? 'SẢN PHẨM' : 'ITEM'}</th>
                  <th style={{ padding: '4px 0', textAlign: 'center' }}>{lang === 'vi' ? 'SL' : 'QTY'}</th>
                  <th style={{ padding: '4px 0', textAlign: 'right' }}>{lang === 'vi' ? 'THÀNH TIỀN' : 'AMOUNT'}</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((it, idx) => (
                  <tr key={idx} style={{ verticalAlign: 'top' }}>
                    <td style={{ padding: '6px 0' }}>
                      <div style={{ fontWeight: '700' }}>{it.productName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#555' }}>
                        {it.color} / Size {it.size} ({formatPrice(it.unitPrice)})
                      </div>
                    </td>
                    <td style={{ padding: '6px 0', textAlign: 'center', fontWeight: '700' }}>
                      {it.quantity}
                    </td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700' }}>
                      {formatPrice(it.subTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment breakdown */}
          <div style={{ borderBottom: '1px dashed #999', paddingBottom: '12px', marginBottom: '14px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>{lang === 'vi' ? 'TỔNG TIỀN HÀNG:' : 'SUBTOTAL:'}</span>
              <span>{formatPrice(order.subTotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#e60012' }}>
                <span>{lang === 'vi' ? 'GIẢM GIÁ VOUCHER' : 'COUPON DISCOUNT'} ({order.couponCode}):</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            {order.shippingFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{lang === 'vi' ? 'PHÍ VẬN CHUYỂN:' : 'SHIPPING FEE:'}</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: '900',
              fontSize: '1.1rem',
              borderTop: '1px solid #111',
              paddingTop: '6px',
              marginTop: '6px'
            }}>
              <span>{lang === 'vi' ? 'TỔNG THANH TOÁN:' : 'FINAL TOTAL:'}</span>
              <span>{formatPrice(order.finalAmount)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.8rem', color: '#555' }}>
              <span>{lang === 'vi' ? 'PHƯƠNG THỨC:' : 'PAYMENT METHOD:'}</span>
              <strong>{order.payment?.paymentMethod || 'VIETQR / CASH'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', fontSize: '0.8rem', color: '#555' }}>
              <span>{lang === 'vi' ? 'TRẠNG THÁI GD:' : 'STATUS:'}</span>
              <strong style={{ color: '#00875a' }}>{order.payment?.paymentStatus || 'PAID'}</strong>
            </div>
          </div>

          {/* Barcode representation */}
          <div style={{ textAlign: 'center', padding: '6px 0' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              letterSpacing: '5px',
              fontSize: '1.2rem',
              fontWeight: '900',
              backgroundColor: '#f8f8f8',
              border: '1px solid #ccc'
            }}>
              ||| | |||| ||| || |||
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>{order.orderNumber}</div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px' }}>
              {lang === 'vi'
                ? 'Cảm ơn quý khách đã mua sắm tại BEO!\nĐổi trả miễn phí trong vòng 30 ngày kèm hóa đơn này.'
                : 'Thank you for choosing BEO STORE!\n30-day free exchange with this official receipt.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
