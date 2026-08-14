
# BEO FASHION E-Commerce Fullstack Platform
## Xây dựng Website Thương mại điện tử BEO Fashion bằng Java Spring Boot & React

Dự án website thương mại điện tử thời trang hoàn chỉnh **BEO Fashion**, lấy cảm hứng từ phong cách **BEO LifeWear** với đầy đủ 3 phân hệ:
1. **Storefront (Khách hàng)**: Mua sắm, danh mục đa cấp, bộ lọc đa năng, tìm kiếm tức thì, AI Visual Search (tìm kiếm bằng hình ảnh), gợi ý chọn size thông minh, giỏ hàng, mã giảm giá (`BEO10`), checkout đa kênh (COD, VNPay, VietQR động), đánh giá sản phẩm, Lookbook và Store Locator.
2. **Staff Portal & In-Store POS (`/staff/dashboard`)**: Máy POS bán hàng tại quầy hỗ trợ quét mã vạch và in hóa đơn nhiệt, hàng đợi xử lý đơn (Order Fulfillment Queue), kiểm kê tồn kho chi nhánh, yêu cầu điều chuyển hàng và quản lý sản phẩm cho Store Manager.
3. **Admin CMS (`/admin/dashboard`)**: Quản trị toàn hệ thống, dashboard KPI doanh thu, CRUD sản phẩm kèm **Trình tạo ma trận biến thể tự động (Variant Matrix Generator)**, quản lý đơn hàng toàn quốc, phân quyền và quản lý coupon.
4. **Cơ chế Single Login duy nhất (`/login`)**: Tự động phân luồng theo vai trò người dùng (Customer → Storefront, Staff → Staff Portal, Admin → Admin CMS).

---

## 🚀 Hướng dẫn Chạy Ứng dụng (1-Click)

### Cách 1: Khởi động toàn bộ với 1 cú click (Khuyến nghị)
- **Windows Batch**: Nhấp đúp vào file `start-all.bat`
- **Hoặc Windows PowerShell**: Chạy `.\start-all.ps1`

### Cách 2: Chạy độc lập từng phần

#### 1. Backend (Spring Boot 3 / Port 8080)
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
- **Backend API**: `http://localhost:8080`
- **Swagger / OpenAPI 3 UI**: `http://localhost:8080/swagger-ui.html`
- **H2 Database Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:uniqlo_db`, User: `sa`, Pass: để trống)

#### 2. Frontend (React + Vite / Port 5173)
```bash
cd frontend
npm run dev
```
- **Storefront & App**: `http://localhost:5173`

---

## 🔑 Danh sách Tài khoản Mẫu (1-Click Test Login trên trang `/login`)

| Vai trò | Email | Mật khẩu | Phân luồng mặc định | Mô tả quyền hạn |
|---|---|---|---|---|
| **Admin Master** | `admin@uniqlo.com` | `admin123` | `/admin/dashboard` | Toàn quyền quản trị hệ thống, báo cáo doanh thu, CRUD sản phẩm, phân quyền |
| **Store Manager** | `manager.dongkhoi@uniqlo.com` | `staff123` | `/staff/dashboard` | Quản lý chi nhánh Vincom Đồng Khởi, duyệt điều chuyển hàng, xem báo cáo ca |
| **POS Cashier** | `pos.dongkhoi@uniqlo.com` | `staff123` | `/staff/dashboard` (POS) | Thu ngân bán hàng tại quầy, quét mã barcode, tính tiền thối, in hóa đơn nhiệt |
| **Warehouse Staff** | `warehouse.dongkhoi@uniqlo.com` | `staff123` | `/staff/dashboard` (Kho) | Soạn hàng, đóng gói đơn Online/Click & Collect, kiểm kê tồn kho chi nhánh |
| **Customer** | `customer@gmail.com` | `customer123` | `/` (Storefront) | Khách hàng mua sắm, quản lý giỏ hàng, wishlist, đặt hàng và lịch sử đơn |

---

## 🏷️ Mã Khuyến Mãi (Coupons) Tích Hợp Sẵn

- `UNIQLO10`: Giảm 10% tổng đơn hàng (Tối đa 100.000đ, áp dụng cho đơn từ 300.000đ).
- `LIFEWEAR50K`: Giảm ngay 50.000đ cho đơn hàng từ 400.000đ.

---

## 🏗️ Kiến trúc & Công nghệ Sử dụng

### Backend (Java Spring Boot 3.3.x)
- **Java 17 OpenJDK**
- **Spring Web MVC & Spring Data JPA (Hibernate)**
- **Spring Security 6** + **JJWT (`io.jsonwebtoken 0.12.5`)**
- **H2 Database** (Chế độ tương thích MySQL, tự động tạo dữ liệu mẫu thực tế Uniqlo khi khởi động)
- **SpringDoc OpenAPI 3 / Swagger UI**
- **BCrypt Password Encoder** & **CORS Filter**

### Frontend (React + Vite + Modern CSS Design Tokens)
- **Thiết kế phong cách Tối giản Nhật Bản (Uniqlo Minimalism)**: Màu đỏ signature `#e60012`, typography sắc nét, responsive mượt mà.
- **Contexts**: `AuthContext`, `CartContext`, `WishlistContext`, `LanguageContext` (Đa ngôn ngữ VI / EN), `ToastContext`.
- **Axios HTTP Client** tự động gắn Bearer Token và quản lý guest session.
- **Lucide React Icons** & **Canvas Confetti**.

---

## 📁 Cấu trúc Thư mục

```
d:/web code/
 ├── backend/
 │    ├── pom.xml
 │    ├── mvnw.cmd, mvnw
 │    └── src/main/
 │         ├── java/com/uniqlo/clone/
 │         │    ├── config/          # SecurityConfig, CorsConfig, SwaggerConfig
 │         │    ├── controller/      # Auth, Product, Category, Cart, Order, Staff, Admin...
 │         │    ├── dataseed/        # DataInitializer (Khởi tạo sẵn 8+ sản phẩm, kho, user, coupon)
 │         │    ├── dto/             # Request & Response DTOs
 │         │    ├── entity/          # JPA Entities (User, Store, Product, Variant, Order...)
 │         │    ├── exception/       # GlobalExceptionHandler
 │         │    ├── repository/      # Spring Data JPA Repositories
 │         │    ├── security/        # JWT Filter, Token Provider, UserDetails
 │         │    └── service/         # Business Logic Services
 │         └── resources/
 │              └── application.yml  # H2 DB, Port 8080, JWT Secret, Swagger config
 ├── frontend/
 │    ├── package.json
 │    ├── vite.config.js             # Vite proxy /api -> :8080
 │    ├── index.html
 │    └── src/
 │         ├── components/           # Navbar, Footer, ProductCard, CartDrawer, SizeAdvisor, Receipt...
 │         ├── contexts/             # AuthContext, CartContext, WishlistContext, LanguageContext, ToastContext
 │         ├── pages/                # Home, Listing, Detail, Checkout, Success, Orders, POS/Staff, Admin...
 │         ├── services/             # Axios API Client
 │         ├── index.css             # Uniqlo Design Tokens & CSS Utilities
 │         ├── App.jsx               # Main App Router & Role Guard
 │         └── main.jsx
 ├── run-backend.bat
 ├── run-frontend.bat
 ├── start-all.bat
 ├── start-all.ps1
 └── README.md
```
