import React, { useState } from 'react';
import { X, QrCode, Printer, Search, Plus, Check, Volume2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

export const BarcodeScannerModal = ({ isOpen, onClose, products = [], onScanAddToCart }) => {
  const { showSuccess, showError } = useToast();
  const { formatPrice } = useLanguage();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProductForPrint, setSelectedProductForPrint] = useState(products[0] || null);

  if (!isOpen) return null;

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Search product by barcode or SKU
    const matched = products.find((p) => {
      const code = `BEO-${p.id}`;
      return code.toLowerCase() === barcodeInput.toLowerCase().trim() ||
        (p.name && p.name.toLowerCase().includes(barcodeInput.toLowerCase().trim()));
    });

    if (matched) {
      if (onScanAddToCart) {
        onScanAddToCart(matched);
      }
      showSuccess(`[BÍP!] Đã quét thành công: ${matched.name} - ${formatPrice(matched.basePrice)}`);
      setBarcodeInput('');
    } else {
      showError(`Không tìm thấy mã vạch "${barcodeInput}". Vui lòng thử lại!`);
    }
  };

  const handlePrintLabel = (product) => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '2px solid #111',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#111111',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#e60012', padding: '6px', borderRadius: '4px', display: 'flex' }}>
              <QrCode size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                POS BARCODE SCANNER & IN TEM MÃ VẠCH
              </div>
              <div style={{ fontSize: '0.75rem', color: '#bbb' }}>
                Quét bán hàng siêu tốc tại quầy Showroom Cần Thơ
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Scanner Input Form */}
          <form
            onSubmit={handleBarcodeSubmit}
            style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              border: '2px solid #111',
              marginBottom: '24px',
              display: 'flex',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, backgroundColor: '#fff', padding: '0 12px', border: '1px solid #ccc' }}>
              <Search size={18} color="#888" />
              <input
                type="text"
                autoFocus
                placeholder="Quét máy bắn mã vạch hoặc nhập mã (VD: BEO-21)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                style={{ width: '100%', border: 'none', padding: '12px 0', outline: 'none', fontSize: '0.95rem', fontWeight: '700' }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0 24px',
                backgroundColor: '#e60012',
                color: '#fff',
                border: 'none',
                fontWeight: '900',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'uppercase'
              }}
            >
              <Volume2 size={16} />
              <span>Quét / Thêm POS</span>
            </button>
          </form>

          {/* Tag Barcode Preview Box */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: '800', fontSize: '0.88rem', textTransform: 'uppercase', marginBottom: '10px' }}>
              Xem Trước Tem Mã Vạch Quần Áo (Printable Clothing Tag)
            </div>

            {selectedProductForPrint && (
              <div style={{
                border: '2px dashed #111',
                padding: '16px',
                backgroundColor: '#ffffff',
                width: '280px',
                margin: '0 auto 16px auto',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontWeight: '900', fontSize: '0.95rem', letterSpacing: '1px', marginBottom: '2px' }}>
                  BEO MODERN FASHION
                </div>
                <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: '8px' }}>
                  {selectedProductForPrint.name}
                </div>

                {/* Simulated High-Res Code128 Barcode */}
                <div style={{
                  backgroundColor: '#000',
                  height: '48px',
                  margin: '8px 0',
                  background: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 7px, #fff 7px, #fff 8px)'
                }} />

                <div style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '2px' }}>
                  BEO-{String(selectedProductForPrint.id).padStart(6, '0')}
                </div>

                <div style={{ marginTop: '6px', fontWeight: '900', fontSize: '1.05rem', color: '#e60012' }}>
                  {formatPrice(selectedProductForPrint.basePrice)}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#888' }}>
                  Showroom: 123 Đường 30/4, Ninh Kiều, Cần Thơ
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => handlePrintLabel(selectedProductForPrint)}
                className="btn-uq btn-uq-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} /> In Tem Mã Vạch Này (Print Label)
              </button>
            </div>
          </div>

          {/* Quick Select Product to Print */}
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px' }}>
              Danh Sách Sản Phẩm Trong Cửa Hàng ({products.length}):
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee' }}>
              {products.slice(0, 15).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductForPrint(p)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: selectedProductForPrint?.id === p.id ? '#f0f4ff' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{p.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#777' }}>Mã vạch: BEO-{String(p.id).padStart(6, '0')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: '#e60012', fontSize: '0.85rem' }}>{formatPrice(p.basePrice)}</div>
                    <span style={{ fontSize: '0.72rem', color: '#0052cc', fontWeight: '700' }}>Chọn in tem</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
