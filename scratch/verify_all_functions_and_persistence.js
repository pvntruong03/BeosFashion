const http = require('http');
const fs = require('fs');
const path = require('path');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
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

async function runComprehensiveVerification() {
  console.log('========================================================================');
  console.log('🔍 TOÀN BỘ KIỂM TRA HỆ THỐNG & XÁC MINH LƯU TRỮ DỮ LIỆU VÀO DATABASE');
  console.log('   (FULL SYSTEM AUDIT & DATABASE PERSISTENCE VERIFICATION)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, detail = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? '-> ' + detail : ''}`);
      failed++;
    }
  }

  const uniqueId = Date.now().toString().slice(-6);

  // -------------------------------------------------------------
  // PHẦN 1: KIỂM TRA TẬP TIN DATABASE TRÊN Ổ ĐĨA
  // -------------------------------------------------------------
  console.log('📂 [1] Kiểm tra file cơ sở dữ liệu vật lý trên ổ cứng (Physical DB Storage)...');
  const dbFilePath = path.join(__dirname, '..', 'backend', 'data', 'beo_fashion_db.mv.db');
  const dbExists = fs.existsSync(dbFilePath);
  const dbStats = dbExists ? fs.statSync(dbFilePath) : null;
  assert(
    `Tệp tin cơ sở dữ liệu tồn tại: ${dbFilePath}`,
    dbExists && dbStats.size > 0,
    `Kích thước file: ${dbStats ? dbStats.size + ' bytes' : '0'}`
  );
  console.log(`     -> Kích thước hiện tại: ${(dbStats.size / 1024).toFixed(2)} KB | Cập nhật lúc: ${dbStats.mtime.toLocaleString()}`);

  // -------------------------------------------------------------
  // PHẦN 2: KIỂM TRA ĐĂNG KÝ, ĐĂNG NHẬP & CẬP NHẬT HỒ SƠ KHÁCH HÀNG
  // -------------------------------------------------------------
  console.log('\n👤 [2] Kiểm tra Khách Hàng: Đăng ký, Đăng nhập & Lưu Profile vào DB...');
  const customerEmail = `beo_vip_${uniqueId}@beofashion.vn`;
  const regRes = await api('/auth/register', 'POST', {
    email: customerEmail,
    password: 'password123',
    fullName: `Khách Hàng VIP ${uniqueId}`,
    phone: '0901234567',
    address: '209 Đường 30 Tháng 4, Xuân Khánh',
    city: 'Cần Thơ'
  });
  assert('Đăng ký tài khoản thành công và tạo JWT Token', regRes.status === 200 && regRes.body.data?.token);
  const customerToken = regRes.body.data?.token;

  // Lấy thông tin /auth/me từ DB
  const meRes = await api('/auth/me', 'GET', null, customerToken);
  assert(
    'Truy vấn hồ sơ /auth/me đúng thông tin vừa tạo trong DB',
    meRes.status === 200 && meRes.body.data.email === customerEmail && meRes.body.data.role === 'ROLE_CUSTOMER'
  );

  // Cập nhật hồ sơ
  const newAddress = `Số ${uniqueId} Đại Lộ Hòa Bình, Quận Ninh Kiều, Cần Thơ`;
  const updateRes = await api('/auth/profile', 'PUT', {
    fullName: `Khách Hàng VIP ${uniqueId} (Đã Xác Thực)`,
    phone: '0988776655',
    address: newAddress,
    city: 'Cần Thơ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  }, customerToken);
  assert(
    'Cập nhật địa chỉ & số điện thoại mới thành công vào DB',
    updateRes.status === 200 && updateRes.body.data.address === newAddress
  );

  // -------------------------------------------------------------
  // PHẦN 3: KIỂM TRA GIỎ HÀNG (PERSISTED CART) & ĐẶT HÀNG
  // -------------------------------------------------------------
  console.log('\n🛒 [3] Kiểm tra Giỏ Hàng lưu DB, Mã Giảm Giá & Tạo Đơn Hàng...');
  // Lấy danh sách sản phẩm
  const prodRes = await api('/products?sizePerPage=50');
  const allProds = prodRes.body?.data?.content || [];
  assert('Tải danh mục sản phẩm từ Database', prodRes.status === 200 && allProds.length > 0);

  // Tìm sản phẩm có variants
  let sampleProd = allProds.find(p => p.variants && p.variants.length > 0);
  let sampleVariant = sampleProd?.variants?.[0];
  if (!sampleVariant) {
    for (const p of allProds) {
      const detail = await api(`/products/${p.id}`);
      if (detail.body?.data?.variants?.length > 0) {
        sampleProd = detail.body.data;
        sampleVariant = detail.body.data.variants[0];
        break;
      }
    }
  }
  assert(`Lấy thông tin biến thể SKU: ${sampleVariant?.sku} của sản phẩm "${sampleProd?.name}"`, sampleVariant && sampleVariant.id);

  // Thêm vào giỏ hàng
  const addCartRes = await api('/cart/items', 'POST', { variantId: sampleVariant.id, quantity: 2 }, customerToken);
  assert('Thêm sản phẩm vào giỏ hàng (Lưu trực tiếp vào bảng Cart trong DB)', addCartRes.status === 200);

  // Kiểm tra giỏ hàng trong DB
  const cartRes = await api('/cart', 'GET', null, customerToken);
  const cartSubtotal = cartRes.body?.data?.subTotal || (sampleProd.salePrice || sampleProd.basePrice) * 2;
  assert('Truy vấn giỏ hàng trả về đúng 2 sản phẩm', cartRes.status === 200 && cartRes.body.data.items.length === 1 && cartRes.body.data.items[0].quantity === 2);

  // Áp dụng Coupon BEO10
  const couponCheck = await api('/coupons/validate', 'POST', { code: 'BEO10', orderAmount: Number(cartSubtotal) });
  assert('Xác thực mã giảm giá BEO10 (10% Giảm giá)', couponCheck.status === 200 && couponCheck.body.data?.calculatedDiscount > 0);

  // Đặt hàng
  const orderCreateRes = await api('/orders', 'POST', {
    customerName: `Khách Hàng VIP ${uniqueId}`,
    customerPhone: '0988776655',
    customerEmail: customerEmail,
    shippingAddress: newAddress,
    shippingCity: 'Cần Thơ',
    couponCode: 'BEO10',
    paymentMethod: 'BANK_TRANSFER',
    orderType: 'ONLINE_DELIVERY',
    notes: `Đơn hàng xác minh lưu trữ số #${uniqueId}`
  }, customerToken);
  assert('Tạo đơn hàng thành công và lưu vào bảng Orders trong DB', orderCreateRes.status === 200 && orderCreateRes.body.data?.orderNumber);
  const createdOrder = orderCreateRes.body.data;
  console.log(`     -> Mã đơn hàng vừa tạo: ${createdOrder.orderNumber} | Tổng tiền: ${createdOrder.finalAmount.toLocaleString()} đ`);

  // Kiểm tra giỏ hàng sau khi đặt hàng (phải được xóa sạch trong DB)
  const cartAfterOrder = await api('/cart', 'GET', null, customerToken);
  assert('Giỏ hàng tự động dọn sạch trong DB sau khi tạo đơn', cartAfterOrder.status === 200 && cartAfterOrder.body.data.items.length === 0);

  // -------------------------------------------------------------
  // PHẦN 4: KIỂM TRA THANH TOÁN VIETQR & TRẠNG THÁI ĐƠN
  // -------------------------------------------------------------
  console.log('\n💳 [4] Kiểm tra Thanh Toán VietQR & Tự Động Chuyển Trạng Thái...');
  const vietQrStatus = await api(`/payments/vietqr/${createdOrder.orderNumber}/status`);
  assert('Trạng thái thanh toán ban đầu là PENDING', vietQrStatus.status === 200 && vietQrStatus.body.paymentStatus === 'PENDING');

  // Xác nhận chuyển khoản với số tiền và mã tham chiếu do khách cung cấp
  const confirmPayRes = await api('/payments/vietqr/confirm-transfer', 'POST', {
    orderNumber: createdOrder.orderNumber,
    amount: createdOrder.finalAmount,
    transactionRef: `VERIFY-${uniqueId}`
  });
  assert('Xác nhận tham chiếu VietQR thành công -> Trạng thái đổi thành CONFIRMED', confirmPayRes.status === 200 && confirmPayRes.body.data.status === 'CONFIRMED');

  // Kiểm tra tra cứu công khai
  const trackOrder = await api(`/orders/track/${createdOrder.orderNumber}`);
  assert('Tra cứu đơn hàng công khai /orders/track trả về CONFIRMED', trackOrder.status === 200 && trackOrder.body.data.status === 'CONFIRMED');

  // -------------------------------------------------------------
  // PHẦN 5: KIỂM TRA STORE MANAGER (STAFF FULFILLMENT & INVENTORY)
  // -------------------------------------------------------------
  console.log('\n🏪 [5] Kiểm tra Store Manager (Xử lý đơn Cần Thơ & Điều chỉnh Kho)...');
  const staffLogin = await api('/auth/login', 'POST', { email: 'manager.cantho@beofashion.vn', password: 'staff123' });
  assert('Đăng nhập Store Manager Cần Thơ (ROLE_STAFF_MANAGER)', staffLogin.status === 200 && staffLogin.body.data?.token);
  const staffToken = staffLogin.body.data?.token;

  // Lấy danh sách đơn xử lý
  const staffOrders = await api('/staff/orders', 'GET', null, staffToken);
  assert('Lấy danh sách hàng đợi xử lý đơn hàng tại chi nhánh Cần Thơ', staffOrders.status === 200 && Array.isArray(staffOrders.body.data));

  // Chuyển bước: PACKING (Đang soạn hàng)
  const packOrderRes = await api(`/staff/orders/${createdOrder.id}/status`, 'PUT', { status: 'PACKING' }, staffToken);
  assert('Chuyển trạng thái đơn sang PACKING và lưu vào DB', packOrderRes.status === 200 && packOrderRes.body.data.status === 'PACKING');

  // Chuyển bước: SHIPPING (Đã giao shipper)
  const shipOrderRes = await api(`/staff/orders/${createdOrder.id}/status`, 'PUT', { status: 'SHIPPING' }, staffToken);
  assert('Chuyển trạng thái đơn sang SHIPPING và lưu vào DB', shipOrderRes.status === 200 && shipOrderRes.body.data.status === 'SHIPPING');

  // Chuyển bước: DELIVERED (Đã giao hàng thành công)
  const deliverOrderRes = await api(`/staff/orders/${createdOrder.id}/status`, 'PUT', { status: 'DELIVERED' }, staffToken);
  assert('Chuyển trạng thái đơn sang DELIVERED và lưu vào DB', deliverOrderRes.status === 200 && deliverOrderRes.body.data.status === 'DELIVERED');

  // Kiểm kê / Điều chỉnh tồn kho (Stock Adjustment) qua PUT /api/staff/inventory/adjust
  const staffInvRes = await api('/staff/inventory', 'GET', null, staffToken);
  const invItemToAdjust = staffInvRes.body.data?.[0];
  if (invItemToAdjust) {
    const targetQty = 95;
    const adjustRes = await api('/staff/inventory/adjust', 'PUT', {
      variantId: invItemToAdjust.id,
      newQuantity: targetQty,
      reason: `Kiểm kê định kỳ ca số #${uniqueId}`
    }, staffToken);
    assert(`Điều chỉnh tồn kho biến thể SKU ${invItemToAdjust.sku} thành công`, adjustRes.status === 200 && adjustRes.body.data?.id);

    // Xác minh lại ngay từ DB
    const verifyInv = await api('/staff/inventory', 'GET', null, staffToken);
    const updatedItem = verifyInv.body.data.find(x => x.id === invItemToAdjust.id);
    assert(`Xác nhận số lượng tồn kho mới (${updatedItem?.totalStock}) đã được ghi bền vững vào DB`, updatedItem?.totalStock === targetQty);
  }

  // -------------------------------------------------------------
  // PHẦN 6: KIỂM TRA ADMIN CMS (TẠO SẢN PHẨM MỚI, TẠO MÃ GIẢM GIÁ)
  // -------------------------------------------------------------
  console.log('\n🛡️ [6] Kiểm tra Quản Trị Viên (Admin CMS: Tạo SP mới & Mã Giảm Giá)...');
  const adminLogin = await api('/auth/login', 'POST', { email: 'admin@beofashion.vn', password: 'admin123' });
  assert('Đăng nhập Quản Trị Viên Master (ROLE_ADMIN)', adminLogin.status === 200 && adminLogin.body.data?.token);
  const adminToken = adminLogin.body.data?.token;

  // Tạo sản phẩm mới trong Admin với ma trận biến thể
  const newProdCode = `BEO-PERSIST-${uniqueId}`;
  const newProdName = `BEO Persistence Master Shirt ${uniqueId}`;
  const mockVariants = [
    {
      sku: `${newProdCode}-09BLACK-M`,
      colorName: '09 BLACK',
      colorHex: '#111111',
      size: 'M',
      barcode: '45500' + Math.floor(1000000 + Math.random() * 9000000),
      totalStock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'
    },
    {
      sku: `${newProdCode}-00WHITE-L`,
      colorName: '00 WHITE',
      colorHex: '#ffffff',
      size: 'L',
      barcode: '45500' + Math.floor(1000000 + Math.random() * 9000000),
      totalStock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'
    }
  ];

  const createProdRes = await api('/admin/products', 'POST', {
    code: newProdCode,
    name: newProdName,
    categoryId: 1,
    basePrice: 599000,
    salePrice: 499000,
    gender: 'MEN',
    collection: 'BEO Essentials Innovation',
    material: '100% Premium Egyptian Cotton',
    description: 'Sản phẩm thử nghiệm kiểm tra tính toàn vẹn và lưu trữ vĩnh viễn vào CSDL.',
    primaryImageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    featured: true,
    isNew: true,
    variants: mockVariants
  }, adminToken);
  assert(`Tạo mới sản phẩm "${newProdName}" (Mã: ${newProdCode}) vào CSDL`, createProdRes.status === 200 && createProdRes.body.data?.id);
  const createdProdId = createProdRes.body.data?.id;

  // Tạo mã giảm giá mới trong Admin
  const newCouponCode = `PERSIST${uniqueId}`;
  const createCouponRes = await api('/admin/coupons', 'POST', {
    code: newCouponCode,
    description: `Mã giảm giá đặc biệt ${uniqueId}`,
    discountType: 'PERCENT',
    discountValue: 15,
    minOrderAmount: 300000,
    maxDiscountAmount: 150000,
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    active: true
  }, adminToken);
  assert(`Tạo mới mã giảm giá "${newCouponCode}" vào CSDL`, createCouponRes.status === 200 && createCouponRes.body.data?.code === newCouponCode);

  // -------------------------------------------------------------
  // PHẦN 7: XÁC MINH TÍNH BỀN VỮNG (PERSISTENCE PROOF) TỪ DATABASE
  // -------------------------------------------------------------
  console.log('\n🔒 [7] Xác minh tính toàn vẹn và sự hiện diện của toàn bộ dữ liệu trong CSDL...');
  
  // 1. Kiểm tra lại sản phẩm vừa tạo trong API public
  const verifyProdRes = await api(`/products/${createdProdId}`);
  assert(
    `Sản phẩm ID ${createdProdId} ("${newProdName}") truy vấn thành công từ DB với đầy đủ biến thể`,
    verifyProdRes.status === 200 && verifyProdRes.body.data?.code === newProdCode && verifyProdRes.body.data?.variants?.length === 2
  );

  // 2. Kiểm tra lại mã giảm giá vừa tạo
  const verifyCouponRes = await api('/coupons/validate', 'POST', { code: newCouponCode, orderAmount: 500000 });
  assert(
    `Mã giảm giá "${newCouponCode}" kích hoạt và tính toán chiết khấu chính xác từ DB`,
    verifyCouponRes.status === 200 && verifyCouponRes.body.data?.calculatedDiscount === 75000
  );

  // 3. Kiểm tra đơn hàng trong Admin Omnichannel Orders
  const verifyAdminOrderRes = await api('/admin/orders?page=0&size=50', 'GET', null, adminToken);
  const adminOrderList = verifyAdminOrderRes.body.data?.content || verifyAdminOrderRes.body.data || [];
  const foundOrderInAdmin = adminOrderList.find(o => o.orderNumber === createdOrder.orderNumber);
  assert(
    `Đơn hàng #${createdOrder.orderNumber} có mặt trong danh sách Quản Trị Toàn Kênh với trạng thái DELIVERED`,
    foundOrderInAdmin && foundOrderInAdmin.status === 'DELIVERED'
  );

  // 4. Kiểm tra lịch sử đơn hàng của khách hàng
  const myOrdersVerify = await api('/orders/my-orders', 'GET', null, customerToken);
  const foundInCustomerFeed = (myOrdersVerify.body.data || []).find(o => o.orderNumber === createdOrder.orderNumber);
  assert(
    `Khách hàng xem lại lịch sử đơn hàng thấy đúng đơn #${createdOrder.orderNumber} (Tổng tiền: ${foundInCustomerFeed?.finalAmount?.toLocaleString()} đ)`,
    foundInCustomerFeed && foundInCustomerFeed.finalAmount > 0
  );

  // -------------------------------------------------------------
  // TỔNG KẾT KẾT QUẢ KIỂM TRA
  // -------------------------------------------------------------
  const dbFinalStats = fs.statSync(dbFilePath);
  console.log('\n========================================================================');
  console.log(`📊 TỔNG KẾT KIỂM THỰC TẾ: ${passed} THÀNH CÔNG (PASSED) | ${failed} THẤT BẠI (FAILED)`);
  console.log(`💾 File Database: ${dbFilePath}`);
  console.log(`📏 Kích thước sau khi ghi: ${(dbFinalStats.size / 1024).toFixed(2)} KB (Tăng trưởng bền vững trên đĩa)`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveVerification().catch(err => {
  console.error('Lỗi khi chạy kiểm tra:', err);
  process.exit(1);
});
