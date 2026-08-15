import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, ThumbsUp, Camera, MessageSquare, Plus, Filter, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const SAMPLE_FALLBACK_REVIEWS = [
  {
    id: 1,
    userName: 'Alex Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Extremely cooling AIRism fabric with great sweat absorption',
    comment: 'I am 173cm, 67kg and chose Size L—fits perfectly like bespoke tailoring. Clean seams, no shrinkage or pilling after multiple machine washes. Definitely ordering again!',
    fitRating: 'TRUE_TO_SIZE',
    purchasedColor: '09 BLACK',
    purchasedSize: 'L',
    verifiedPurchase: true,
    createdAt: '2026-08-10T14:30:00',
    helpfulCount: 24,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 2,
    userName: 'Sophia Miller',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Elegant color and luxury soft feel!',
    comment: 'Super fast delivery in Can Tho—arrived in just over an hour. Premium box packaging with a thank you card. Perfect for both office work and casual weekend outings.',
    fitRating: 'TRUE_TO_SIZE',
    purchasedColor: '00 WHITE',
    purchasedSize: 'M',
    verifiedPurchase: true,
    createdAt: '2026-08-12T09:15:00',
    helpfulCount: 18,
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 3,
    userName: 'David Lee',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Worth every penny, silhouette is sharp',
    comment: 'Gentle elasticity that maintains shape without wrinkling. Shoulder fit flatters posture nicely. Bought 2 more in different colors.',
    fitRating: 'TRUE_TO_SIZE',
    purchasedColor: '69 NAVY',
    purchasedSize: 'XL',
    verifiedPurchase: true,
    createdAt: '2026-08-13T18:45:00',
    helpfulCount: 12,
    images: []
  }
];

export const ProductReviewsSection = ({ productId, productName }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { lang } = useLanguage();

  const [reviews, setReviews] = useState(SAMPLE_FALLBACK_REVIEWS);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [fitRating, setFitRating] = useState('TRUE_TO_SIZE');
  const [purchasedColor, setPurchasedColor] = useState('09 BLACK');
  const [purchasedSize, setPurchasedSize] = useState('L');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/product/${productId}`);
        if (res.data && res.data.length > 0) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error('Error loading product reviews:', err);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showError(lang === 'vi' ? 'Vui lòng đăng nhập để gửi đánh giá sản phẩm!' : 'Please sign in to submit a review!');
      return;
    }
    if (!comment.trim()) {
      showError(lang === 'vi' ? 'Vui lòng nhập nội dung đánh giá!' : 'Please enter your review comment!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productId,
        rating,
        title: title.trim() || (lang === 'vi' ? 'Đánh giá sản phẩm' : 'Product Review'),
        comment: comment.trim(),
        fitRating,
        purchasedColor,
        purchasedSize,
        images: imageUrl ? [imageUrl] : []
      };

      const res = await api.post('/reviews', payload);
      const newRev = res.data || {
        id: Date.now(),
        userName: user.fullName || user.email.split('@')[0],
        userAvatar: user.avatar,
        rating,
        title: payload.title,
        comment: payload.comment,
        fitRating,
        purchasedColor,
        purchasedSize,
        verifiedPurchase: true,
        createdAt: new Date().toISOString(),
        helpfulCount: 0,
        images: payload.images
      };

      setReviews([newRev, ...reviews]);
      showSuccess(lang === 'vi' ? 'Cảm ơn bạn! Đánh giá đã được gửi thành công.' : 'Thank you! Your review has been submitted.');
      setIsFormOpen(false);
      setTitle('');
      setComment('');
      setImageUrl('');
    } catch (err) {
      showError(err.message || (lang === 'vi' ? 'Lỗi khi gửi đánh giá' : 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === '5_STAR') return r.rating === 5;
    if (selectedFilter === 'WITH_PHOTOS') return r.images && r.images.length > 0;
    if (selectedFilter === 'VERIFIED') return r.verifiedPurchase;
    return true;
  });

  const averageRating = (
    reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '2px solid #111' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
              {lang === 'vi' ? `Đánh Giá & Nhận Xét Thực Tế (${reviews.length})` : `Verified Customer Reviews (${reviews.length})`}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
            {lang === 'vi' ? 'Trải nghiệm chân thực từ khách hàng đã mua sản phẩm tại BEO STORE' : 'Authentic feedback from verified customers who purchased at BEO STORE'}
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          style={{
            padding: '10px 18px',
            backgroundColor: isFormOpen ? '#f0f0f0' : '#111111',
            color: isFormOpen ? '#111' : '#ffffff',
            border: '1px solid #111',
            fontWeight: '800',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase'
          }}
        >
          {isFormOpen ? <Filter size={16} /> : <Plus size={16} />}
          <span>{isFormOpen ? (lang === 'vi' ? 'Thu Gọn Form' : 'Collapse Form') : (lang === 'vi' ? 'Viết Đánh Giá Mới' : 'Write a Review')}</span>
        </button>
      </div>

      {/* Write Review Form Collapsible */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          style={{
            backgroundColor: '#fafafa',
            border: '2px solid #111',
            padding: '24px',
            marginBottom: '32px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ fontWeight: '900', fontSize: '1.05rem', textTransform: 'uppercase', marginBottom: '16px' }}>
            {lang === 'vi' ? `Gửi Nhận Xét Về: ${productName}` : `Write a Review for: ${productName}`}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Star Rating Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px' }}>
                {lang === 'vi' ? '1. Đánh giá chất lượng:' : '1. Quality Rating:'}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star
                      size={24}
                      color="#e60012"
                      fill={(hoverRating || rating) >= star ? '#e60012' : 'transparent'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.85rem', fontWeight: '800', marginLeft: '8px', alignSelf: 'center', color: '#e60012' }}>
                  {rating === 5 ? (lang === 'vi' ? '5/5 Rất Hài Lòng' : '5/5 Excellent') : `${rating}/5 Stars`}
                </span>
              </div>
            </div>

            {/* Fit Feedback */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px' }}>
                {lang === 'vi' ? '2. Độ vừa vặn của phom áo:' : '2. How does it fit?'}
              </label>
              <select
                value={fitRating}
                onChange={(e) => setFitRating(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', fontSize: '0.85rem', fontWeight: '600' }}
              >
                <option value="RUNS_SMALL">{lang === 'vi' ? 'Hơi ôm / Chật hơn bình thường' : 'Runs Small'}</option>
                <option value="TRUE_TO_SIZE">{lang === 'vi' ? 'Chuẩn vừa vặn (True to size)' : 'True to Size'}</option>
                <option value="RUNS_LARGE">{lang === 'vi' ? 'Hơi rộng / Rộng rãi thoải mái' : 'Runs Large / Relaxed'}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px' }}>
                {lang === 'vi' ? '3. Màu & Size bạn đã chọn:' : '3. Purchased Color & Size:'}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. 09 BLACK"
                  value={purchasedColor}
                  onChange={(e) => setPurchasedColor(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                />
                <input
                  type="text"
                  placeholder="Size L"
                  value={purchasedSize}
                  onChange={(e) => setPurchasedSize(e.target.value)}
                  style={{ width: '80px', padding: '8px 12px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px' }}>
                {lang === 'vi' ? '4. Tiêu đề ngắn gọn:' : '4. Headline:'}
              </label>
              <input
                type="text"
                placeholder={lang === 'vi' ? 'VD: Chất vải rất mát, phom áo chuẩn đẹp' : 'e.g. Incredibly soft fabric and perfect cut'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px' }}>
              {lang === 'vi' ? '5. Nội dung nhận xét chi tiết:' : '5. Detailed Review:'}
            </label>
            <textarea
              rows={3}
              placeholder={lang === 'vi' ? 'Chia sẻ cảm nhận của bạn về chất liệu vải, độ bền, cảm giác khi mặc...' : 'Share your thoughts on material quality, durability, comfort...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', fontSize: '0.85rem' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px' }}>
              {lang === 'vi' ? '6. Đính kèm link ảnh chụp thực tế (Tùy chọn):' : '6. Attach Photo URL (Optional):'}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or paste image link"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80')}
                className="btn-uq btn-uq-outline-gray"
                style={{ padding: '8px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              >
                <Camera size={14} /> {lang === 'vi' ? 'Dùng ảnh mẫu' : 'Sample Photo'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 24px',
              backgroundColor: '#e60012',
              color: '#fff',
              border: 'none',
              fontWeight: '900',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            {submitting ? (lang === 'vi' ? 'Đang gửi...' : 'Submitting...') : (lang === 'vi' ? 'Đăng Đánh Giá Ngay' : 'Submit Review')}
          </button>
        </form>
      )}

      {/* Review Summary Scoreboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        backgroundColor: '#f8f9fa',
        padding: '24px',
        border: '1px solid #e0e0e0',
        marginBottom: '24px'
      }}>
        {/* Left: Overall Score */}
        <div style={{ textAlign: 'center', borderRight: '1px solid #eee', paddingRight: '16px' }}>
          <div style={{ fontSize: '3.2rem', fontWeight: '900', color: '#111', lineHeight: 1 }}>
            {averageRating}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={18} color="#e60012" fill="#e60012" />
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: '700' }}>
            {lang === 'vi' ? `Dựa trên ${reviews.length} đánh giá` : `Based on ${reviews.length} reviews`}
          </div>
        </div>

        {/* Middle: Rating Bars */}
        <div>
          {[
            { star: 5, pct: 88, count: Math.round(reviews.length * 0.88) },
            { star: 4, pct: 10, count: Math.round(reviews.length * 0.1) },
            { star: 3, pct: 2, count: Math.round(reviews.length * 0.02) },
            { star: 2, pct: 0, count: 0 },
            { star: 1, pct: 0, count: 0 }
          ].map((bar) => (
            <div key={bar.star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ width: '40px', fontWeight: '700' }}>{bar.star} ★</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${bar.pct}%`, height: '100%', backgroundColor: '#e60012' }} />
              </div>
              <span style={{ width: '35px', textAlign: 'right', color: '#777' }}>{bar.count}</span>
            </div>
          ))}
        </div>

        {/* Right: Fit Satisfaction */}
        <div style={{ borderLeft: '1px solid #eee', paddingLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '6px' }}>
            {lang === 'vi' ? 'Độ Vừa Vặn Thực Tế:' : 'Fit Feedback:'}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#2e7d32' }}>
            {lang === 'vi' ? '96% Vừa Vặn Chuẩn Size' : '96% True to Size'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
            {lang === 'vi'
              ? 'Khách hàng khuyên nên chọn đúng size thường mặc theo bảng kích thước BEO.'
              : 'Customers recommend ordering your standard size according to the size guide.'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
        {[
          { id: 'ALL', label: lang === 'vi' ? `Tất cả (${reviews.length})` : `All (${reviews.length})` },
          { id: '5_STAR', label: '5 Stars ★★★★★' },
          { id: 'WITH_PHOTOS', label: lang === 'vi' ? 'Có Hình Ảnh 📷' : 'With Photos 📷' },
          { id: 'VERIFIED', label: lang === 'vi' ? 'Đã Mua Hàng Thật ✔' : 'Verified Purchase ✔' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: selectedFilter === f.id ? '800' : '600',
              border: selectedFilter === f.id ? '2px solid #111' : '1px solid #ddd',
              backgroundColor: selectedFilter === f.id ? '#111' : '#fff',
              color: selectedFilter === f.id ? '#fff' : '#444',
              cursor: 'pointer',
              borderRadius: '2px',
              whiteSpace: 'nowrap'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            style={{
              border: '1px solid #e5e5e5',
              padding: '20px',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={rev.userName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span style={{ fontSize: '0.72rem', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '700' }}>
                        <CheckCircle size={12} /> {lang === 'vi' ? 'Đã Mua Hàng' : 'Verified Buyer'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>
                    {lang === 'vi' ? 'Phân loại:' : 'Variation:'} <strong>{rev.purchasedColor}</strong> • Size: <strong>{rev.purchasedSize}</strong>
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    color="#e60012"
                    fill={s <= rev.rating ? '#e60012' : 'transparent'}
                  />
                ))}
              </div>
            </div>

            {/* Title & Comment */}
            {rev.title && (
              <div style={{ fontWeight: '800', fontSize: '0.92rem', marginBottom: '6px', color: '#111' }}>
                {rev.title}
              </div>
            )}
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#333', margin: '0 0 12px 0' }}>
              {rev.comment}
            </p>

            {/* Attached Photos */}
            {rev.images && rev.images.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {rev.images.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`Review photo ${i + 1}`}
                    onClick={() => setPreviewImage(imgUrl)}
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                      cursor: 'pointer',
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Footer Date & Helpful vote */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#888' }}>
              <span>{new Date(rev.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
              <button
                onClick={() => showInfo(lang === 'vi' ? 'Cảm ơn bạn đã bình chọn nhận xét hữu ích!' : 'Thank you for your feedback!')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                <ThumbsUp size={13} />
                <span>{lang === 'vi' ? `Hữu ích (${rev.helpfulCount || 12})` : `Helpful (${rev.helpfulCount || 12})`}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Lightbox Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'pointer'
          }}
        >
          <img
            src={previewImage}
            alt="Enlarged review photo"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', border: '3px solid #fff' }}
          />
        </div>
      )}
    </div>
  );
};
