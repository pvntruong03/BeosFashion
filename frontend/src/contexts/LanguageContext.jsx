import React, { createContext, useContext, useState } from 'react';

const translations = {
  vi: {
    // Navigation
    women: 'NỮ',
    men: 'NAM',
    kids: 'TRẺ EM',
    baby: 'EM BÉ',
    lifewear: 'BỘ SƯU TẬP',
    search_placeholder: 'Tìm kiếm sản phẩm, mã hàng, chất liệu...',
    store_locator: 'Tìm cửa hàng',
    wishlist: 'Yêu thích',
    cart: 'Giỏ hàng',
    login_register: 'Đăng nhập / Đăng ký',
    account: 'Tài khoản',
    orders: 'Đơn hàng của tôi',
    my_profile: 'Hồ sơ của tôi',
    logout: 'Đăng xuất',
    admin_panel: 'Trang Quản trị (Admin)',
    staff_panel: 'Quản Lý Cửa Hàng (Store Manager)',

    // Home
    hero_title: 'AIRism & LifeWear SS26',
    hero_subtitle: 'Cảm giác thoáng mát tức thì. Thiết kế tinh tế cho phong cách hàng ngày.',
    shop_men: 'Khám phá đồ Nam',
    shop_women: 'Khám phá đồ Nữ',
    new_arrivals: 'Hàng Mới Về',
    best_sellers: 'Sản Phẩm Bán Chạy',
    limited_offers: 'Khuyến Mãi Có Hạn',
    featured_categories: 'Danh Mục Nổi Bật',
    lifewear_story_title: 'Triết lý LifeWear',
    lifewear_story_desc: 'Trang phục đơn giản, chất lượng cao, mang vẻ đẹp phổ quát và không ngừng được hoàn thiện để mang lại cuộc sống tốt đẹp hơn cho tất cả mọi người.',

    // Product Listing
    filters: 'Bộ lọc',
    sort_by: 'Sắp xếp theo',
    price_low_high: 'Giá: Thấp đến Cao',
    price_high_low: 'Giá: Cao đến Thấp',
    newest: 'Mới nhất',
    popular: 'Phổ biến nhất',
    color: 'Màu sắc',
    size: 'Kích cỡ',
    price_range: 'Khoảng giá',
    material: 'Chất liệu',
    clear_filters: 'Xóa tất cả bộ lọc',
    products_found: 'sản phẩm',

    // Product Detail
    select_color: 'Màu sắc:',
    select_size: 'Kích thước:',
    size_guide: 'Bảng quy đổi & Gợi ý Size',
    add_to_cart: 'Thêm Vào Giỏ Hàng',
    buy_now: 'Mua Ngay',
    in_stock: 'Còn hàng',
    low_stock: 'Sắp hết hàng',
    out_of_stock: 'Hết hàng',
    product_details: 'Chi tiết sản phẩm',
    material_care: 'Chất liệu & Hướng dẫn giặt ủi',
    customer_reviews: 'Đánh giá từ khách hàng',
    write_review: 'Viết nhận xét',
    related_products: 'Sản phẩm tương tự',

    // Cart & Checkout
    shopping_cart: 'Giỏ hàng của bạn',
    empty_cart: 'Giỏ hàng của bạn đang trống',
    free_shipping_hint: 'Mua thêm để được Miễn phí vận chuyển toàn quốc!',
    free_shipping_achieved: 'Chúc mừng! Bạn đã đủ điều kiện Miễn phí vận chuyển!',
    subtotal: 'Tạm tính',
    shipping_fee: 'Phí vận chuyển',
    discount: 'Giảm giá',
    total: 'Tổng cộng',
    checkout: 'Tiến hành Thanh toán',
    coupon_placeholder: 'Nhập mã giảm giá (VD: BEO10)',
    apply: 'Áp dụng',
    shipping_info: 'Thông tin giao hàng',
    payment_method: 'Phương thức thanh toán',
    place_order: 'Xác nhận Đặt hàng',

    // Staff & POS
    pos_terminal: 'POS Bán Hàng Tại Quầy',
    order_fulfillment: 'Xử Lý Đơn Hàng',
    branch_inventory: 'Tồn Kho Chi Nhánh',
    stock_transfer: 'Yêu Cầu Điều Chuyển',
    daily_report: 'Báo Cáo Doanh Thu Ca',
  },
  en: {
    // Navigation
    women: 'WOMEN',
    men: 'MEN',
    kids: 'KIDS',
    baby: 'BABY',
    lifewear: 'COLLECTIONS',
    search_placeholder: 'Search items, product code, material...',
    store_locator: 'Store Locator',
    wishlist: 'Wishlist',
    cart: 'Cart',
    login_register: 'Login / Register',
    account: 'Account',
    orders: 'My Orders',
    my_profile: 'My Profile',
    logout: 'Logout',
    admin_panel: 'Admin Portal',
    staff_panel: 'Staff Portal',

    // Home
    hero_title: 'AIRism & LifeWear SS26',
    hero_subtitle: 'Instant cool touch. Minimalist silhouettes tailored for everyday comfort.',
    shop_men: 'Shop Men',
    shop_women: 'Shop Women',
    new_arrivals: 'New Arrivals',
    best_sellers: 'Best Sellers',
    limited_offers: 'Limited Offers',
    featured_categories: 'Featured Categories',
    lifewear_story_title: 'The LifeWear Philosophy',
    lifewear_story_desc: 'Simple, high-quality everyday clothing with a practical sense of beauty—ingenious in detail, thought through with life’s needs in mind.',

    // Product Listing
    filters: 'Filters',
    sort_by: 'Sort By',
    price_low_high: 'Price: Low to High',
    price_high_low: 'Price: High to Low',
    newest: 'Newest',
    popular: 'Most Popular',
    color: 'Color',
    size: 'Size',
    price_range: 'Price Range',
    material: 'Material',
    clear_filters: 'Clear All Filters',
    products_found: 'products',

    // Product Detail
    select_color: 'Color:',
    select_size: 'Size:',
    size_guide: 'Size Guide & Advisor',
    add_to_cart: 'Add to Bag',
    buy_now: 'Buy Now',
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    product_details: 'Product Details',
    material_care: 'Material & Care Instructions',
    customer_reviews: 'Customer Reviews',
    write_review: 'Write a Review',
    related_products: 'You May Also Like',

    // Cart & Checkout
    shopping_cart: 'Your Shopping Bag',
    empty_cart: 'Your shopping bag is empty',
    free_shipping_hint: 'Add more to get Free Standard Shipping nationwide!',
    free_shipping_achieved: 'Congrats! You are eligible for Free Shipping!',
    subtotal: 'Subtotal',
    shipping_fee: 'Shipping Fee',
    discount: 'Discount',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    coupon_placeholder: 'Promo code (e.g. BEO10)',
    apply: 'Apply',
    shipping_info: 'Shipping Information',
    payment_method: 'Payment Method',
    place_order: 'Place Order',

    // Staff & POS
    pos_terminal: 'In-Store POS Terminal',
    order_fulfillment: 'Order Fulfillment',
    branch_inventory: 'Store Inventory',
    stock_transfer: 'Stock Transfer Request',
    daily_report: 'Daily Shift Report',
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('vi');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  const formatPrice = (amount) => {
    if (!amount) amount = 0;
    if (lang === 'vi') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    } else {
      const inUSD = (amount / 25000).toFixed(2);
      return `$${inUSD}`;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
