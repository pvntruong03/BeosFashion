// ==========================================
// BEO MODERN FASHION - FEATURE TOGGLE SERVICE
// Cho phép Admin bật/tắt mọi tính năng mở rộng
// ==========================================

const FEATURE_STORAGE_KEY = 'beo_feature_toggles';

export const DEFAULT_FEATURE_CONFIG = {
  aiSizeAssistant: {
    id: 'aiSizeAssistant',
    name: 'Trợ Lý AI Gợi Ý Size (AI Size Assistant)',
    category: 'Trải Nghiệm Khách Hàng',
    description: 'Tính toán và gợi ý kích thước (S/M/L/XL) thông minh theo chiều cao, cân nặng và form dáng mong muốn.',
    enabled: true,
    badge: 'AI Smart'
  },
  productReviews: {
    id: 'productReviews',
    name: 'Đánh Giá & Nhận Xét Kèm Ảnh (Reviews & Ratings)',
    category: 'Trải Nghiệm Khách Hàng',
    description: 'Cho phép khách hàng chấm điểm 1-5 sao, nhận xét chất vải, độ vừa vặn và xem ảnh mặc thực tế.',
    enabled: true,
    badge: 'Tương Tác'
  },
  flashSale: {
    id: 'flashSale',
    name: 'Chương Trình Flash Sale Đếm Ngược (Countdown Deals)',
    category: 'Marketing & Bán Hàng',
    description: 'Hiển thị khu vực giảm giá sốc có đồng hồ đếm ngược giờ vàng và thanh tiến độ đã bán tại Trang chủ.',
    enabled: true,
    badge: 'Hot Deal'
  },
  outfitStylist: {
    id: 'outfitStylist',
    name: 'Gợi Ý Phối Trọn Bộ Outfit (Mix & Match Stylist)',
    category: 'Trải Nghiệm Khách Hàng',
    description: 'Gợi ý nguyên set đồ hoàn chỉnh kèm ưu đãi giảm thêm 10% khi mua trọn bộ trong 1 click.',
    enabled: true,
    badge: 'Stylist'
  },
  loyaltyPoints: {
    id: 'loyaltyPoints',
    name: 'Tích Điểm & Hạng Hội Viên VIP (Loyalty & VIP Tiers)',
    category: 'Chăm Sóc Khách Hàng',
    description: 'Tích điểm khi mua sắm, hiển thị thẻ thành viên VIP (Bạc/Vàng/Kim Cương) và trừ điểm trực tiếp khi thanh toán.',
    enabled: true,
    badge: 'VIP Club'
  },
  excelExport: {
    id: 'excelExport',
    name: 'Xuất Dữ Liệu Excel / CSV Chuyên Nghiệp (Excel Export)',
    category: 'Vận Hành & Quản Trị',
    description: '1-Click xuất toàn bộ danh sách 50+ đơn hàng, doanh thu và tồn kho ra file Excel chuẩn UTF-8.',
    enabled: true,
    badge: 'Admin Tool'
  },
  posBarcode: {
    id: 'posBarcode',
    name: 'Quét & In Tem Mã Vạch Barcode POS (Barcode Scanner)',
    category: 'Vận Hành Showroom',
    description: 'Tạo mã vạch Code128 cho từng phân loại màu-size và quét barcode bán hàng siêu tốc tại quầy Cần Thơ.',
    enabled: true,
    badge: 'POS Store'
  },
  showroomFittingBooking: {
    id: 'showroomFittingBooking',
    name: 'Đặt Lịch Thử Đồ Tại Showroom Cần Thơ (Click & Collect)',
    category: 'Vận Hành Showroom',
    description: 'Khách chọn đồ online và đặt lịch hẹn thử đồ tại phòng thử VIP Showroom BEO 123 Đường 30/4 Cần Thơ.',
    enabled: true,
    badge: 'Showroom CT'
  }
};

export const getFeatureToggles = () => {
  try {
    const stored = localStorage.getItem(FEATURE_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(FEATURE_STORAGE_KEY, JSON.stringify(DEFAULT_FEATURE_CONFIG));
      return DEFAULT_FEATURE_CONFIG;
    }
    const parsed = JSON.parse(stored);
    // Merge with defaults in case new keys were added
    return { ...DEFAULT_FEATURE_CONFIG, ...parsed };
  } catch (e) {
    return DEFAULT_FEATURE_CONFIG;
  }
};

export const isFeatureEnabled = (featureKey) => {
  const toggles = getFeatureToggles();
  return toggles[featureKey]?.enabled ?? true;
};

export const toggleFeature = (featureKey) => {
  const current = getFeatureToggles();
  if (current[featureKey]) {
    current[featureKey].enabled = !current[featureKey].enabled;
    localStorage.setItem(FEATURE_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('beo_feature_toggles_updated'));
    return current[featureKey].enabled;
  }
  return false;
};

export const setFeatureEnabled = (featureKey, isEnabled) => {
  const current = getFeatureToggles();
  if (current[featureKey]) {
    current[featureKey].enabled = Boolean(isEnabled);
    localStorage.setItem(FEATURE_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('beo_feature_toggles_updated'));
  }
};

export const resetFeatureTogglesToDefault = () => {
  localStorage.setItem(FEATURE_STORAGE_KEY, JSON.stringify(DEFAULT_FEATURE_CONFIG));
  window.dispatchEvent(new Event('beo_feature_toggles_updated'));
  return DEFAULT_FEATURE_CONFIG;
};
