import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Star,
  ShoppingBag,
  Ruler,
  Truck,
  RefreshCw,
  MapPin,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SizeAdvisorModal } from '../components/SizeAdvisorModal';
import { ReviewModal } from '../components/ReviewModal';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';

export const ProductDetailPage = ({ productId, slug, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSizeAdvisorOpen, setIsSizeAdvisorOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Accordion toggles
  const [openSection, setOpenSection] = useState('details'); // details, material, care, stores

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    try {
      let productRes;
      if (slug) {
        productRes = await api.get(`/products/slug/${slug}`);
      } else if (productId) {
        productRes = await api.get(`/products/${productId}`);
      }

      if (productRes && productRes.data) {
        const prod = productRes.data;
        setProduct(prod);

        // Set initial color & variant
        if (prod.variants && prod.variants.length > 0) {
          const firstVariant = prod.variants[0];
          setSelectedColor(firstVariant.colorName);
          setSelectedSize(firstVariant.size);
          setSelectedVariant(firstVariant);
          setActiveImage(firstVariant.imageUrl || prod.primaryImageUrl);
        } else {
          setActiveImage(prod.primaryImageUrl);
        }

        // Fetch reviews and related products
        const [revRes, relRes] = await Promise.all([
          api.get(`/reviews/product/${prod.id}`),
          api.get(`/products/${prod.id}/related`),
        ]);

        if (revRes.data) setReviews(revRes.data);
        if (relRes.data) setRelatedProducts(relRes.data);
      }
    } catch (err) {
      console.error('Error fetching product detail:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, slug]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Unique colors
  const colorMap = new Map();
  if (product?.variants) {
    product.variants.forEach((v) => {
      if (!colorMap.has(v.colorName)) {
        colorMap.set(v.colorName, v);
      }
    });
  }
  const uniqueColors = Array.from(colorMap.values());

  // Available sizes for the selected color
  const availableSizesForColor = product?.variants
    ? product.variants.filter((v) => v.colorName === selectedColor)
    : [];

  const handleColorSelect = (colorName, imageUrl) => {
    setSelectedColor(colorName);
    if (imageUrl) setActiveImage(imageUrl);

    // Auto-update selected variant with current or first size
    const matchingVariant = product.variants.find(
      (v) => v.colorName === colorName && v.size === selectedSize
    ) || product.variants.find((v) => v.colorName === colorName);

    if (matchingVariant) {
      setSelectedSize(matchingVariant.size);
      setSelectedVariant(matchingVariant);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const variant = product.variants.find(
      (v) => v.colorName === selectedColor && v.size === size
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addToCart(selectedVariant.id, quantity, true);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    await addToCart(selectedVariant.id, quantity, false);
    onNavigate('checkout');
  };

  if (loading || !product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#666' }}>Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const currentPrice = (product.salePrice || product.basePrice) + (selectedVariant?.priceAdjustment || 0);

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.8rem', color: '#767676', marginBottom: '20px' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('home')}>Trang chủ</span> /{' '}
        <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { gender: product.gender })}>
          {product.gender}
        </span> /{' '}
        <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('products', { categorySlug: product.categorySlug })}>
          {product.categoryName}
        </span> /{' '}
        <strong style={{ color: '#111' }}>{product.name}</strong>
      </div>

      {/* Main Product Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '48px',
        marginBottom: '60px'
      }}>
        {/* Left Column: Image Gallery */}
        <div>
          {/* Main Large Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '120%',
            backgroundColor: '#f8f8f8',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <img
              src={activeImage}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {product.limitedOffer && (
              <span className="badge-uq red" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                Khuyến Mãi Có Hạn
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
            {product.images && product.images.length > 0 ? (
              product.images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  style={{
                    width: '70px',
                    height: '84px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: activeImage === img.imageUrl ? '2px solid #111' : '1px solid #ddd',
                    backgroundColor: '#f8f8f8'
                  }}
                >
                  <img src={img.imageUrl} alt={img.altText} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))
            ) : (
              uniqueColors.map((c) => (
                <div
                  key={c.colorName}
                  onClick={() => {
                    handleColorSelect(c.colorName, c.imageUrl);
                  }}
                  style={{
                    width: '70px',
                    height: '84px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: activeImage === c.imageUrl ? '2px solid #111' : '1px solid #ddd',
                    backgroundColor: '#f8f8f8'
                  }}
                >
                  <img src={c.imageUrl} alt={c.colorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Product Info & Actions */}
        <div>
          {/* Tag & Code */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#e60012', textTransform: 'uppercase' }}>
              {product.collection || 'BEO LIFEWEAR'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>Mã SP: {product.code}</span>
          </div>

          {/* Title */}
          <h1 className="heading-section" style={{ fontSize: '1.75rem', lineHeight: 1.3, marginBottom: '12px' }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} color="#ffab00" fill="#ffab00" />
              ))}
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{product.averageRating || 5.0}</span>
            <span style={{ color: '#666', fontSize: '0.85rem' }}>({reviews.length} đánh giá đã xác thực)</span>
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
            {product.salePrice ? (
              <>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e60012' }}>
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-old-price" style={{ fontSize: '1.1rem' }}>
                  {formatPrice(product.basePrice)}
                </span>
                <span className="badge-uq red">TIẾT KIỆM {formatPrice(product.basePrice - product.salePrice)}</span>
              </>
            ) : (
              <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                {formatPrice(currentPrice)}
              </span>
            )}
          </div>

          {/* 1. COLOR SELECTOR */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span>Màu sắc: <strong>{selectedColor}</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {uniqueColors.map((c) => (
                <button
                  key={c.colorName}
                  onClick={() => handleColorSelect(c.colorName, c.imageUrl)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c.colorHex,
                    border: selectedColor === c.colorName ? '3px solid #111' : '1px solid #ccc',
                    outline: selectedColor === c.colorName ? '2px solid #fff' : 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                  title={c.colorName}
                />
              ))}
            </div>
          </div>

          {/* 2. SIZE SELECTOR */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem' }}>Kích cỡ: <strong>{selectedSize}</strong></span>
              <button
                onClick={() => setIsSizeAdvisorOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#e60012', fontWeight: '700' }}
              >
                <Ruler size={16} />
                <span>{t('size_guide')}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((size) => {
                const variantForSize = availableSizesForColor.find((v) => v.size === size);
                const isAvailable = variantForSize && variantForSize.totalStock > 0;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    onClick={() => isAvailable && handleSizeSelect(size)}
                    disabled={!isAvailable}
                    style={{
                      minWidth: '54px',
                      height: '42px',
                      padding: '0 12px',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      border: isSelected ? '2px solid #111' : '1px solid #ddd',
                      backgroundColor: isSelected ? '#111' : (isAvailable ? '#fff' : '#f5f5f5'),
                      color: isSelected ? '#fff' : (isAvailable ? '#111' : '#aaa'),
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      textDecoration: !isAvailable ? 'line-through' : 'none',
                      position: 'relative'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Stock status indicator */}
            {selectedVariant && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginTop: '8px' }}>
                {selectedVariant.totalStock > 10 ? (
                  <>
                    <CheckCircle2 size={14} color="#00875a" />
                    <span style={{ color: '#00875a', fontWeight: '600' }}>Còn hàng sẵn sàng giao ({selectedVariant.totalStock} sản phẩm)</span>
                  </>
                ) : selectedVariant.totalStock > 0 ? (
                  <>
                    <AlertTriangle size={14} color="#ffab00" />
                    <span style={{ color: '#ffab00', fontWeight: '700' }}>Sắp hết hàng! Chỉ còn {selectedVariant.totalStock} sản phẩm</span>
                  </>
                ) : (
                  <span style={{ color: '#d9383a', fontWeight: '700' }}>Tạm thời hết hàng</span>
                )}
              </div>
            )}
          </div>

          {/* 3. QUANTITY & ADD TO BAG */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #111', height: '48px' }}>
              <button
                onClick={() => setQuantity(Math.max(quantity - 1, 1))}
                style={{ padding: '0 14px', height: '100%', fontSize: '1.1rem' }}
              >
                -
              </button>
              <span style={{ padding: '0 14px', fontWeight: '700', fontSize: '1rem' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '0 14px', height: '100%', fontSize: '1.1rem' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.totalStock <= 0}
              className="btn-uq btn-uq-primary"
              style={{ flex: 1, height: '48px', fontSize: '0.95rem' }}
            >
              <ShoppingBag size={18} />
              <span>{t('add_to_cart')}</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              style={{
                width: '48px',
                height: '48px',
                border: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff'
              }}
              title="Yêu thích"
            >
              <Heart size={20} color={isFavorited ? '#e60012' : '#333'} fill={isFavorited ? '#e60012' : 'none'} />
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.totalStock <= 0}
            className="btn-uq btn-uq-red"
            style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginBottom: '24px' }}
          >
            <span>{t('buy_now')}</span>
          </button>

          {/* Accordion Sections: Details, Material, Store Availability */}
          <div style={{ borderTop: '1px solid #e5e5e5' }}>
            {/* Details */}
            <div style={{ borderBottom: '1px solid #e5e5e5' }}>
              <button
                onClick={() => setOpenSection(openSection === 'details' ? '' : 'details')}
                style={{ width: '100%', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '0.9rem' }}
              >
                <span>MÔ TẢ CHI TIẾT & TỔNG QUAN</span>
                <ChevronDown size={16} style={{ transform: openSection === 'details' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {openSection === 'details' && (
                <div style={{ paddingBottom: '16px', fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>
                  <p style={{ marginBottom: '8px' }}>{product.description}</p>
                  {product.overview && <p style={{ whiteSpace: 'pre-line' }}>{product.overview}</p>}
                </div>
              )}
            </div>

            {/* Material & Care */}
            <div style={{ borderBottom: '1px solid #e5e5e5' }}>
              <button
                onClick={() => setOpenSection(openSection === 'material' ? '' : 'material')}
                style={{ width: '100%', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '0.9rem' }}
              >
                <span>CHẤT LIỆU & HƯỚNG DẪN GIẶT ỦI</span>
                <ChevronDown size={16} style={{ transform: openSection === 'material' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {openSection === 'material' && (
                <div style={{ paddingBottom: '16px', fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>
                  <div><strong>Chất liệu:</strong> {product.material || 'Cotton & Polyester'}</div>
                  <div style={{ marginTop: '4px' }}><strong>Hướng dẫn chăm sóc:</strong> {product.careInstruction || 'Giặt máy chế độ nhẹ, lộn trái khi giặt'}</div>
                </div>
              )}
            </div>

            {/* Store inventory lookup */}
            <div style={{ borderBottom: '1px solid #e5e5e5' }}>
              <button
                onClick={() => setOpenSection(openSection === 'stores' ? '' : 'stores')}
                style={{ width: '100%', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '0.9rem' }}
              >
                <span>TÌM CÒN HÀNG TẠI CỬA HÀNG VẬT LÝ</span>
                <ChevronDown size={16} style={{ transform: openSection === 'stores' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {openSection === 'stores' && (
                <div style={{ paddingBottom: '16px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedVariant?.storeInventories?.map((inv) => (
                      <div key={inv.storeId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fcfcfc', border: '1px solid #eee' }}>
                        <div>
                          <div style={{ fontWeight: '700' }}>{inv.storeName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>{inv.storeCode}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: inv.inStock ? '#00875a' : '#d9383a', fontWeight: '700' }}>
                            {inv.inStock ? `Còn ${inv.quantity} sp` : 'Hết hàng'}
                          </span>
                        </div>
                      </div>
                    )) || <div>Vui lòng chọn size và màu sắc để tra cứu tồn kho cửa hàng.</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <section style={{ borderTop: '2px solid #111', paddingTop: '40px', marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="heading-section">Đánh Giá & Nhận Xét Từ Khách Hàng</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div style={{ display: 'flex' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} color="#ffab00" fill="#ffab00" />
                ))}
              </div>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{product.averageRating || 5.0} trên 5</span>
              <span style={{ color: '#666' }}>({reviews.length} lượt đánh giá)</span>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn-uq btn-uq-primary"
          >
            <span>{t('write_review')}</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fafafa', color: '#666' }}>
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên nhận xét!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#111',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }}>
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'B'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{rev.userName || 'Khách hàng BEO'}</div>
                      {rev.verifiedPurchase && (
                        <div style={{ fontSize: '0.72rem', color: '#00875a', fontWeight: '700' }}>✓ Đã mua hàng tại BEO</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} color="#ffab00" fill={rev.rating >= s ? '#ffab00' : 'none'} />
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#767676' }}>
                  Size đã mua: <strong>{rev.purchasedSize || 'L'}</strong> | Độ vừa: <strong>{rev.fitRating === 'TRUE_TO_SIZE' ? 'Vừa vặn chuẩn' : rev.fitRating}</strong>
                </div>

                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#111' }}>{rev.title}</div>
                <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5 }}>{rev.comment}</p>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 'auto' }}>
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: '1px solid #e5e5e5', paddingTop: '40px' }}>
          <h2 className="heading-section" style={{ marginBottom: '24px' }}>
            {t('related_products')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <SizeAdvisorModal
        isOpen={isSizeAdvisorOpen}
        onClose={() => setIsSizeAdvisorOpen(false)}
        onSelectSize={(size) => handleSizeSelect(size)}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={product}
        onReviewSubmitted={fetchProductData}
      />
    </div>
  );
};
