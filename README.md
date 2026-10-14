# BEO Fashion

BEO Fashion là nền tảng thương mại điện tử thời trang người lớn cho cửa hàng tại Cần Thơ. Hệ thống gồm website khách hàng, trang quản trị, màn hình vận hành cửa hàng và backend Spring Boot dùng chung một cơ sở dữ liệu.

## Chức năng chính

- Danh mục thời trang Nam, Nữ và Phụ kiện Unisex; tìm kiếm, lọc, xem chi tiết và biến thể sản phẩm.
- Giỏ hàng, mã giảm giá, yêu thích, đánh giá, tư vấn kích cỡ và thiết kế sản phẩm cá nhân hóa.
- Đặt hàng giao tận nơi hoặc nhận tại cửa hàng; hỗ trợ COD, chuyển khoản/VietQR và theo dõi trạng thái đơn.
- Tài khoản khách hàng, hồ sơ cá nhân, lịch sử đơn hàng và khôi phục mật khẩu.
- BEO AI Chat hỗ trợ tiếng Việt và tiếng Anh; có thể kết nối Gemini qua biến môi trường `GEMINI_API_KEY`.
- Tìm kiếm sản phẩm bằng ảnh, lookbook, newsletter và các trang chính sách/chăm sóc khách hàng.
- Trang nhân viên quản lý đơn, tồn kho, POS và báo cáo ca.
- Trang quản trị quản lý sản phẩm, đơn hàng, người dùng, mã giảm giá, cấu hình thanh toán và báo cáo doanh thu; hỗ trợ xuất Excel/PDF.

## Công nghệ

- Frontend: React 19, Vite, CSS responsive, Lucide Icons, Recharts.
- Backend: Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA.
- Dữ liệu: H2 dạng file cho môi trường phát triển; có thể cấu hình MySQL khi triển khai.
- Kiểm thử: Vitest cho frontend, JUnit/Spring Boot cho backend và bộ E2E trong `scratch/`.

## Chạy dự án

Yêu cầu: Node.js, npm và Java 17.

```powershell
npm install
npm start
```

Hoặc trên Windows, chạy `start.bat`. Trình khởi động sẽ mở cả backend và frontend.

### Kết nối BEO AI Chat với Gemini

Chat vẫn trả lời từ dữ liệu sản phẩm khi chưa có khóa AI. Để bật trả lời bằng Gemini, tạo API key trong Google AI Studio rồi đặt khóa vào terminal **trước khi chạy backend**:

```powershell
$env:GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
npm start
```

Khi khóa hợp lệ, cửa sổ chat hiển thị trạng thái **AI connected**. Không lưu API key vào mã nguồn hoặc file nộp bài.

- Website: `http://localhost:5173`
- API: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/beo_fashion_db`

Thông tin đăng nhập quản trị và nhân viên được quản lý trong dữ liệu hệ thống, không hiển thị công khai trên giao diện hoặc tài liệu dự án.

## Chạy riêng từng phần

```powershell
# Backend
cd backend
.\mvnw.cmd spring-boot:run

# Frontend (mở terminal khác)
cd frontend
npm install
npm run dev
```

## Kiểm tra chất lượng

```powershell
# Frontend
cd frontend
npm run lint
npm test
npm run build

# Backend
cd ..\backend
.\mvnw.cmd test

# Kiểm tra luồng chính khi cả hai dịch vụ đang chạy
cd ..
npm test
```

## Cấu trúc dự án

```text
web code/
├── backend/
│   └── src/main/java/com/beofashion/
├── frontend/
│   ├── public/
│   └── src/
├── docs/
├── scratch/
├── start.js
├── start.bat
└── start-public.js
```
