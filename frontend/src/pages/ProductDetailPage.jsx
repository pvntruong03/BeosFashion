import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Star,
  ShoppingBag,
  Ruler,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { SizeAdvisorModal } from '../components/SizeAdvisorModal';
import { ProductReviewsSection } from '../components/ProductReviewsSection';
import { ReviewModal } from '../components/ReviewModal';
import { ProductCard } from '../components/ProductCard';
import { ProductCustomizerStudio } from '../components/ProductCustomizerStudio';
import { isCustomizerEnabled } from '../services/customizerFeatureService';
import api from '../services/api';
import { isAdultVariant, sortSizes } from '../services/productVariants';

export const ProductDetailPage = ({ productId, slug, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, t, lang } = useLanguage();
  const { showError } = useToast();

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
  const [isCustomizerModalOpen, setIsCustomizerModalOpen] = useState(false);

  // Accordion toggles
  const [openSection, setOpenSection] = useState('details');

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    try {
      let productRes = null;

      // 1. Try productId first if provided (exact numeric match)
      if (productId) {
        try {
          productRes = await api.get(`/products/${productId}`);
        } catch (e) {
          console.warn('Product lookup by ID failed, trying slug fallback...', e);
        }
      }

      // 2. Fallback to slug if ID lookup failed or wasn't provided
      if ((!productRes || !productRes.data) && slug) {
        try {
          const cleanSlug = encodeURIComponent(
            String(slug).trim().toLowerCase().replace(/[\s_]+/g, '-')
          );
          productRes = await api.get(`/products/slug/${cleanSlug}`);
        } catch (e) {
          console.warn('Product lookup by slug failed:', e);
        }
      }

      const rawProduct = productRes?.data?.id ? productRes.data : (productRes?.id ? productRes : productRes?.data);
      const prod = rawProduct ? { ...rawProduct, variants: (rawProduct.variants || []).filter(isAdultVariant) } : null;
      if (prod) {
        setProduct(prod);

        // Set initial color & variant
        if (prod.variants && prod.variants.length > 0) {
          const firstVariant = prod.variants.find((v) => v.totalStock > 0) || prod.variants[0];
          setSelectedColor(firstVariant.colorName);
          setSelectedSize(firstVariant.size);
          setSelectedVariant(firstVariant);
          setActiveImage(firstVariant.imageUrl || prod.primaryImageUrl);
        } else {
          setSelectedVariant(null);
          setSelectedSize('');
          setSelectedColor('');
          setActiveImage(prod.primaryImageUrl);
        }

        // Fetch reviews and related products
        const [revRes, relRes] = await Promise.all([
          api.get(`/reviews/product/${prod.id}`).catch(() => ({ data: [] })),
          api.get(`/products/${prod.id}/related`).catch(() => ({ data: [] })),
        ]);

        const reviewList = Array.isArray(revRes?.data) ? revRes.data : (Array.isArray(revRes) ? revRes : []);
        const relatedList = Array.isArray(relRes?.data) ? relRes.data : (Array.isArray(relRes) ? relRes : []);
        setReviews(reviewList);
        setRelatedProducts(relatedList);
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error('Error fetching product detail:', err);
      setProduct(null);
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

  // Available sizes for the currently selected color
  const availableSizesForColor = product?.variants
    ? product.variants.filter((v) => v.colorName === selectedColor)
    : [];

  const handleColorSelect = (colorName, imageUrl) => {
    setSelectedColor(colorName);
    if (imageUrl) setActiveImage(imageUrl);

    // Auto-select first available size variant for new color
    const variantsForColor = product.variants.filter((v) => v.colorName === colorName);
    const sameSizeVariant = variantsForColor.find((v) => v.size === selectedSize);

    if (sameSizeVariant) {
      setSelectedVariant(sameSizeVariant);
    } else if (variantsForColor.length > 0) {
      setSelectedSize(variantsForColor[0].size);
      setSelectedVariant(variantsForColor[0]);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const variant = product?.variants?.find(
      (v) => v.colorName === selectedColor && v.size === size
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedVariant) {
      showError(lang === 'vi' ? 'Vui lòng chọn kích cỡ và màu sắc sản phẩm!' : 'Please select a size and color!');
      return;
    }
    if (selectedVariant.totalStock <= 0) {
      showError(lang === 'vi' ? 'Phiên bản kích cỡ này hiện đã hết hàng. Vui lòng chọn kích cỡ khác!' : 'This size variant is currently out of stock. Please select another size!');
      return;
    }
    addToCart(selectedVariant.id, quantity, true);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!selectedVariant) {
      showError(lang === 'vi' ? 'Vui lòng chọn kích cỡ và màu sắc sản phẩm trước khi mua!' : 'Please select a size and color before purchasing!');
      return;
    }
    if (selectedVariant.totalStock <= 0) {
      showError(lang === 'vi' ? 'Phiên bản kích cỡ này hiện đã hết hàng. Vui lòng chọn kích cỡ khác!' : 'This size variant is currently out of stock. Please select another size!');
      return;
    }
    const added = await addToCart(selectedVariant.id, quantity, false);
    if (added) onNavigate('checkout');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: '#666' }}>
          {lang === 'vi' ? 'Đang tải thông tin sản phẩm...' : 'Loading product details...'}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>{lang === 'vi' ? 'Không tìm thấy sản phẩm' : 'Product Not Found'}</h2>
        <button onClick={() => onNavigate('products')} className="btn-beo btn-beo-primary" style={{ marginTop: '16px' }}>
          {lang === 'vi' ? 'Quay lại cửa hàng' : 'Back to Store'}
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const currentPrice = (product.salePrice || product.basePrice) + (selectedVariant?.priceAdjustment || 0);

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.8rem', color: '#767676', marginBottom: '24px' }}>
        {lang === 'vi' ? 'Trang chủ / Sản phẩm' : 'Home / Products'} / {product.gender} / {product.collection} / <strong style={{ color: '#111' }}>{product.name}</strong>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '48px',
        marginBottom: '60px'
      }}>
        {/* Left: Gallery (Thumbnails + Main Hero Image) */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Thumbnails list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {product.images?.map((img, idx) => (
              <img
                key={idx}
                src={img.imageUrl}
                alt={`${product.name} ${idx}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
                }}
                onClick={() => setActiveImage(img.imageUrl)}
                style={{
                  width: '64px',
                  height: '80px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: activeImage === img.imageUrl ? '2px solid #e60012' : '1px solid #e5e5e5',
                  opacity: activeImage === img.imageUrl ? 1 : 0.7,
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          {/* Main Large Image */}
          <div style={{ flex: 1, backgroundColor: '#f8f8f8', position: 'relative', overflow: 'hidden' }}>
            <img
              src={activeImage || product.primaryImageUrl}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
              }}
              style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }}
            />
            {product.salePrice && (
              <span className="badge-beo red" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.85rem' }}>
                {lang === 'vi' ? 'KHUYẾN MÃI' : 'LIMITED OFFER'}
              </span>
            )}
            {product.isNew && (
              <span className="badge-beo black" style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '0.85rem' }}>
                NEW
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Buying Actions */}
        <div>
          {/* Category & Code */}
          <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '6px' }}>
            {lang === 'vi' ? 'Mã sản phẩm:' : 'SKU:'} <strong style={{ color: '#111' }}>{product.code}</strong> • {product.gender}
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Ratings badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} color="#ffab00" fill={reviews.length && s <= Math.round(reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length) ? '#ffab00' : 'none'} />
              ))}
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{reviews.length ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1) : '—'}</span>
            <span style={{ color: '#666', fontSize: '0.85rem' }}>({reviews.length} {lang === 'vi' ? 'đánh giá' : 'reviews'})</span>
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
                <span className="badge-beo red">{lang === 'vi' ? `TIẾT KIỆM ${formatPrice(product.basePrice - product.salePrice)}` : `SAVE ${formatPrice(product.basePrice - product.salePrice)}`}</span>
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
              <span>{lang === 'vi' ? 'Màu sắc:' : 'Color:'} <strong>{selectedColor}</strong></span>
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
              <span style={{ fontSize: '0.9rem' }}>{lang === 'vi' ? 'Kích cỡ:' : 'Size:'} <strong>{selectedSize}</strong></span>
              <button
                onClick={() => setIsSizeAdvisorOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#e60012', fontWeight: '700', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <Ruler size={16} />
                <span>{t('size_guide')}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(() => {
                const sizesToRender = sortSizes(product.variants.map((v) => v.size));

                return sizesToRender.map((size) => {
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
                });
              })()}
            </div>

            {/* Stock status indicator */}
            {selectedVariant && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginTop: '8px' }}>
                {selectedVariant.totalStock > 10 ? (
                  <>
                    <CheckCircle2 size={14} color="#00875a" />
                    <span style={{ color: '#00875a', fontWeight: '600' }}>
                      {lang === 'vi' ? `Còn hàng sẵn sàng giao (${selectedVariant.totalStock} sản phẩm)` : `In Stock & Ready to Ship (${selectedVariant.totalStock} units)`}
                    </span>
                  </>
                ) : selectedVariant.totalStock > 0 ? (
                  <>
                    <AlertTriangle size={14} color="#ffab00" />
                    <span style={{ color: '#ffab00', fontWeight: '700' }}>
                      {lang === 'vi' ? `Sắp hết hàng! Chỉ còn ${selectedVariant.totalStock} sản phẩm` : `Low Stock! Only ${selectedVariant.totalStock} units left`}
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#d9383a', fontWeight: '700' }}>
                    {lang === 'vi' ? 'Tạm thời hết hàng' : 'Temporarily Out of Stock'}
                  </span>
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
              className="btn-beo btn-beo-primary"
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
              title={t('wishlist')}
            >
              <Heart size={20} color={isFavorited ? '#e60012' : '#333'} fill={isFavorited ? '#e60012' : 'none'} />
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.totalStock <= 0}
            className="btn-beo btn-beo-red"
            style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginBottom: '10px' }}
          >
            <span>{t('buy_now')}</span>
          </button>

          {isCustomizerEnabled() && (
            <button
              onClick={() => setIsCustomizerModalOpen(true)}
              className="btn-beo btn-beo-outline-black"
              style={{
                width: '100%',
                height: '44px',
                fontSize: '0.88rem',
                fontWeight: '800',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1.5px solid #111',
                backgroundColor: '#ffffff'
              }}
            >
              <Sparkles size={16} color="#e60012" />
              <span>{lang === 'vi' ? '🎨 TỰ THIẾT KẾ / THÊU TÊN CHO ÁO NÀY (+50.000đ)' : '🎨 CUSTOMIZE & EMBROIDER THIS ITEM (+50,000 VND)'}</span>
            </button>
          )}

          {/* Accordion Sections: Details, Material, Store Availability */}
          <div style={{ borderTop: '1px solid #e5e5e5' }}>
            {/* Details */}
            <div style={{ borderBottom: '1px solid #e5e5e5' }}>
              <button
                onClick={() => setOpenSection(openSection === 'details' ? '' : 'details')}
                style={{ width: '100%', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '0.9rem' }}
              >
                <span>{lang === 'vi' ? 'MÔ TẢ CHI TIẾT & TỔNG QUAN' : 'PRODUCT OVERVIEW & DETAILS'}</span>
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
                <span>{lang === 'vi' ? 'CHẤT LIỆU & HƯỚNG DẪN GIẶT ỦI' : 'MATERIAL & CARE INSTRUCTIONS'}</span>
                <ChevronDown size={16} style={{ transform: openSection === 'material' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {openSection === 'material' && (
                <div style={{ paddingBottom: '16px', fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>
                  <div><strong>{lang === 'vi' ? 'Chất liệu:' : 'Material:'}</strong> {product.material || 'Cotton & Polyester'}</div>
                  <div style={{ marginTop: '4px' }}><strong>{lang === 'vi' ? 'Hướng dẫn chăm sóc:' : 'Care Instructions:'}</strong> {product.careInstruction || (lang === 'vi' ? 'Giặt máy chế độ nhẹ, lộn trái khi giặt' : 'Machine wash gentle cycle, wash inside out')}</div>
                </div>
              )}
            </div>

            {/* Store inventory lookup */}
            <div style={{ borderBottom: '1px solid #e5e5e5' }}>
              <button
                onClick={() => setOpenSection(openSection === 'stores' ? '' : 'stores')}
                style={{ width: '100%', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '0.9rem' }}
              >
                <span>{lang === 'vi' ? 'TÌM CÒN HÀNG TẠI CỬA HÀNG VẬT LÝ' : 'CHECK IN-STORE AVAILABILITY'}</span>
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
                            {inv.inStock ? (lang === 'vi' ? `Còn ${inv.quantity} sp` : `${inv.quantity} in stock`) : (lang === 'vi' ? 'Hết hàng' : 'Out of stock')}
                          </span>
                        </div>
                      </div>
                    )) || <div>{lang === 'vi' ? 'Vui lòng chọn size và màu sắc để tra cứu tồn kho cửa hàng.' : 'Please select a size and color to check in-store stock.'}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      <ProductReviewsSection productId={product.id} productName={product.name} onReviewsChange={setReviews} />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: '1px solid #e5e5e5', paddingTop: '40px' }}>
          <h2 className="heading-section" style={{ marginBottom: '24px' }}>
            {t('related_products')}
          </h2>
          <div className="responsive-product-grid">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="mobile-only animate-slide-up" style={{
        position: 'fixed',
        bottom: '60px',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #e0e0e0',
        padding: '10px 16px',
        zIndex: 1400,
        boxShadow: '0 -4px 15px rgba(0,0,0,0.08)',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ minWidth: '100px' }}>
          <div style={{ fontSize: '0.72rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
            {selectedColor} / {selectedSize || (lang === 'vi' ? 'Chọn size' : 'Select size')}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: '900', color: product.salePrice ? '#e60012' : '#111' }}>
            {formatPrice(currentPrice)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.totalStock <= 0}
            className="btn-beo btn-beo-primary"
            style={{ height: '42px', padding: '0 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            <ShoppingBag size={15} />
            <span>{t('add_to_cart')}</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.totalStock <= 0}
            className="btn-beo btn-beo-red"
            style={{ height: '42px', padding: '0 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            <span>{t('buy_now')}</span>
          </button>
        </div>
      </div>

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

      {/* Customizer Studio Modal */}
      {isCustomizerModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(3px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ width: '100%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}>
            <ProductCustomizerStudio
              initialProduct={product}
              onClose={() => setIsCustomizerModalOpen(false)}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      )}
    </div>
  );
};
