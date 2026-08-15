import React, { useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export const ReviewModal = ({ isOpen, onClose, product, onReviewSubmitted }) => {
  const { lang } = useLanguage();
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
      showSuccess(lang === 'vi' ? 'Cảm ơn bạn đã gửi đánh giá sản phẩm!' : 'Thank you for your product review!');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi gửi đánh giá' : 'Failed to submit review'));
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
            <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase' }}>
              {lang === 'vi' ? 'Đánh Giá Sản Phẩm' : 'Write a Product Review'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ color: '#666', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rating stars */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              {lang === 'vi' ? 'Mức độ hài lòng của bạn:' : 'Overall Rating:'}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <Star
                    size={28}
                    color="#ffab00"
                    fill={(hoverRating || rating) >= star ? '#ffab00' : 'none'}
                  />
                </button>
              ))}
              <span style={{ marginLeft: '8px', fontSize: '0.9rem', fontWeight: '700', alignSelf: 'center' }}>
                {rating === 5 ? (lang === 'vi' ? 'Tuyệt vời (5/5)' : 'Excellent (5/5)') : `${rating}/5 ${lang === 'vi' ? 'sao' : 'stars'}`}
              </span>
            </div>
          </div>

          {/* Fit Rating */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              {lang === 'vi' ? 'Độ vừa vặn của trang phục:' : 'Garment Fit:'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'RUNS_SMALL', label: lang === 'vi' ? 'Hơi chật' : 'Runs Small' },
                { id: 'TRUE_TO_SIZE', label: lang === 'vi' ? 'Vừa vặn chuẩn' : 'True to Size' },
                { id: 'RUNS_LARGE', label: lang === 'vi' ? 'Hơi rộng' : 'Runs Large' },
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
                    color: fitRating === f.id ? '#fff' : '#333',
                    cursor: 'pointer'
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
              {lang === 'vi' ? 'Size bạn đã mua:' : 'Purchased Size:'}
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
              {lang === 'vi' ? 'Tiêu đề nhận xét:' : 'Review Title:'}
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'vi' ? 'VD: Chất vải rất mát mẻ, form dáng đẹp' : 'e.g. Incredibly soft fabric and perfect drape'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none' }}
            />
          </div>

          {/* Comment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
              {lang === 'vi' ? 'Chi tiết trải nghiệm của bạn:' : 'Your Experience Review:'}
            </label>
            <textarea
              required
              rows={4}
              placeholder={lang === 'vi' ? 'Chia sẻ về chất liệu vải, cảm giác khi mặc, độ bền sau khi giặt...' : 'Share your feedback on comfort, styling, washing durability, etc.'}
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
            {loading ? (lang === 'vi' ? 'Đang gửi...' : 'Submitting...') : (lang === 'vi' ? 'Gửi Đánh Giá Ngay' : 'Submit Review')}
          </button>
        </form>
      </div>
    </div>
  );
};
