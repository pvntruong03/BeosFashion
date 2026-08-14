import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage = ({ onNavigate }) => {
  const { wishlistItems, totalWishlist } = useWishlist();
  const { formatPrice, t } = useLanguage();

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="heading-section" style={{ fontSize: '1.8rem', textTransform: 'uppercase' }}>
          Danh Sách Yêu Thích Của Bạn ({totalWishlist})
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
          Các sản phẩm bạn đã lưu để theo dõi giá và mua sắm sau
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
          <Heart size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Danh sách yêu thích đang trống</h3>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '24px' }}>
            Bấm vào biểu tượng trái tim trên các sản phẩm bạn yêu thích để lưu vào đây!
          </p>
          <button onClick={() => onNavigate('products')} className="btn-uq btn-uq-primary">
            Khám phá sản phẩm ngay
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '28px'
        }}>
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
