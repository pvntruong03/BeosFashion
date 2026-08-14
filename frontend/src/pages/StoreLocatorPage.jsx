import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Navigation, Search, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const StoreLocatorPage = ({ onNavigate }) => {
  const [stores, setStores] = useState([]);
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStore, setActiveStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.get('/stores');
        if (res.data) {
          const list = res.data.filter((s) => !s.centralWarehouse);
          setStores(list);
          if (list.length > 0) setActiveStore(list[0]);
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const filteredStores = stores.filter((s) => {
    const matchCity = selectedCity === 'ALL' || s.city.includes(selectedCity);
    const matchQuery = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchQuery;
  });

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="heading-section" style={{ fontSize: '1.8rem', textTransform: 'uppercase' }}>
          Tìm Cửa Hàng BEO Gần Nhất
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
          Khám phá danh sách các cửa hàng BEO chính hãng tại Việt Nam, giờ mở cửa và địa chỉ
        </p>
      </div>

      {/* Filter by City & Search */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'Tất cả chi nhánh' },
            { id: 'Cần Thơ', label: 'Cần Thơ' },
            { id: 'Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
            { id: 'Hà Nội', label: 'Hà Nội' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCity(c.id)}
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: '700',
                border: selectedCity === c.id ? '2px solid #111' : '1px solid #ddd',
                backgroundColor: selectedCity === c.id ? '#111' : '#fff',
                color: selectedCity === c.id ? '#fff' : '#333'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, maxWidth: '360px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Tìm theo tên TTTM hoặc đường..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #ccc', outline: 'none' }}
          />
          <Search size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '10px' }} />
        </div>
      </div>

      {/* Store Locator Main Grid: List + Map Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
        {/* Left Store List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto' }}>
          {filteredStores.map((st) => (
            <div
              key={st.id}
              onClick={() => setActiveStore(st)}
              style={{
                padding: '20px',
                border: activeStore?.id === st.id ? '2px solid #e60012' : '1px solid #e5e5e5',
                backgroundColor: activeStore?.id === st.id ? '#fcfcfc' : '#ffffff',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#111' }}>{st.name}</h3>
                <span className="badge-uq gray">{st.city}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>
                <MapPin size={16} color="#e60012" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{st.address}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#555', marginBottom: '6px' }}>
                <Clock size={16} color="#555" />
                <span>Giờ mở cửa: <strong>{st.openingHours}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#555' }}>
                <Phone size={16} color="#555" />
                <span>{st.phone}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Store Detail & Simulated Map Card */}
        {activeStore && (
          <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5', padding: '24px' }}>
            <img
              src={activeStore.imageUrl || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'}
              alt={activeStore.name}
              style={{ width: '100%', height: '220px', objectFit: 'cover', marginBottom: '20px' }}
            />

            <h2 className="heading-section" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
              {activeStore.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '16px', lineHeight: 1.5 }}>
              {activeStore.address}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#00875a" />
                <span>Đang mở cửa • Đóng cửa lúc {activeStore.openingHours.split('-')[1]?.trim() || '22:00'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00875a" />
                <span>Có hỗ trợ dịch vụ Click & Collect (Nhận hàng tại quầy trong 2h)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#00875a" />
                <span>Hỗ trợ dịch vụ cắt gấu quần miễn phí</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('products')}
              className="btn-uq btn-uq-primary"
              style={{ width: '100%' }}
            >
              <span>Xem Sản Phẩm Có Sẵn Tại Cửa Hàng Này</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
