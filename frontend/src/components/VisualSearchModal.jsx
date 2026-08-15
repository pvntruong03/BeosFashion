import React, { useState } from 'react';
import { Camera, Upload, Sparkles, X, ArrowRight, CheckCircle2, Image as ImageIcon, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const SAMPLE_PRESETS = [
  {
    id: 1,
    title: 'AIRism Oversized Black Tee',
    hint: 'black oversized airism tee',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    category: 'T-Shirts'
  },
  {
    id: 2,
    title: 'UV Protection Parka Jacket',
    hint: 'uv protection hoodie parka jacket',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    category: 'Outerwear'
  },
  {
    id: 3,
    title: 'Smart Ankle Pants Gray',
    hint: 'smart ankle stretch pants gray',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    category: 'Pants'
  },
  {
    id: 4,
    title: 'White Oxford Long Sleeve Shirt',
    hint: 'white oxford long sleeve shirt',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    category: 'Shirts'
  },
  {
    id: 5,
    title: 'Minimalist Rayon Shift Dress',
    hint: 'women rayon casual shift dress',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    category: 'Dresses'
  }
];

export const VisualSearchModal = ({ isOpen, onClose, onSelectProduct }) => {
  const { formatPrice, lang } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const performVisualSearch = async (imageUrl, hint = '') => {
    setSelectedImage(imageUrl);
    setIsScanning(true);
    setError(null);
    setSearchResult(null);

    try {
      await new Promise((res) => setTimeout(res, 800));

      const res = await api.post('/products/visual-search', {
        imageUrl: imageUrl,
        visualHint: hint || imageUrl
      });

      if (res.data) {
        setSearchResult(res.data);
      }
    } catch (err) {
      console.error('Visual search error:', err);
      setError(lang === 'vi' ? 'Không thể phân tích hình ảnh này. Vui lòng thử lại với hình ảnh khác.' : 'Unable to analyze image. Please try another photo.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result;
      const fileNameHint = file.name.replace(/\.[^/.]+$/, '');
      performVisualSearch(base64Url, fileNameHint);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomUrlSubmit = (e) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    performVisualSearch(customImageUrl.trim(), customImageUrl.trim());
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid #111'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#e60012', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>
                {lang === 'vi' ? 'Tìm Kiếm Bằng Hình Ảnh (Visual AI Search)' : 'Visual AI Search (Photo-to-Product)'}
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#bbb', marginTop: '2px' }}>
                {lang === 'vi'
                  ? 'Tải ảnh trang phục bất kỳ để AI phân tích màu sắc, kiểu dáng và tìm sản phẩm LifeWear tương đồng'
                  : 'Upload any outfit photo for neural-network analysis to discover matching LifeWear items'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#fff', padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Preset sample outfits for 1-click test */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#e60012" />
              <span>{lang === 'vi' ? 'Hoặc thử nhanh với các mẫu trang phục gợi ý:' : 'Or try with sample aesthetic presets:'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px' }}>
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => performVisualSearch(preset.imageUrl, preset.hint)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    backgroundColor: selectedImage === preset.imageUrl ? '#fce8e9' : '#f8f8f8',
                    border: selectedImage === preset.imageUrl ? '2px solid #e60012' : '1px solid #e5e5e5',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.title}
                    style={{ width: '100%', height: '85px', objectFit: 'cover', marginBottom: '6px' }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#111', lineHeight: '1.2' }}>
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Dropzone & URL Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Upload Zone */}
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                border: '2px dashed #bbb',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition)'
              }}
            >
              <Upload size={28} color="#e60012" style={{ marginBottom: '8px' }} />
              <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#111' }}>
                {lang === 'vi' ? 'Tải ảnh trang phục từ máy tính' : 'Upload photo from device'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#777', marginTop: '4px' }}>
                JPG, PNG, WEBP (Max 10MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            {/* Paste URL */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '16px',
              border: '1px solid #e0e0e0',
              backgroundColor: '#fafafa'
            }}>
              <span style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={16} />
                <span>{lang === 'vi' ? 'Hoặc dán liên kết URL ảnh:' : 'Or paste direct image URL:'}</span>
              </span>
              <form onSubmit={handleCustomUrlSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn-uq btn-uq-primary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {lang === 'vi' ? 'Tìm' : 'Search'}
                </button>
              </form>
            </div>
          </div>

          {/* Scanning Animation */}
          {isScanning && (
            <div style={{
              textAlign: 'center',
              padding: '30px 16px',
              backgroundColor: '#111',
              color: '#fff',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'inline-block', position: 'relative', width: '120px', height: '140px', overflow: 'hidden', border: '2px solid #e60012', marginBottom: '12px' }}>
                <img
                  src={selectedImage}
                  alt="Scanning"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: '#e60012',
                  boxShadow: '0 0 10px #e60012, 0 0 20px #e60012',
                  animation: 'pulse 1s infinite alternate'
                }} />
              </div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>
                {lang === 'vi' ? 'AI ĐANG PHÂN TÍCH ĐƯỜNG NÉT & TÔNG MÀU TRANG PHỤC...' : 'AI IS ANALYZING SILHOUETTE, PATTERN & COLORWAYS...'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>
                {lang === 'vi' ? 'Đang quét thư viện sản phẩm LifeWear để tìm các mẫu khớp nhất' : 'Scanning catalog embeddings to find closest matches'}
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {searchResult && !isScanning && (
            <div>
              {/* Visual Analysis Info Banner */}
              <div style={{
                backgroundColor: '#f5f7fa',
                borderLeft: '4px solid #e60012',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: '700' }}>
                    {lang === 'vi' ? 'ĐẶC ĐIỂM AI NHẬN DIỆN:' : 'IDENTIFIED ATTRIBUTES:'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {searchResult.detectedTags?.map((tag, idx) => (
                      <span key={idx} className="badge-uq red" style={{ fontSize: '0.75rem' }}>
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#555', textAlign: 'right' }}>
                  {lang === 'vi'
                    ? `Tìm thấy ${searchResult.matchedProducts?.length || 0} sản phẩm khớp (${searchResult.analysisTimeMs}ms)`
                    : `Found ${searchResult.matchedProducts?.length || 0} matches in ${searchResult.analysisTimeMs}ms`}
                </div>
              </div>

              {/* Matched Products Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '16px',
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {searchResult.matchedProducts?.map((matchItem) => {
                  const prod = matchItem.product;
                  return (
                    <div
                      key={prod.id}
                      style={{
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'var(--transition)'
                      }}
                    >
                      {/* Similarity Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: matchItem.similarityPercentage >= 90 ? '#e60012' : '#111',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '3px 6px',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <CheckCircle2 size={10} />
                        <span>{matchItem.similarityPercentage}% {lang === 'vi' ? 'Khớp' : 'Match'}</span>
                      </div>

                      {/* Product Image */}
                      <div style={{ width: '100%', height: '180px', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                        <img
                          src={prod.primaryImageUrl}
                          alt={prod.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Info */}
                      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {prod.gender} • {prod.categoryName || 'LifeWear'}
                        </div>
                        <h4 style={{
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          lineHeight: '1.3',
                          marginBottom: '6px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '2.6em'
                        }}>
                          {prod.name}
                        </h4>

                        <div style={{ fontSize: '0.7rem', color: '#00875a', fontWeight: '700', marginBottom: '6px' }}>
                          {matchItem.matchReason}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '800', color: prod.salePrice ? '#e60012' : '#111', fontSize: '0.85rem' }}>
                            {formatPrice(prod.salePrice || prod.basePrice)}
                          </span>
                          <button
                            onClick={() => {
                              onClose();
                              if (onSelectProduct) onSelectProduct(prod);
                            }}
                            className="btn-uq btn-uq-outline-gray"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            {lang === 'vi' ? 'Xem' : 'View'} <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '16px', backgroundColor: '#fff5f5', color: '#d9383a', border: '1px solid #ffcdd2', textAlign: 'center', marginTop: '14px' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
