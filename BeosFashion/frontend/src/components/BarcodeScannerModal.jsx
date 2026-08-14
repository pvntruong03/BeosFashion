import React, { useState } from 'react';
import { X, Scan, CheckCircle2, RefreshCw } from 'lucide-react';

export const BarcodeScannerModal = ({ isOpen, onClose, onScanned, products = [] }) => {
  const [manualCode, setManualCode] = useState('');

  if (!isOpen) return null;

  // Flatten sample variant barcodes
  const sampleBarcodes = [];
  products.forEach((p) => {
    p.variants?.forEach((v) => {
      if (sampleBarcodes.length < 8 && v.barcode) {
        sampleBarcodes.push({
          barcode: v.barcode,
          name: p.name,
          color: v.colorName,
          size: v.size,
          price: (p.salePrice || p.basePrice) + (v.priceAdjustment || 0),
          variantId: v.id
        });
      }
    });
  });

  const handleScanSubmit = (code) => {
    if (code && onScanned) {
      onScanned(code);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      zIndex: 3500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#111111',
        color: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        padding: '24px',
        borderRadius: '4px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scan size={22} color="#e60012" />
            <span style={{ fontWeight: '800', fontSize: '1.05rem', textTransform: 'uppercase' }}>
              MÁY QUÉT MÃ VẠCH (BARCODE SCANNER)
            </span>
          </div>
          <button onClick={onClose} style={{ color: '#fff', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Viewfinder animation */}
        <div style={{
          position: 'relative',
          height: '180px',
          backgroundColor: '#1a1a1a',
          border: '2px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          {/* Laser scanning beam */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '2px',
            backgroundColor: '#e60012',
            boxShadow: '0 0 10px #e60012, 0 0 20px #e60012',
            animation: 'scanLaser 2s infinite ease-in-out'
          }} />

          <div style={{
            border: '2px dashed rgba(255,255,255,0.4)',
            width: '260px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <Scan size={32} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Đang quét mã vạch sản phẩm...</span>
          </div>
        </div>

        {/* Manual Barcode Input */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '6px' }}>
            Nhập trực tiếp mã vạch (EAN/SKU Barcode):
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="VD: 455004553591001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: '#222',
                border: '1px solid #444',
                color: '#fff',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={() => handleScanSubmit(manualCode)}
              className="btn-uq btn-uq-red"
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
            >
              Quét
            </button>
          </div>
        </div>

        {/* Quick Click Demo Barcodes */}
        <div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '8px' }}>
            HOẶC CHỌN NHANH MÃ VẠCH MẪU:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
            {sampleBarcodes.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleScanSubmit(item.barcode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#222',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#222')}
              >
                <div>
                  <strong style={{ color: '#00e676', fontFamily: 'monospace' }}>[{item.barcode}]</strong>{' '}
                  <span>{item.name}</span>
                </div>
                <div style={{ color: '#ccc' }}>
                  {item.color} / {item.size}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
