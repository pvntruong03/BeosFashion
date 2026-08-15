import React, { useState, useEffect, useCallback } from 'react';
import { Filter, ChevronDown, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

export const ProductListingPage = ({ initialFilters = {}, onNavigate }) => {
  const { t, lang, formatPrice } = useLanguage();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [gender, setGender] = useState(initialFilters.gender || '');
  const [collection, setCollection] = useState(initialFilters.collection || '');
  const [selectedColor, setSelectedColor] = useState(initialFilters.color || '');
  const [selectedSize, setSelectedSize] = useState(initialFilters.size || '');
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [search, setSearch] = useState(initialFilters.search || '');
  const [isNew, setIsNew] = useState(initialFilters.isNew || false);
  const [bestSeller, setBestSeller] = useState(initialFilters.bestSeller || false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (gender) params.append('gender', gender);
      if (collection) params.append('collection', collection);
      if (selectedColor) params.append('color', selectedColor);
      if (selectedSize) params.append('size', selectedSize);
      if (maxPrice && maxPrice < 2000000) params.append('maxPrice', maxPrice);
      if (search) params.append('search', search);
      if (isNew) params.append('isNew', 'true');
      if (bestSeller) params.append('bestSeller', 'true');
      params.append('sortBy', sortBy);
      params.append('sortDirection', sortDirection);
      params.append('sizePerPage', '24');

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data) {
        setProducts(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  }, [gender, collection, selectedColor, selectedSize, maxPrice, search, isNew, bestSeller, sortBy, sortDirection]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Color options
  const colorOptions = [
    { label: 'Black', hex: '#111111', val: 'BLACK' },
    { label: 'White', hex: '#ffffff', val: 'WHITE' },
    { label: 'Gray', hex: '#7f8c8d', val: 'GRAY' },
    { label: 'Blue', hex: '#2980b9', val: 'BLUE' },
    { label: 'Beige', hex: '#d2b48c', val: 'BEIGE' },
    { label: 'Olive', hex: '#556b2f', val: 'OLIVE' },
    { label: 'Pink', hex: '#fadbd8', val: 'PINK' },
    { label: 'Navy', hex: '#1a252f', val: 'NAVY' },
  ];

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const clearAllFilters = () => {
    setGender('');
    setCollection('');
    setSelectedColor('');
    setSelectedSize('');
    setMaxPrice(2000000);
    setSearch('');
    setIsNew(false);
    setBestSeller(false);
  };

  const hasActiveFilters = gender || collection || selectedColor || selectedSize || maxPrice < 2000000 || search || isNew || bestSeller;

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Page Title & Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.8rem', color: '#767676', marginBottom: '8px' }}>
          {lang === 'vi' ? 'Trang chủ / Sản phẩm' : 'Home / Products'} {gender ? `/ ${gender}` : ''} {collection ? `/ ${collection}` : ''}
        </div>
        <h1 className="heading-section" style={{ fontSize: '1.8rem', textTransform: 'uppercase' }}>
          {search
            ? (lang === 'vi' ? `Kết quả tìm kiếm cho: "${search}"` : `Search Results for: "${search}"`)
            : (gender ? `${gender} Collection` : (collection || (lang === 'vi' ? 'Tất cả sản phẩm' : 'All Products')))}
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
          {lang === 'vi' ? 'Tìm thấy' : 'Found'} <strong>{totalElements}</strong> {lang === 'vi' ? 'sản phẩm phù hợp' : 'matching products'}
        </div>
      </div>

      {/* Top Bar: Active filters & Sorting */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '14px 0',
        borderTop: '1px solid #e5e5e5',
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '28px'
      }}>
        {/* Active filter badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="btn-uq btn-uq-outline-gray"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <SlidersHorizontal size={16} />
            <span>{t('filters')}</span>
          </button>

          {gender && (
            <span className="badge-uq gray" style={{ padding: '6px 10px', gap: '6px' }}>
              {lang === 'vi' ? 'Giới tính:' : 'Gender:'} {gender}
              <button onClick={() => setGender('')}><X size={12} /></button>
            </span>
          )}

          {collection && (
            <span className="badge-uq gray" style={{ padding: '6px 10px', gap: '6px' }}>
              {lang === 'vi' ? 'BST:' : 'Collection:'} {collection}
              <button onClick={() => setCollection('')}><X size={12} /></button>
            </span>
          )}

          {selectedColor && (
            <span className="badge-uq gray" style={{ padding: '6px 10px', gap: '6px' }}>
              {lang === 'vi' ? 'Màu:' : 'Color:'} {selectedColor}
              <button onClick={() => setSelectedColor('')}><X size={12} /></button>
            </span>
          )}

          {selectedSize && (
            <span className="badge-uq gray" style={{ padding: '6px 10px', gap: '6px' }}>
              Size: {selectedSize}
              <button onClick={() => setSelectedSize('')}><X size={12} /></button>
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{ fontSize: '0.8rem', color: '#e60012', fontWeight: '700', textDecoration: 'underline' }}
            >
              {t('clear_filters')}
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>{t('sort_by')}:</span>
          <select
            value={`${sortBy}_${sortDirection}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split('_');
              setSortBy(sb);
              setSortDirection(sd);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              fontWeight: '600',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="createdAt_DESC">{t('newest')}</option>
            <option value="basePrice_ASC">{t('price_low_high')}</option>
            <option value="basePrice_DESC">{t('price_high_low')}</option>
            <option value="averageRating_DESC">{lang === 'vi' ? 'Đánh giá cao nhất' : 'Highest Rated'}</option>
          </select>
        </div>
      </div>

      {/* Mobile Quick Filter Chips (Horizontal Scroll) */}
      <div
        className="mobile-only no-scrollbar"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px 0 16px 0',
          marginBottom: '8px'
        }}
      >
        {[
          { label: lang === 'vi' ? 'Tất cả' : 'All', active: !gender && !collection, action: () => { setGender(''); setCollection(''); } },
          { label: lang === 'vi' ? 'Nam' : 'Men', active: gender === 'MEN', action: () => setGender(gender === 'MEN' ? '' : 'MEN') },
          { label: lang === 'vi' ? 'Nữ' : 'Women', active: gender === 'WOMEN', action: () => setGender(gender === 'WOMEN' ? '' : 'WOMEN') },
          { label: 'AIRism', active: collection === 'AIRism', action: () => setCollection(collection === 'AIRism' ? '' : 'AIRism') },
          { label: 'LifeWear', active: collection === 'LifeWear Essentials', action: () => setCollection(collection === 'LifeWear Essentials' ? '' : 'LifeWear Essentials') },
          { label: 'UT Graphic', active: collection === 'UT Graphic', action: () => setCollection(collection === 'UT Graphic' ? '' : 'UT Graphic') },
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={chip.action}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: '700',
              borderRadius: '9999px',
              border: chip.active ? '1.5px solid #e60012' : '1px solid #ddd',
              backgroundColor: chip.active ? '#e60012' : '#ffffff',
              color: chip.active ? '#ffffff' : '#333333',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div style={{ display: 'flex', gap: '36px' }}>
        {/* Left Filter Sidebar (Desktop) */}
        <div style={{
          width: '260px',
          flexShrink: 0,
          display: mobileFilterOpen ? 'block' : 'none'
        }}
        className="desktop-filter-sidebar"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Gender Filter */}
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Giới Tính' : 'Gender'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                {[
                  { label: lang === 'vi' ? 'Tất cả giới tính' : 'All Genders', val: '' },
                  { label: lang === 'vi' ? 'Nam (Men)' : 'Men', val: 'MEN' },
                  { label: lang === 'vi' ? 'Nữ (Women)' : 'Women', val: 'WOMEN' },
                ].map((g) => (
                  <label key={g.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="gender_filter"
                      checked={gender === g.val}
                      onChange={() => setGender(g.val)}
                      style={{ accentColor: '#e60012' }}
                    />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Collection Filter */}
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                {lang === 'vi' ? 'Bộ Sưu Tập (Collection)' : 'Collections'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                {['', 'AIRism', 'HEATTECH', 'UT Graphic', 'Ultra Light Down', 'LifeWear Essentials'].map((c) => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="collection_filter"
                      checked={collection === c}
                      onChange={() => setCollection(c)}
                      style={{ accentColor: '#e60012' }}
                    />
                    <span>{c || (lang === 'vi' ? 'Tất cả BST' : 'All Collections')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Swatch Filter */}
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                {t('color')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {colorOptions.map((co) => (
                  <button
                    key={co.val}
                    onClick={() => setSelectedColor(selectedColor === co.val ? '' : co.val)}
                    title={co.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px',
                      border: selectedColor === co.val ? '2px solid #111' : '1px solid #eee',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: co.hex,
                      border: '1px solid #ccc'
                    }} />
                    <span style={{ fontSize: '0.7rem', color: '#555' }}>{co.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                {t('size')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {sizeOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      border: selectedSize === s ? '2px solid #111' : '1px solid #ddd',
                      backgroundColor: selectedSize === s ? '#111' : '#fff',
                      color: selectedSize === s ? '#fff' : '#333',
                      textAlign: 'center'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  {lang === 'vi' ? 'Giá Tối Đa' : 'Max Price'}
                </span>
                <span style={{ fontWeight: '700', color: '#e60012', fontSize: '0.9rem' }}>{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#e60012' }}
              />
            </div>
          </div>
        </div>

        {/* Right Products Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} style={{ height: '380px', backgroundColor: '#f0f0f0', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fafafa' }}>
              <Filter size={48} color="#ccc" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
                {lang === 'vi' ? 'Không tìm thấy sản phẩm nào' : 'No products found'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>
                {lang === 'vi'
                  ? 'Vui lòng thử bỏ bớt bộ lọc hoặc tìm kiếm với từ khóa khác.'
                  : 'Try clearing some filters or searching with different keywords.'}
              </p>
              <button onClick={clearAllFilters} className="btn-uq btn-uq-primary">
                {t('clear_filters')}
              </button>
            </div>
          ) : (
            <div className="responsive-product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
