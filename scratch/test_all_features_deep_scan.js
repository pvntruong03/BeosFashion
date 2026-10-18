const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = [];
      res.on('data', (chunk) => { data.push(chunk); });
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(buffer.toString('utf8')) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: buffer.toString('utf8') });
          }
        } else {
          resolve({ status: res.statusCode, headers: res.headers, buffer, raw: buffer.toString('utf8') });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function api(pathStr, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api${pathStr}`,
    method,
    headers
  }, data);
}

async function runDeepScan() {
  console.log('=================================================================================');
  console.log('🌟 BEO MODERN FASHION - 100% COMPREHENSIVE FUNCTIONAL AUDIT & ERROR DETECTION');
  console.log('=================================================================================\n');

  let passed = 0;
  let failed = 0;
  const issues = [];

  function test(feature, successCondition, failureDetail = '') {
    if (successCondition) {
      console.log(`  ✅ [PASS] ${feature}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${feature} ${failureDetail ? '-> ' + failureDetail : ''}`);
      issues.push({ feature, detail: failureDetail });
      failed++;
    }
  }

  const timestamp = Date.now();
  const runId = timestamp.toString().slice(-6);

  // -------------------------------------------------------------
  // MODULE 1: PUBLIC CATALOG, NAVIGATION & AI SERVICES
  // -------------------------------------------------------------
  console.log('📦 MODULE 1: PUBLIC CATALOG & AI SERVICES');

  const catRes = await api('/categories');
  test('1.1 Tải danh mục cây phân cấp (Category Tree)', catRes.status === 200 && Array.isArray(catRes.body?.data) && catRes.body.data.length > 0, `Status: ${catRes.status}`);

  const prodsRes = await api('/products?page=0&sizePerPage=10');
  test('1.2 Danh sách sản phẩm phân trang (/products)', prodsRes.status === 200 && prodsRes.body?.data?.content?.length > 0, `Status: ${prodsRes.status}`);

  const menProdsRes = await api('/products?gender=MEN&sizePerPage=10');
  const allMen = menProdsRes.body?.data?.content || [];
  test('1.3 Bộ lọc thời trang Nam (Gender: MEN)', menProdsRes.status === 200 && allMen.every(p => p.gender === 'MEN' || p.gender === 'UNISEX'), `Status: ${menProdsRes.status}`);

  const womenProdsRes = await api('/products?gender=WOMEN&sizePerPage=10');
  const allWomen = womenProdsRes.body?.data?.content || [];
  test('1.4 Bộ lọc thời trang Nữ (Gender: WOMEN)', womenProdsRes.status === 200 && allWomen.every(p => p.gender === 'WOMEN' || p.gender === 'UNISEX'), `Status: ${womenProdsRes.status}`);

  const allProdsRaw = await api('/products?sizePerPage=200');
  const allItems = allProdsRaw.body?.data?.content || [];
  const kidsItems = allItems.filter(p => 
    p.gender === 'KIDS' || 
    p.gender === 'BABY' || 
    (p.name && /trẻ em|bé|kids|baby/i.test(p.name)) ||
    (p.description && /trẻ em|sơ sinh|quần áo bé/i.test(p.description))
  );
  test('1.5 Quy tắc dự án: TUYỆT ĐỐI KHÔNG CÓ SẢN PHẨM TRẺ EM (NO KIDS / BABY)', kidsItems.length === 0, `Phát hiện ${kidsItems.length} sản phẩm trẻ em vi phạm: ${kidsItems.map(x => x.name).join(', ')}`);

  const sampleProd = allItems[0];
  let sampleSlug = sampleProd?.slug;
  const prodDetailRes = await api(`/products/${sampleProd.id}`);
  test('1.6 Chi tiết sản phẩm theo ID kèm ma trận biến thể', prodDetailRes.status === 200 && prodDetailRes.body?.data?.variants?.length > 0, `Status: ${prodDetailRes.status}`);

  if (sampleSlug) {
    const slugRes = await api(`/products/slug/${sampleSlug}`);
    test(`1.7 Chi tiết sản phẩm theo Slug (${sampleSlug})`, slugRes.status === 200 && slugRes.body?.data?.id === sampleProd.id, `Status: ${slugRes.status}`);
  }

  const relatedRes = await api(`/products/${sampleProd.id}/related`);
  test('1.8 Sản phẩm liên quan/gợi ý (/products/{id}/related)', relatedRes.status === 200 && Array.isArray(relatedRes.body?.data), `Status: ${relatedRes.status}`);

  const searchRes = await api('/products/search?q=shirt');
  test('1.9 Tìm kiếm tức thì / Gợi ý autocomplete (/products/search)', searchRes.status === 200 && Array.isArray(searchRes.body?.data), `Status: ${searchRes.status}`);

  const featRes = await api('/products/featured');
  test('1.10 Sản phẩm nổi bật (/products/featured)', featRes.status === 200 && Array.isArray(featRes.body?.data), `Status: ${featRes.status}`);

  const newRes = await api('/products/new-arrivals');
  test('1.11 Hàng mới về (/products/new-arrivals)', newRes.status === 200 && Array.isArray(newRes.body?.data), `Status: ${newRes.status}`);

  const bestRes = await api('/products/best-sellers');
  test('1.12 Hàng bán chạy (/products/best-sellers)', bestRes.status === 200 && Array.isArray(bestRes.body?.data), `Status: ${bestRes.status}`);

  const visualSearchRes = await api('/products/visual-search', 'POST', {
    modelId: 'Xenova/clip-vit-base-patch32',
    clipScores: { [sampleProd.id]: 0.95 },
    detectedLabels: ['shirt', 'apparel']
  });
  test('1.13 AI Tìm kiếm hình ảnh thời trang (/products/visual-search)', visualSearchRes.status === 200 && visualSearchRes.body?.data?.matchedProducts?.length > 0, `Status: ${visualSearchRes.status}`);

  const aiStatusRes = await api('/ai/status');
  test('1.14 Kiểm tra dịch vụ Trợ lý AI BEO (/ai/status)', aiStatusRes.status === 200 && aiStatusRes.body?.provider, `Status: ${aiStatusRes.status}`);

  const aiChatRes = await api('/ai/chat', 'POST', {
    message: 'Tư vấn cho tôi một chiếc áo sơ mi nam phù hợp đi làm',
    context: { currentPage: 'products' }
  });
  test('1.15 Tương tác tư vấn Trợ lý AI Fashion Advisor (/ai/chat)', aiChatRes.status === 200 && aiChatRes.body?.reply, `Status: ${aiChatRes.status}`);

  const storeRes = await api('/stores');
  const stores = storeRes.body?.data || [];
  const canThoStore = stores.find(s => s.city === 'Cần Thơ' || s.code === 'STR-CT-01' || s.code === 'STR-BEO-01');
  test('1.16 Showroom Locator: Chi nhánh trung tâm Showroom Cần Thơ', storeRes.status === 200 && !!canThoStore, `Stores found: ${stores.map(s => s.code).join(', ')}`);

  const lookbookRes = await api('/lookbooks');
  test('1.17 Danh mục Bộ sưu tập Lookbook thời trang (/lookbooks)', lookbookRes.status === 200 && Array.isArray(lookbookRes.body?.data), `Status: ${lookbookRes.status}`);

  const newsRes = await api('/newsletter/subscribe', 'POST', { email: `newsletter_${runId}@beofashion.vn` });
  test('1.18 Đăng ký nhận bản tin khuyến mãi (/newsletter/subscribe)', newsRes.status === 200, `Status: ${newsRes.status}`);

  // -------------------------------------------------------------
  // MODULE 2: CUSTOMER FLOW (AUTH, WISHLIST, CART, COUPON, ORDER)
  // -------------------------------------------------------------
  console.log('\n👤 MODULE 2: KHÁCH HÀNG (AUTH, WISHLIST, CART, CHECKOUT, REVIEW)');
  const customerEmail = `tester_${runId}@beofashion.vn`;
  const customerPassword = 'Password@123';

  const regRes = await api('/auth/register', 'POST', {
    email: customerEmail,
    password: customerPassword,
    fullName: `BEO Tester ${runId}`,
    phone: '0901234567',
    address: '209 Đường 30 Tháng 4, Xuân Khánh',
    city: 'Cần Thơ'
  });
  test('2.1 Đăng ký tài khoản khách hàng mới (/auth/register)', regRes.status === 200 && regRes.body?.data?.token, `Status: ${regRes.status}`);

  const dupRegRes = await api('/auth/register', 'POST', {
    email: customerEmail,
    password: customerPassword,
    fullName: 'Duplicate Tester'
  });
  test('2.2 Chặn đăng ký trùng Email (Bảo mật tài khoản)', dupRegRes.status === 400 || dupRegRes.status === 409, `Expected 400/409, got: ${dupRegRes.status}`);

  const wrongLoginRes = await api('/auth/login', 'POST', {
    email: customerEmail,
    password: 'WrongPassword999!'
  });
  test('2.3 Chặn đăng nhập sai mật khẩu', wrongLoginRes.status === 400 || wrongLoginRes.status === 401, `Expected 400/401, got: ${wrongLoginRes.status}`);

  const loginRes = await api('/auth/login', 'POST', {
    email: customerEmail,
    password: customerPassword
  });
  test('2.4 Đăng nhập tài khoản khách hàng chuẩn xác (/auth/login)', loginRes.status === 200 && loginRes.body?.data?.token, `Status: ${loginRes.status}`);
  const userToken = loginRes.body?.data?.token;

  const meRes = await api('/auth/me', 'GET', null, userToken);
  test('2.5 Lấy thông tin tài khoản hiện tại (/auth/me)', meRes.status === 200 && meRes.body?.data?.email === customerEmail, `Status: ${meRes.status}`);

  const updateProfRes = await api('/auth/profile', 'PUT', {
    fullName: `BEO Tester VIP ${runId}`,
    phone: '0988112233',
    address: 'Đại Lộ Hòa Bình, Cần Thơ',
    city: 'Cần Thơ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  }, userToken);
  test('2.6 Cập nhật hồ sơ cá nhân (/auth/profile)', updateProfRes.status === 200 && updateProfRes.body?.data?.phone === '0988112233', `Status: ${updateProfRes.status}`);

  const wishToggleAdd = await api(`/wishlist/toggle/${sampleProd.id}`, 'POST', null, userToken);
  test('2.7 Thêm sản phẩm vào Wishlist (/wishlist/toggle)', wishToggleAdd.status === 200 && wishToggleAdd.body?.data?.inWishlist === true, `Status: ${wishToggleAdd.status}`);

  const wishCheck = await api(`/wishlist/check/${sampleProd.id}`, 'GET', null, userToken);
  test('2.8 Kiểm tra trạng thái Wishlist (/wishlist/check)', wishCheck.status === 200 && wishCheck.body?.data?.inWishlist === true, `Status: ${wishCheck.status}`);

  const wishListRes = await api('/wishlist', 'GET', null, userToken);
  test('2.9 Lấy danh sách sản phẩm yêu thích (/wishlist)', wishListRes.status === 200 && wishListRes.body?.data?.length > 0, `Status: ${wishListRes.status}`);

  const wishToggleRemove = await api(`/wishlist/toggle/${sampleProd.id}`, 'POST', null, userToken);
  test('2.10 Xóa sản phẩm khỏi Wishlist (/wishlist/toggle)', wishToggleRemove.status === 200 && wishToggleRemove.body?.data?.inWishlist === false, `Status: ${wishToggleRemove.status}`);

  const targetVariant = prodDetailRes.body.data.variants[0];
  const addCartRes = await api('/cart/items', 'POST', { variantId: targetVariant.id, quantity: 3 }, userToken);
  test('2.11 Thêm sản phẩm vào giỏ hàng (DB Cart)', addCartRes.status === 200, `Status: ${addCartRes.status}`);

  const getCartRes = await api('/cart', 'GET', null, userToken);
  const cartItem = getCartRes.body?.data?.items?.[0];
  test('2.12 Truy vấn giỏ hàng chi tiết (/cart)', getCartRes.status === 200 && cartItem && cartItem.quantity === 3, `Status: ${getCartRes.status}`);

  if (cartItem) {
    const updateQtyRes = await api(`/cart/items/${cartItem.id}?quantity=2`, 'PUT', null, userToken);
    test('2.13 Cập nhật số lượng sản phẩm trong giỏ (/cart/items/{id}?quantity=2)', updateQtyRes.status === 200 && updateQtyRes.body?.data?.items?.[0]?.quantity === 2, `Status: ${updateQtyRes.status}`);
  }

  const validCoupon = await api('/coupons/validate', 'POST', { code: 'BEO10', orderAmount: 500000 });
  test('2.14 Áp dụng mã giảm giá hợp lệ (BEO10)', validCoupon.status === 200 && validCoupon.body?.data?.calculatedDiscount > 0, `Status: ${validCoupon.status}`);

  const invalidCoupon = await api('/coupons/validate', 'POST', { code: 'NON_EXISTING_PROMO_999', orderAmount: 500000 });
  test('2.15 Xử lý mã giảm giá không tồn tại (Báo lỗi chuẩn)', invalidCoupon.status === 400 || (invalidCoupon.body && invalidCoupon.body.success === false), `Status: ${invalidCoupon.status}`);

  const orderRes = await api('/orders', 'POST', {
    customerName: `BEO Tester VIP ${runId}`,
    customerPhone: '0988112233',
    customerEmail: customerEmail,
    shippingAddress: '209 Đường 30 Tháng 4, Xuân Khánh, Ninh Kiều',
    shippingCity: 'Cần Thơ',
    couponCode: 'BEO10',
    paymentMethod: 'BANK_TRANSFER',
    orderType: 'ONLINE_DELIVERY',
    notes: 'Vui lòng giao trong giờ hành chính'
  }, userToken);
  test('2.16 Tạo đơn hàng chuyển khoản VietQR (/orders)', orderRes.status === 200 && orderRes.body?.data?.orderNumber, `Status: ${orderRes.status}`);
  const testOrder = orderRes.body?.data;

  const cartAfter = await api('/cart', 'GET', null, userToken);
  test('2.17 Giỏ hàng tự động làm rỗng sau khi đặt hàng', cartAfter.status === 200 && cartAfter.body?.data?.items?.length === 0, `Items left: ${cartAfter.body?.data?.items?.length}`);

  const trackRes = await api(`/orders/track/${testOrder.orderNumber}`);
  test(`2.18 Tra cứu tiến độ đơn hàng công khai (#${testOrder.orderNumber})`, trackRes.status === 200 && trackRes.body?.data?.orderNumber === testOrder.orderNumber, `Status: ${trackRes.status}`);

  const vietQrStatusRes = await api(`/payments/vietqr/${testOrder.orderNumber}/status`);
  test('2.19 Kiểm tra trạng thái giao dịch VietQR (/payments/vietqr/{orderNumber}/status)', vietQrStatusRes.status === 200 && vietQrStatusRes.body?.paymentStatus === 'PENDING', `Status: ${vietQrStatusRes.status}`);

  const confirmTransferRes = await api('/payments/vietqr/confirm-transfer', 'POST', {
    orderNumber: testOrder.orderNumber,
    amount: testOrder.finalAmount,
    transactionRef: `TEST-REF-${runId}`
  });
  test('2.20 Xác nhận tham chiếu thanh toán VietQR chuyển sang CONFIRMED', confirmTransferRes.status === 200 && confirmTransferRes.body?.data?.status === 'CONFIRMED', `Status: ${confirmTransferRes.status}`);

  const myOrdersRes = await api('/orders/my-orders', 'GET', null, userToken);
  test('2.21 Lịch sử đơn hàng của tôi (/orders/my-orders)', myOrdersRes.status === 200 && myOrdersRes.body?.data?.length > 0, `Status: ${myOrdersRes.status}`);

  const reviewSubRes = await api('/reviews', 'POST', {
    productId: sampleProd.id,
    rating: 5,
    title: 'Chất lượng áo xuất sắc',
    comment: 'Vải cotton cực kỳ thoáng mát và vừa vặn chuẩn phom BEO Cần Thơ.',
    fitFeedback: 'TRUE_TO_SIZE'
  }, userToken);
  test('2.22 Khách hàng gửi đánh giá & bình luận sản phẩm (/reviews)', reviewSubRes.status === 200 && reviewSubRes.body?.data?.id, `Status: ${reviewSubRes.status}`);

  await api('/cart/items', 'POST', { variantId: targetVariant.id, quantity: 1 }, userToken);
  const orderToCancelRes = await api('/orders', 'POST', {
    customerName: 'Cancel Test',
    customerPhone: '0901234567',
    customerEmail: customerEmail,
    shippingAddress: 'Ninh Kiều, Cần Thơ',
    shippingCity: 'Cần Thơ',
    paymentMethod: 'COD',
    orderType: 'ONLINE_DELIVERY'
  }, userToken);
  const cancelOrderData = orderToCancelRes.body?.data;
  if (cancelOrderData) {
    const cancelRes = await api(`/orders/${cancelOrderData.id}/cancel`, 'PUT', { reason: 'Khách đổi mẫu' }, userToken);
    test('2.23 Tự phục vụ: Khách hàng hủy đơn hàng chờ xử lý (/orders/{id}/cancel)', cancelRes.status === 200 && cancelRes.body?.data?.status === 'CANCELLED', `Status: ${cancelRes.status}`);
  }

  // -------------------------------------------------------------
  // MODULE 3: STORE MANAGER POS & SHOWROOM CẦN THƠ FULFILLMENT
  // -------------------------------------------------------------
  console.log('\n🏪 MODULE 3: QUẢN LÝ CỬA HÀNG (STORE MANAGER POS - SHOWROOM CẦN THƠ)');
  const staffLoginRes = await api('/auth/login', 'POST', {
    email: 'manager.cantho@beofashion.vn',
    password: 'staff123'
  });
  test('3.1 Đăng nhập Quản lý Cửa Hàng Cần Thơ (ROLE_STAFF_MANAGER)', staffLoginRes.status === 200 && staffLoginRes.body?.data?.token, `Status: ${staffLoginRes.status}`);
  const staffToken = staffLoginRes.body?.data?.token;

  const staffStoreRes = await api('/staff/store-info', 'GET', null, staffToken);
  test('3.2 Thông tin Showroom được phân bổ cho nhân viên', staffStoreRes.status === 200 && (staffStoreRes.body?.data?.name || staffStoreRes.body?.data?.code), `Status: ${staffStoreRes.status}`);

  const staffOrdersRes = await api('/staff/orders', 'GET', null, staffToken);
  test('3.3 Hàng đợi đơn hàng Showroom Cần Thơ tiếp nhận (/staff/orders)', staffOrdersRes.status === 200 && Array.isArray(staffOrdersRes.body?.data), `Status: ${staffOrdersRes.status}`);

  const packRes = await api(`/staff/orders/${testOrder.id}/status`, 'PUT', { status: 'PACKING' }, staffToken);
  test('3.4 Cập nhật tiến độ: Đóng gói đơn hàng (PACKING)', packRes.status === 200 && packRes.body?.data?.status === 'PACKING', `Status: ${packRes.status}`);

  const shipRes = await api(`/staff/orders/${testOrder.id}/status`, 'PUT', { status: 'SHIPPING' }, staffToken);
  test('3.5 Cập nhật tiến độ: Bàn giao vận chuyển (SHIPPING)', shipRes.status === 200 && shipRes.body?.data?.status === 'SHIPPING', `Status: ${shipRes.status}`);

  const deliverRes = await api(`/staff/orders/${testOrder.id}/status`, 'PUT', { status: 'DELIVERED' }, staffToken);
  test('3.6 Cập nhật tiến độ: Đã giao thành công (DELIVERED)', deliverRes.status === 200 && deliverRes.body?.data?.status === 'DELIVERED', `Status: ${deliverRes.status}`);

  const staffInvRes = await api('/staff/inventory', 'GET', null, staffToken);
  test('3.7 Danh mục kiểm kê tồn kho Showroom (/staff/inventory)', staffInvRes.status === 200 && Array.isArray(staffInvRes.body?.data), `Status: ${staffInvRes.status}`);

  const invToAdjust = staffInvRes.body?.data?.[0];
  if (invToAdjust) {
    const adjustRes = await api('/staff/inventory/adjust', 'PUT', {
      variantId: invToAdjust.id,
      newQuantity: 88,
      reason: `Kiểm kê chốt ca ${runId}`
    }, staffToken);
    test(`3.8 Điều chỉnh tồn kho thực tế biến thể (${invToAdjust.sku})`, adjustRes.status === 200, `Status: ${adjustRes.status}`);
  }

  const staffReportRes = await api('/staff/reports/daily', 'GET', null, staffToken);
  test('3.9 Báo cáo doanh số & vận hành ca trong ngày (/staff/reports/daily)', staffReportRes.status === 200 && (staffReportRes.body?.data?.storeName || staffReportRes.body?.data?.todayRevenue !== undefined), `Status: ${staffReportRes.status}`);

  // -------------------------------------------------------------
  // MODULE 4: ADMIN MASTER CMS & SYSTEM GOVERNANCE
  // -------------------------------------------------------------
  console.log('\n🛡️ MODULE 4: TỔNG QUẢN TRỊ VIÊN (ADMIN MASTER CMS & GOVERNANCE)');
  const adminLoginRes = await api('/auth/login', 'POST', {
    email: 'admin@beofashion.vn',
    password: 'admin123'
  });
  test('4.1 Đăng nhập Quản Trị Viên Cấp Cao (ROLE_ADMIN)', adminLoginRes.status === 200 && adminLoginRes.body?.data?.token, `Status: ${adminLoginRes.status}`);
  const adminToken = adminLoginRes.body?.data?.token;

  const adminStatsRes = await api('/admin/dashboard/stats', 'GET', null, adminToken);
  test('4.2 Chỉ số thống kê Dashboard KPI & Doanh thu 7 ngày (/admin/dashboard/stats)', adminStatsRes.status === 200 && adminStatsRes.body?.data?.totalRevenue !== undefined, `Status: ${adminStatsRes.status}`);

  const adminOrdersRes = await api('/admin/orders?page=0&size=20', 'GET', null, adminToken);
  test('4.3 Quản lý đơn hàng toàn kênh Omnichannel (/admin/orders)', adminOrdersRes.status === 200, `Status: ${adminOrdersRes.status}`);

  const adminUsersRes = await api('/admin/users', 'GET', null, adminToken);
  const usersList = adminUsersRes.body?.data || [];
  test('4.4 Danh sách người dùng & phân quyền hệ thống (/admin/users)', adminUsersRes.status === 200 && usersList.length > 0, `Status: ${adminUsersRes.status}`);

  const invalidRoles = usersList.filter(u => !['ROLE_CUSTOMER', 'ROLE_STAFF_MANAGER', 'ROLE_ADMIN'].includes(u.role));
  test('4.5 Quy tắc dự án: Chỉ có 3 vai trò (ROLE_CUSTOMER, ROLE_STAFF_MANAGER, ROLE_ADMIN)', invalidRoles.length === 0, `Phát hiện vai trò không hợp lệ: ${invalidRoles.map(u => `${u.email}: ${u.role}`).join(', ')}`);

  const adminCouponsRes = await api('/admin/coupons', 'GET', null, adminToken);
  test('4.6 Danh mục mã khuyến mãi toàn hệ thống (/admin/coupons)', adminCouponsRes.status === 200 && Array.isArray(adminCouponsRes.body?.data), `Status: ${adminCouponsRes.status}`);

  const adminNewCouponRes = await api('/admin/coupons', 'POST', {
    code: `DEEP${runId}`,
    description: `Mã khuyến mãi thử nghiệm ${runId}`,
    discountType: 'PERCENT',
    discountValue: 20,
    minOrderAmount: 200000,
    maxDiscountAmount: 200000,
    usageLimit: 50,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    active: true
  }, adminToken);
  test(`4.7 Tạo mới Voucher khuyến mãi trong Admin (DEEP${runId})`, adminNewCouponRes.status === 200 && adminNewCouponRes.body?.data?.code === `DEEP${runId}`, `Status: ${adminNewCouponRes.status}`);

  const adminBankRes = await api('/admin/bank-config', 'GET', null, adminToken);
  test('4.8 Cấu hình tài khoản thụ hưởng VietQR (/admin/bank-config)', adminBankRes.status === 200 && adminBankRes.body?.data?.accountNo, `Status: ${adminBankRes.status}`);

  const updateBankRes = await api('/admin/bank-config', 'PUT', {
    bankId: 'MBBank',
    bankName: 'Ngân hàng TMCP Quân Đội (MB)',
    accountNo: '190019199999',
    accountName: 'BEO FASHION VIETNAM',
    template: 'compact2'
  }, adminToken);
  test('4.9 Cập nhật thông số cổng thanh toán VietQR (/admin/bank-config)', updateBankRes.status === 200 && updateBankRes.body?.data?.accountNo === '190019199999', `Status: ${updateBankRes.status}`);

  const excelRes = await api('/admin/reports/revenue.xlsx', 'GET', null, adminToken);
  const isExcelValid = excelRes.status === 200 && excelRes.buffer && excelRes.buffer.length > 100;
  test('4.10 Xuất báo cáo doanh thu đa sheet định dạng Excel (.xlsx)', isExcelValid, `Status: ${excelRes.status}, bytes: ${excelRes.buffer?.length}`);

  const pdfRes = await api('/admin/reports/revenue.pdf', 'GET', null, adminToken);
  const isPdfValid = pdfRes.status === 200 && pdfRes.buffer && pdfRes.buffer.slice(0, 4).toString() === '%PDF';
  test('4.11 Xuất báo cáo tài chính định dạng PDF chuẩn BEO Fashion (.pdf)', isPdfValid, `Status: ${pdfRes.status}, bytes: ${pdfRes.buffer?.length}`);

  const adminProdCode = `BEO-DEEP-${runId}`;
  const createAdminProdRes = await api('/admin/products', 'POST', {
    code: adminProdCode,
    name: `BEO Tailored Oversized Blazer ${runId}`,
    categoryId: 1,
    basePrice: 1290000,
    salePrice: 1090000,
    gender: 'WOMEN',
    collection: 'BEO Autumn Elegance',
    material: 'Premium Wool Blend',
    description: 'Blazer cao cấp sang trọng thiết kế tinh tế cho phái đẹp hiện đại.',
    primaryImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    featured: true,
    isNew: true,
    variants: [
      {
        sku: `${adminProdCode}-BLACK-M`,
        colorName: '09 BLACK',
        colorHex: '#111111',
        size: 'M',
        barcode: '4550099' + runId,
        totalStock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'
      }
    ]
  }, adminToken);
  test(`4.12 Tạo sản phẩm mới hoàn chỉnh kèm SKU biến thể trong Admin (${adminProdCode})`, createAdminProdRes.status === 200 && createAdminProdRes.body?.data?.id, `Status: ${createAdminProdRes.status}`);

  // -------------------------------------------------------------
  // SUMMARY RESULTS
  // -------------------------------------------------------------
  console.log('\n=================================================================================');
  console.log(`📊 TỔNG KẾT TOÀN DIỆN: ${passed} CHỨC NĂNG THÀNH CÔNG (PASSED) | ${failed} LỖI PHÁT HIỆN (FAILED)`);
  console.log('=================================================================================');

  if (issues.length > 0) {
    console.log('\n⚠️ DANH SÁCH CHI TIẾT CÁC LỖI CẦN XỬ LÝ:');
    issues.forEach((iss, idx) => {
      console.log(`  ${idx + 1}. [${iss.feature}]: ${iss.detail}`);
    });
  } else {
    console.log('🎉 TẤT CẢ 100% CÁC TÍNH NĂNG VÀ QUY TẮC NGHIỆP VỤ HOẠT ĐỘNG HOÀN HẢO KHÔNG CÓ BẤT KỲ LỖI NÀO!');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runDeepScan().catch((err) => {
  console.error('Fatal execution failure:', err);
  process.exit(1);
});
