import axios from 'axios';

const isVietnamese = () => localStorage.getItem('beo_lang') === 'vi';

const localizedApiMessages = [
  [/invalid email or password/i, 'Email hoặc mật khẩu không đúng.', 'Invalid email or password.'],
  [/item does not belong to (the )?current cart|cart item not found/i, 'Sản phẩm không còn trong giỏ hàng hiện tại.', 'This item is no longer in your shopping bag.'],
  [/product variant not found/i, 'Không tìm thấy phiên bản sản phẩm đã chọn.', 'The selected product variant could not be found.'],
  [/product is currently unavailable/i, 'Sản phẩm hiện không còn được bán.', 'This product is currently unavailable.'],
  [/requested quantity exceeds available stock|insufficient stock/i, 'Số lượng yêu cầu vượt quá tồn kho hiện có.', 'The requested quantity exceeds the available stock.'],
  [/cannot checkout with an empty cart/i, 'Không thể thanh toán khi giỏ hàng đang trống.', 'Your shopping bag is empty.'],
  [/access denied|forbidden/i, 'Bạn không có quyền thực hiện thao tác này.', 'You do not have permission to perform this action.'],
  [/validation failed/i, 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.', 'Some information is invalid. Please check it and try again.'],
  [/Dữ liệu không hợp lệ hoặc đã tồn tại/i, 'Dữ liệu không hợp lệ hoặc đã tồn tại. Vui lòng kiểm tra mã sản phẩm, SKU và barcode.', 'Some data is invalid or already exists. Please check the product code, SKU, and barcode.'],
];

const localizeApiMessage = (message) => {
  const source = String(message || '');
  const vietnamese = isVietnamese();
  const match = localizedApiMessages.find(([pattern]) => pattern.test(source));

  if (match) return vietnamese ? match[1] : match[2];

  // Do not expose a server message in the language opposite to the selected UI.
  const containsVietnamese = /[À-ỹĐđ]/.test(source);
  if (!vietnamese && containsVietnamese) return 'Unable to complete the request. Please try again.';
  if (vietnamese && source && !containsVietnamese) return 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.';
  return source || (vietnamese ? 'Đã xảy ra lỗi trong quá trình xử lý.' : 'An error occurred while processing your request.');
};

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '/api';
  }
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = 'https://' + url;
  }
  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url = url.replace(/\/+$/, '') + '/api';
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT and guest sessionId
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('beo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let sessionId = localStorage.getItem('beo_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('beo_session_id', sessionId);
    }
    config.headers['X-Session-Id'] = sessionId;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified response unwrapping & handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (localStorage.getItem('beo_token')) {
        localStorage.removeItem('beo_token');
        localStorage.removeItem('beo_user');
      }
    }
    let message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      (isVietnamese() ? 'Đã xảy ra lỗi trong quá trình xử lý.' : 'An error occurred while processing your request.');

    if (
      typeof message === 'string' &&
      (message.includes('JSON parse error') ||
        message.includes('Cannot deserialize') ||
        message.includes('Enum class') ||
        message.includes('NullPointerException') ||
        message.includes('Failed to convert') ||
        message.includes('could not execute statement') ||
        message.includes('SQL') ||
        message.includes('Value not permitted') ||
        message.includes('ConstraintViolation') ||
        message.includes('org.hibernate') ||
        message.includes('org.springframework'))
    ) {
      message = isVietnamese()
        ? 'Vui lòng kiểm tra và chọn đầy đủ thông tin (kích cỡ, màu sắc, phương thức thanh toán...) trước khi tiếp tục.'
        : 'Please check and complete all required information (size, color, payment method, and more) before continuing.';
    }

    return Promise.reject(new Error(localizeApiMessage(message)));
  }
);

export default api;
