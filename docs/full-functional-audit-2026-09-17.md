# BEO Fashion — Báo cáo kiểm tra chức năng toàn hệ thống

Ngày kiểm tra: 17/09/2026  
Phạm vi: React/Vite frontend, Spring Boot backend, H2 data, desktop 1280×800 và mobile 375×812.

## Kết luận

Website đã hoàn thiện phần lớn luồng chính và có thể dùng để trình bày bài final. Các chức năng mua sắm, quản trị và giao diện responsive hoạt động. Tuy nhiên, hệ thống chưa nên được xem là hoàn thiện để triển khai thực tế vì còn các vấn đề về xác nhận thanh toán, quyền riêng tư, dữ liệu biến thể và thiếu kiểm thử tự động.

Trong lần kiểm tra này đã phát hiện và sửa trực tiếp ba lỗi:

1. Gợi ý tìm kiếm làm trắng trang do `formatPrice` chưa được lấy từ `LanguageContext`.
2. URL `#/` giữ lại màn hình cũ thay vì luôn mở Home.
3. Custom Lab thêm sai sản phẩm/màu/size/giá; giỏ hàng không hiển thị nội dung thiết kế. Sau sửa, ca kiểm tra giữ đúng Supima Cotton, `01 OFF WHITE`, size L, chữ `FINAL 2026`, giá 369.000 VND.

## Kết quả kiểm tra

| Hạng mục | Kết quả | Ghi chú |
|---|---:|---|
| Frontend production build | PASS | 1.905 modules; bundle JS 674,31 kB |
| Frontend lint | PASS có cảnh báo | Không có lỗi chặn build; còn nhiều unused import và 2 cảnh báo hook dependency |
| Backend compile/test lifecycle | PASS | Maven BUILD SUCCESS |
| Kiểm thử tự động frontend | CHƯA CÓ | 0 file test/spec |
| Kiểm thử tự động backend | CHƯA CÓ | Maven báo `No sources to compile` |
| API catalog/category/store/lookbook | PASS | Các endpoint public trả dữ liệu |
| Đăng nhập và phân quyền | PASS | Admin, Staff Manager và Customer truy cập đúng nhóm API |
| Danh sách Nam/Nữ, lọc, sắp xếp, phân trang | PASS | MEN 31 sản phẩm, WOMEN 30 sản phẩm trong lần kiểm tra |
| Tìm kiếm và autocomplete | PASS sau sửa | Từ khóa `linen` trả 5 sản phẩm |
| Tìm kiếm bằng ảnh mẫu | PASS về luồng | Trả 12 kết quả; thuật toán hiện là heuristic từ khóa, chưa phải mô hình thị giác |
| Chi tiết sản phẩm | PASS | Màu, size S/M/L/XL, tồn kho, related products, review rỗng đúng dữ liệu |
| Wishlist | PASS | Thêm và mở danh sách yêu thích thành công |
| Giỏ hàng | PASS | Thêm sản phẩm, số lượng, tổng tiền và phí giao hàng hoạt động |
| Checkout COD/VietQR | PASS về giao diện/luồng | VietQR tạo QR và đơn thành công; còn vấn đề xác thực thanh toán bên dưới |
| Xác nhận đơn/tải lại trang | PASS | Đơn `BEO-260917-6A877` vẫn hiển thị sau refresh |
| Custom Lab | PASS sau sửa | Đúng phôi, biến thể, nội dung cá nhân hóa và phụ phí |
| Lookbook/Showroom/Profile/Order History | PASS | Tải dữ liệu và không có lỗi runtime |
| Admin CMS | PASS smoke test | Overview, product, order, user, coupon, bank config tải được |
| Staff Portal | PASS smoke test | Catalog, fulfillment, inventory, report, transfer API tải được |
| Responsive mobile | PASS | 9 màn hình chính không tràn ngang ở 375 px |
| Quy tắc không có đồ trẻ em | PASS | 0 sản phẩm trẻ em đang active |

## Vấn đề cần xử lý trước khi coi là hoàn thiện

### P0 — Nghiệp vụ và bảo mật

1. **Xác nhận thanh toán VietQR có thể bị gọi công khai.** Toàn bộ `/api/payments/**` đang `permitAll`; trình duyệt tự gửi `orderNumber`, số tiền và một mã giao dịch ngẫu nhiên để chuyển đơn sang đã thanh toán. Cần dùng webhook có chữ ký từ cổng thanh toán hoặc giới hạn endpoint cho admin/staff.
2. **VNPay và MoMo được ghi `SUCCESS` ngay khi tạo đơn.** Chưa có bước chuyển hướng, callback hoặc kiểm tra chữ ký từ VNPay/MoMo.
3. **Theo dõi đơn công khai trả toàn bộ `OrderDto`.** Người biết mã đơn có thể nhận thông tin người nhận, email, số điện thoại, địa chỉ và danh sách sản phẩm. Nên yêu cầu OTP/số điện thoại hoặc trả DTO rút gọn.
4. **Review tự động được đánh dấu đã mua và được duyệt.** Backend đang gán `verifiedPurchase=true` và `approved=true` mà không đối chiếu đơn đã giao.

### P1 — Dữ liệu và độ trung thực chức năng

1. **Dữ liệu biến thể còn bẩn:** 67 biến thể size số cũ nằm trong 9 sản phẩm; 21 sản phẩm có biến thể trùng, tổng cộng 83 nhóm trùng. Frontend đang ẩn size số nhưng dữ liệu backend/admin vẫn cần dọn.
2. **Visual AI Search hiện là tìm kiếm heuristic.** Backend đọc `visualHint`/tên file, cộng điểm theo từ khóa và gán phần trăm tương đồng. Nội dung “neural-network analysis” chưa phản ánh đúng kỹ thuật hiện tại.
3. **Cấu hình VietQR chỉ lưu trong RAM.** Thay đổi tài khoản ngân hàng bị mất khi backend khởi động lại.
4. **Newsletter chỉ đổi state trong trình duyệt.** Email không được lưu; mã `BEO10` được cấp cho mọi email hợp lệ và chưa có chống đăng ký lặp.
5. **Các liên kết chưa làm:** Quên mật khẩu, đổi trả/bảo hành, bảng kích cỡ, quyền riêng tư vẫn dùng `href="#"`.

### P2 — Chất lượng kỹ thuật

1. Không có test tự động cho frontend hoặc backend.
2. `npm audit` báo 2 dependency có vấn đề: Vite mức high và esbuild mức moderate; đều có bản sửa.
3. Bundle JS 674,31 kB vượt ngưỡng 500 kB; nên lazy-load Admin, Staff, Custom Lab và Visual Search.
4. Lint chạy thành công nhưng còn nhiều cảnh báo unused import/variable và hook dependency.
5. Maven Wrapper trên Windows có lỗi đọc symlink target; lệnh Maven trực tiếp vẫn build thành công.

## Các chức năng đề xuất để lựa chọn

| Mã | Chức năng | Giá trị cho bài final | Mức công sức |
|---|---|---|---:|
| A | Click & Collect có giữ hàng theo showroom | Nối catalog, tồn kho và Staff Portal thành một luồng nghiệp vụ rõ ràng | Trung bình |
| B | Yêu cầu đổi trả trực tuyến | Khách chọn đơn/sản phẩm/lý do; staff duyệt và cập nhật tồn kho | Trung bình |
| C | Theo dõi đơn dạng timeline + thông báo email/Zalo | Làm rõ luồng PENDING → CONFIRMED → PACKING → SHIPPING → DELIVERED | Trung bình–cao |
| D | Gợi ý size theo chiều cao/cân nặng và lịch sử đổi trả | Giảm chọn sai size, tạo điểm nhấn UX thời trang | Trung bình |
| E | “Complete the Look” từ Lookbook | Bán cả set, thêm nhiều sản phẩm vào giỏ trong một lần | Nhỏ–trung bình |
| F | Review đã mua thật + ảnh | Chỉ cho review đơn DELIVERED; có duyệt ảnh và thống kê rating tin cậy | Trung bình |
| G | Dashboard doanh thu và xuất Excel/PDF | Biểu đồ theo ngày, danh mục, showroom; phù hợp phần báo cáo đồ án | Trung bình |
| H | AI tìm kiếm ảnh thật | Dùng embedding/CLIP hoặc dịch vụ vision, lưu vector và xếp hạng cosine | Cao |

Thứ tự nên làm cho bài final: xử lý P0 trước, sau đó chọn **A + B + G** để thể hiện rõ frontend, backend, database và nghiệp vụ quản trị.
