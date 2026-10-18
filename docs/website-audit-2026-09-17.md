# Kiểm tra BEO Fashion — 17/09/2026

## Kết luận

Website có giao diện và nhiều phân hệ hoạt động, nhưng chưa hoàn thiện để bán hàng thật. Cần ưu tiên thanh toán, dữ liệu biến thể, danh mục và tính nhất quán giá tiền trước khi chỉnh thẩm mỹ.

## Phạm vi và kết quả chạy

- Frontend đang chạy: http://127.0.0.1:5173
- Backend đang chạy: http://localhost:8080
- Maven Wrapper mặc định lỗi `Cannot index into a null array` tại `backend/mvnw.cmd:92`. Đã khởi động được bằng Maven 3.9.6 có sẵn trên máy.
- `npm run build` thành công; bundle JS 673,48 kB, gzip 184,97 kB; có cảnh báo chunk >500 kB.
- `npm run lint` thất bại do thiếu native binding của oxlint trong môi trường hiện tại. Đây không phải bằng chứng mã nguồn có lỗi lint.
- GET products, categories, stores, lookbooks và reviews sản phẩm 70 trả HTTP 200. API admin/staff đã thử trả 401 khi không có xác thực.
- Đã xem trực tiếp trang chủ, danh mục, sản phẩm 70, giỏ hàng, checkout, login, lookbook, Custom Lab, admin và staff (staff bằng tài khoản admin). Đã thêm một sản phẩm size M vào giỏ khách thử nghiệm, chưa gửi đơn hay chuyển tiền.
- Mobile kiểm tra tại 375×812 cho checkout và lookbook; chưa kiểm tra mọi kích thước/thiết bị.
- Chưa chạy toàn bộ CRUD, hoàn tất đơn hàng, thanh toán ngoài hệ thống, hoàn tiền, kiểm thử tải hoặc E2E toàn bộ. Không thay đổi mã nguồn ứng dụng. Backend có các bước seed/chuẩn hóa dữ liệu tự động khi khởi động.
- Chưa có `.ua/knowledge-graph.json` hoặc graph cũ ở thư mục gốc; nhận định kiến trúc dựa trên mã nguồn trực tiếp.

## P0 — Chặn nhận thanh toán thật

### 1. Thanh toán giả lập có thể đánh dấu đơn đã trả tiền

**Bằng chứng mã nguồn:** `backend/src/main/java/com/beofashion/config/SecurityConfig.java` mở `/api/payments/**`; `controller/PaymentController.java:60` nhận yêu cầu simulate-transfer, đặt payment SUCCESS và đổi PENDING sang CONFIRMED, không xác thực webhook hay đối chiếu amount. Chưa gọi endpoint làm thay đổi đơn thật.

**Cần sửa:** chỉ bật mô phỏng trong môi trường demo; xác thực webhook, số tiền, đơn hàng, mã giao dịch và xử lý lặp an toàn.

### 2. VNPay/MoMo được coi là đã thanh toán ngay khi tạo đơn

**Bằng chứng mã nguồn:** `backend/src/main/java/com/beofashion/service/OrderService.java:168` chỉ COD/BANK_TRANSFER/VIETQR là PENDING; các phương thức còn lại là SUCCESS. Checkout vẫn cho chọn VNPay và MoMo.

**Cần sửa:** tạo phiên thanh toán thật và chỉ ghi SUCCESS sau xác minh từ cổng thanh toán; tạm ẩn phương thức chưa tích hợp.

### 3. Cấu hình demo/quản trị còn dùng chung với bản chạy

**Đã thử:** khách có thể bấm tài khoản admin demo để đăng nhập. `frontend/src/contexts/AuthContext.jsx` chứa thông tin đăng nhập demo. `application.yml` chứa JWT secret cố định, bật H2 Console và cho phép truy cập từ máy khác; SecurityConfig cho phép vào đường dẫn console. Các API admin/staff riêng đã thử vẫn yêu cầu xác thực.

**Cần sửa:** tách profile demo/production, bỏ tài khoản demo ở production, thay secret bằng biến môi trường, tắt H2 Console trên bản triển khai.

## P1 — Lỗi nghiệp vụ và chức năng

### 4. Đổi Nam → Nữ không đổi danh sách

**Đã tái hiện:** mở danh mục MEN rồi bấm WOMEN; URL thành `#/products?gender=WOMEN` nhưng tiêu đề và sản phẩm vẫn MEN.

**Nguyên nhân:** `frontend/src/pages/ProductListingPage.jsx:18` chỉ lấy initialFilters khi khởi tạo state; App không remount theo bộ lọc. Cần đồng bộ bộ lọc khi tham số đổi và reset trang.

### 5. Tổng sản phẩm và phân trang sai

**Đã tái hiện:** danh mục Nam hiển thị 12 sản phẩm nhưng ghi “Found 0 matching products”, không hiện các trang tiếp theo. API trả tổng 31 sản phẩm tại `data.page.totalElements`, trong khi frontend đọc `data.totalElements` và `data.totalPages` (`ProductListingPage.jsx:49`).

**Cần sửa:** thống nhất cấu trúc phân trang giữa frontend và backend; kiểm tra lại số trang và các bộ lọc.

### 6. Biến thể còn size trẻ em trong sản phẩm người lớn

**Đã tái hiện:** sản phẩm 70, French Terry Relaxed Crew Neck Sweatshirt, mặc định “Size: 110”; các nút chỉ hiện S/M/L/XL. API vẫn trả biến thể 110,120,130,140,150. Chọn M và thêm giỏ hoạt động.

**Cần sửa:** làm sạch/migrate biến thể cũ theo quy tắc không có sản phẩm trẻ em; chọn mặc định từ danh sách size hợp lệ, hiển thị đúng toàn bộ size bán được. Xem `ProductDetailPage.jsx:86` và `:356`.

### 7. Điểm thưởng giảm tiền chỉ ở giao diện

**Đã thấy:** checkout khách chưa đăng nhập vẫn có 1.500 điểm. **Mã nguồn:** `CheckoutPage.jsx:50` dùng `user?.points || 1500`; tính giảm trên frontend nhưng payload tạo đơn không có yêu cầu dùng điểm. Backend OrderService chỉ tính giảm coupon.

**Cần sửa:** đọc số dư thật, khách chưa đăng nhập không được nhận điểm mặc định, backend xác thực/trừ điểm và trả tổng tiền thống nhất. Hiện có nguy cơ tổng tiền ở bước sau cao hơn số đã hiển thị.

### 8. Đăng nhập admin thành công nhưng bị chặn điều hướng

**Đã tái hiện:** bấm demo Admin, navbar đổi thành BEO Admin Master nhưng hiện “ACCESS AUTHORIZATION REQUIRED”, vẫn ở login. Truy cập `#/admin` sau đó thì dashboard hoạt động.

**Mã liên quan:** `LoginPage.jsx:58`, `App.jsx:231`; cần tránh kiểm tra quyền bằng state cũ ngay sau login.

### 9. Cấu hình tài khoản nhận VietQR không lưu bền

**Bằng chứng mã nguồn:** `backend/src/main/java/com/beofashion/service/VietQrService.java:17` giữ cấu hình trong field của service; update chỉ gán field, không lưu database. Khi tiến trình khởi động lại sẽ về mặc định. Chưa thay thông tin ngân hàng để thử restart.

**Cần sửa:** lưu cấu hình bền, xác thực đầu vào và có nhật ký thay đổi.

### 10. Đánh giá mẫu hiển thị như khách đã mua thật

**Đã tái hiện:** đầu trang sản phẩm 70 ghi 0 đánh giá; phía dưới lại có 3 Verified Buyer, nội dung mẫu về AIRism trên sản phẩm French Terry. Điểm đầu trang là `4.8999999999999995`.

**Nguyên nhân:** `ProductReviewsSection.jsx:8`/`:66` khởi tạo ba review fallback, giữ nguyên khi API rỗng. Cần hiển thị trạng thái chưa có đánh giá; thống nhất nguồn số sao/tổng review và làm tròn điểm.

## P2 — UI/UX và mức hoàn thiện

### 11. Mobile bị cắt ngang ở checkout và lookbook

**Đã thấy tại 375×812:** checkout có cột rộng tối thiểu 360px bên trong vùng đã trừ padding (`CheckoutPage.jsx:145`), mép phải vượt viewport; lookbook có cột tối thiểu 340px (`LookbookPage.jsx:65`), ảnh/nội dung vượt sang phải tới khoảng 389px.

**Cần sửa:** một cột `minmax(0,1fr)` trên mobile, điều chỉnh padding/breakpoint, kiểm tra lại CTA và nội dung dài.

### 12. Ảnh không khớp sản phẩm/đồ phối

**Đã thấy:** áo Hybrid Down Parka dùng ảnh người mặc áo khoác da; Down Vest dùng ảnh người mặc áo denim. Lookbook Summer Active hiển thị áo thun họa tiết nhưng liệt kê áo linen và quần chino.

**Cần sửa:** dùng ảnh đúng SKU/màu, ảnh trước-sau/chi tiết chất liệu; ảnh lookbook phải khớp món có thể mua. Đây là vấn đề nội dung, không chỉ trang trí.

### 13. Nhiều mục vẫn là placeholder

- `Footer.jsx:119`: chính sách đổi trả, bảng size và quyền riêng tư dùng `href="#"`.
- `LoginPage.jsx:162`: Quên mật khẩu dùng `href="#"`.
- Footer: điều khoản/cookie là span, không có hành động.
- `Footer.jsx:12`: newsletter chỉ đổi state và hiện mã BEO10, không lưu đăng ký hoặc gọi dịch vụ gửi thư.

**Cần sửa:** triển khai màn hình/luồng tương ứng hoặc bỏ những lời hứa chưa thực hiện.

### 14. Các tính năng AI đang là luật/từ khóa

**Mã nguồn:** `AiChatWidget.jsx:107` so khớp KNOWLEDGE_BASE_EN và phản hồi cài sẵn; không có dịch vụ AI/live agent. `VisualSearchService.java` suy luận từ visualHint/chuỗi URL và chấm điểm theo luật, không phân tích nội dung ảnh.

**Cần sửa:** gọi đúng là hỗ trợ FAQ/tìm theo mô tả nếu giữ cách hiện tại; muốn AI tìm theo ảnh thực thì cần phân tích ảnh thực. Bổ sung tiếng Việt cho nguồn trả lời chatbot.

### 15. Nút về storefront trắng chữ trên nền trắng

**Đã thấy:** góc phải banner admin và staff có hình chữ nhật trắng không đọc được nhãn. `AdminDashboardPage.jsx:484`, `StaffDashboardPage.jsx:386` ghi đè chữ trắng trên class nền trắng.

**Cần sửa:** chỉnh cả foreground/background và kiểm tra các trạng thái hover/focus. Nhiều nút icon cũng chưa có tên truy cập trong accessibility tree.

### 16. Chỉ số quản trị có phần viết cứng

Dashboard có dữ liệu đơn/doanh thu tải được, nhưng “+18.5% so với tháng trước” và “100% tài khoản đã kích hoạt” là nội dung cố định tại `AdminDashboardPage.jsx:539`/`:563`.

**Cần sửa:** tính từ dữ liệu thật hoặc ghi rõ dữ liệu minh họa; không dùng các số cố định để đánh giá kinh doanh.

### 17. Ngôn ngữ và nhận diện chưa đồng nhất

Mặc định tiếng Anh (`LanguageContext.jsx:174`) trong khi khách chính ở Cần Thơ; có các đoạn Anh/Việt trộn nhau, tên/mã UQ và nội dung LifeWear/AIRism còn nhiều. Cần chốt nội dung BEO và hoàn thiện bản dịch; cân nhắc tiếng Việt mặc định.

### 18. Khởi động, kiểm tra chất lượng và tải trang cần hoàn thiện

Sửa Maven Wrapper để lệnh hướng dẫn chạy được trên máy này, khôi phục dependency lint, chia tải các trang admin/staff/Custom Lab bằng lazy loading. Build hiện thành công nhưng chưa đủ để chứng minh toàn bộ nghiệp vụ đúng. Nên bổ sung kiểm thử các lỗi P0/P1 và quy trình đặt hàng–tồn kho–hủy/hoàn tiền trong database test riêng.

## Thứ tự đề nghị

1. Khóa mô phỏng thanh toán và tách môi trường production.
2. Sửa giá/điểm thưởng, danh mục/phân trang và biến thể người lớn.
3. Sửa đăng nhập, lưu cấu hình VietQR, bỏ review giả.
4. Hoàn thiện mobile, ảnh đúng sản phẩm, các trang chính sách và hỗ trợ.
5. Kiểm thử E2E trên dữ liệu test rồi mới đánh giá sẵn sàng triển khai.
