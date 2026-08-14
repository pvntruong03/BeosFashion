import React, { useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export const ReviewModal = ({ isOpen, onClose, product, onReviewSubmitted }) => {
  const { showSuccess, showError } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [fitRating, setFitRating] = useState('TRUE_TO_SIZE');
  const [purchasedSize, setPurchasedSize] = useState('L');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reviews', {
        productId: product.id,
        rating,
        title,
        comment,
        fitRating,
        purchasedSize,
        purchasedColor: product.variants?.[0]?.colorName || 'Default'
      });
      showSuccess('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      showError(err.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>Đánh Giá Sản Phẩm</div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ color: '#666' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rating stars */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              Mức độ hài lòng của bạn:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ padding: '4px' }}
                >
                  <Star
                    size={28}
                    color="#ffab00"
                    fill={(hoverRating || rating) >= star ? '#ffab00' : 'none'}
                  />
                </button>
              ))}
              <span style={{ marginLeft: '8px', fontSize: '0.9rem', fontWeight: '700', alignSelf: 'center' }}>
                {rating === 5 ? 'Tuyệt vời (5/5)' : `${rating}/5 sao`}
              </span>
            </div>
          </div>

          {/* Fit Rating */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              Độ vừa vặn của trang phục:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'RUNS_SMALL', label: 'Hơi chật' },
                { id: 'TRUE_TO_SIZE', label: 'Vừa vặn chuẩn' },
                { id: 'RUNS_LARGE', label: 'Hơi rộng' },
              ].map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFitRating(f.id)}
                  style={{
                    padding: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: fitRating === f.id ? '2px solid #111' : '1px solid #ddd',
                    backgroundColor: fitRating === f.id ? '#111' : '#fff',
                    color: fitRating === f.id ? '#fff' : '#333'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Purchased size */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              Size bạn đã mua:
            </label>
            <select
              value={purchasedSize}
              onChange={(e) => setPurchasedSize(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
            >
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              Tiêu đề nhận xét:
            </label>
            <input
              type="text"
              required
              placeholder="VD: Chất vải rất mát mẻ, form dáng đẹp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
            />
          </div>

          {/* Comment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              Chi tiết trải nghiệm của bạn:
            </label>
            <textarea
              required
              rows={4}
              placeholder="Chia sẻ về chất liệu vải, cảm giác khi mặc, độ bền sau khi giặt..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-uq btn-uq-primary"
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay'}
          </button>
        </form>
      </div>
    </div>
  );
};
