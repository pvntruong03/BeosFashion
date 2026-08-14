import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Xác nhận hành động',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDanger = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 3600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e5e5',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div style={{ height: '4px', backgroundColor: isDanger ? '#e60012' : '#111' }} />

        {/* Close Button */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ padding: '28px 24px 20px 24px', textAlign: 'center' }}>
          {/* Icon Badge */}
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: isDanger ? '#fef2f2' : '#f5f5f5',
              border: `1px solid ${isDanger ? '#fee2e2' : '#e5e5e5'}`,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: isDanger ? '#e60012' : '#111'
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 10px 0', color: '#111' }}>
            {title}
          </h3>

          <p style={{ fontSize: '0.88rem', color: '#666', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            {message}
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #ccc',
                color: '#333',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: isDanger ? '#e60012' : '#111',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDanger ? '#cc0010' : '#333')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDanger ? '#e60012' : '#111')}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
