import React from 'react';
import { ShieldAlert, LogIn, X, Lock, KeyRound } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AuthRequiredModal = ({ isOpen, onClose, requiredRole, onGoToLogin }) => {
  const { lang } = useLanguage();
  if (!isOpen) return null;

  const isForAdmin = requiredRole === 'ADMIN';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 3500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e5e5',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div style={{ height: '4px', backgroundColor: '#e60012' }} />

        {/* Close Button */}
        <button
          onClick={onClose}
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
            justifyContent: 'center',
            transition: 'color 0.15s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#111')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
        >
          <X size={20} />
        </button>

        <div style={{ padding: '32px 28px 24px 28px', textAlign: 'center' }}>
          {/* Icon Badge */}
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              color: '#e60012'
            }}
          >
            {isForAdmin ? <ShieldAlert size={32} /> : <Lock size={30} />}
          </div>

          {/* Title */}
          <div style={{ marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                backgroundColor: '#e60012',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: '2px',
                display: 'inline-block',
                marginBottom: '10px'
              }}
            >
              {lang === 'vi' ? 'Yêu cầu quyền truy cập' : 'Access Authorization Required'}
            </span>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: '800',
                color: '#111',
                margin: 0,
                lineHeight: 1.3
              }}
            >
              {isForAdmin ? (lang === 'vi' ? 'Cổng Quản Trị Hệ Thống' : 'System Admin Portal') : (lang === 'vi' ? 'Cổng Quản Lý Cửa Hàng & POS' : 'Store Manager & POS Gateway')}
            </h2>
          </div>

          {/* Message description */}
          <p
            style={{
              fontSize: '0.9rem',
              color: '#555',
              lineHeight: 1.6,
              margin: '12px 0 24px 0'
            }}
          >
            {isForAdmin ? (
              lang === 'vi' ? (
                <>
                  Bạn cần đăng nhập bằng tài khoản <strong>Quản trị viên (ROLE_ADMIN)</strong> để vào xem phân tích doanh thu và quản lý hệ thống.
                </>
              ) : (
                <>
                  You must be authenticated with <strong>System Administrator (ROLE_ADMIN)</strong> privileges to view revenue analytics and global configurations.
                </>
              )
            ) : (
              lang === 'vi' ? (
                <>
                  Bạn cần đăng nhập bằng tài khoản <strong>Nhân viên (Store Manager hoặc Thu ngân POS)</strong> để sử dụng bảng điều khiển này.
                </>
              ) : (
                <>
                  You must log in with <strong>Store Manager / Staff</strong> credentials to access inventory and in-store POS fulfillment.
                </>
              )
            )}
          </p>

          {/* Quick Tip Box */}
          <div
            style={{
              backgroundColor: '#fafafa',
              border: '1px dashed #ddd',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: '#666',
              textAlign: 'left',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <KeyRound size={18} color="#e60012" style={{ flexShrink: 0 }} />
            <div>
              {lang === 'vi' ? (
                <>Trang đăng nhập có mục <strong>"Truy cập nhanh theo vai trò"</strong> để vào đúng khu vực chức năng.</>
              ) : (
                <>The login gateway includes <strong>"Quick Role Access"</strong> buttons for direct access to the correct workspace.</>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #ccc',
                color: '#333',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#999';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#ccc';
              }}
            >
              {lang === 'vi' ? 'Để sau' : 'Cancel'}
            </button>

            <button
              onClick={() => {
                onClose();
                onGoToLogin();
              }}
              style={{
                flex: 1.3,
                padding: '12px 16px',
                backgroundColor: '#e60012',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#cc0010')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e60012')}
            >
              <LogIn size={16} /> {lang === 'vi' ? 'Đăng nhập ngay' : 'Sign In Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
