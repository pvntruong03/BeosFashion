package com.uniqlo.clone.dataseed;

import com.uniqlo.clone.entity.*;
import com.uniqlo.clone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final EmployeeRepository employeeRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data load.");
            return;
        }

        log.info("Starting BEO Fashion Clone database initial seeding...");

        // 1. SINGLE CENTRAL STORE
        Store storeBeo = storeRepository.save(Store.builder()
                .code("STR-BEO-01")
                .name("BEO Modern Fashion")
                .address("209 Đường 30 Tháng 4, Phường Xuân Khánh, Quận Ninh Kiều")
                .city("Cần Thơ")
                .phone("1900019199999")
                .openingHours("08:00 - 22:00")
                .latitude(10.0278)
                .longitude(105.7709)
                .imageUrl("https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80")
                .isCentralWarehouse(false)
                .build());

        // 2. USERS & EMPLOYEES
        User adminUser = userRepository.save(User.builder()
                .email("admin@uniqlo.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("BEO Admin Master")
                .phone("0909111222")
                .address("209 Đường 30 Tháng 4, Phường Xuân Khánh, Ninh Kiều")
                .city("Cần Thơ")
                .role(Role.ROLE_ADMIN)
                .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                .build());

        User managerUser = userRepository.save(User.builder()
                .email("manager.cantho@uniqlo.com")
                .password(passwordEncoder.encode("staff123"))
                .fullName("BEO Store Manager")
                .phone("0567740000")
                .address("209 Đường 30 Tháng 4, Phường Xuân Khánh, Ninh Kiều")
                .city("Cần Thơ")
                .role(Role.ROLE_STAFF_MANAGER)
                .avatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80")
                .build());

        employeeRepository.save(Employee.builder()
                .user(managerUser)
                .employeeCode("EMP-BEO-001")
                .store(storeBeo)
                .position("Store Manager")
                .hiredDate(LocalDate.of(2023, 1, 15))
                .build());

        User customerUser = userRepository.save(User.builder()
                .email("customer@gmail.com")
                .password(passwordEncoder.encode("customer123"))
                .fullName("Phạm Minh Hoàng")
                .phone("0912345678")
                .address("123 Nguyễn Huệ, Phường Bến Nghé, Quận 1")
                .city("TP. Hồ Chí Minh")
                .role(Role.ROLE_CUSTOMER)
                .avatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
                .build());

        // 3. CATEGORIES
        Category catMen = categoryRepository.save(Category.builder()
                .name("Nam")
                .slug("men")
                .gender(Gender.MEN)
                .displayOrder(1)
                .bannerImage("https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1200&q=80")
                .build());

        Category catMenTops = categoryRepository.save(Category.builder()
                .name("Áo Nam")
                .slug("men-tops")
                .gender(Gender.MEN)
                .parent(catMen)
                .displayOrder(1)
                .build());

        Category catMenBottoms = categoryRepository.save(Category.builder()
                .name("Quần Nam")
                .slug("men-bottoms")
                .gender(Gender.MEN)
                .parent(catMen)
                .displayOrder(2)
                .build());

        Category catMenOuterwear = categoryRepository.save(Category.builder()
                .name("Áo Khoác Nam")
                .slug("men-outerwear")
                .gender(Gender.MEN)
                .parent(catMen)
                .displayOrder(3)
                .build());

        Category catMenInnerwear = categoryRepository.save(Category.builder()
                .name("Đồ Lót & Giữ Nhiệt Nam")
                .slug("men-innerwear")
                .gender(Gender.MEN)
                .parent(catMen)
                .displayOrder(4)
                .build());

        Category catWomen = categoryRepository.save(Category.builder()
                .name("Nữ")
                .slug("women")
                .gender(Gender.WOMEN)
                .displayOrder(2)
                .bannerImage("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80")
                .build());

        Category catWomenTops = categoryRepository.save(Category.builder()
                .name("Áo Nữ")
                .slug("women-tops")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(1)
                .build());

        Category catWomenBottoms = categoryRepository.save(Category.builder()
                .name("Quần & Chân Váy Nữ")
                .slug("women-bottoms")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(2)
                .build());

        Category catWomenDresses = categoryRepository.save(Category.builder()
                .name("Đầm & Jumpsuit")
                .slug("women-dresses")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(3)
                .build());

        Category catKids = categoryRepository.save(Category.builder()
                .name("Trẻ Em")
                .slug("kids")
                .gender(Gender.KIDS)
                .displayOrder(3)
                .bannerImage("https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80")
                .build());

        // 4. PRODUCTS & VARIANTS
        List<Store> allStores = List.of(storeBeo);

        // Product 1: AIRism Cotton Oversized T-Shirt (Flagship product)
        Product p1 = createProductWithVariants(
                "AIRism Cotton Áo Thun Cổ Tròn Dáng Rộng Ngắn Tay",
                "UQ-455359",
                "airism-cotton-oversized-crew-neck-t-shirt",
                "Áo thun phong cách Uniqlo U dáng rộng hiện đại. Bề mặt ngoài bằng cotton cao cấp mang lại vẻ ngoài thanh lịch, mặt trong ứng dụng công nghệ AIRism mềm mịn, thoáng khí và thấm hút mồ hôi tối ưu.",
                "Công nghệ AIRism mát lạnh độc quyền của Uniqlo.\nThiết kế cổ tròn viền gọn gàng, phom dáng oversize thoải mái.\nPhù hợp mặc hàng ngày trong mọi điều kiện thời tiết.",
                "53% Bông, 47% Polyeste",
                "Giặt máy nước lạnh, chế độ nhẹ nhàng",
                new BigDecimal("399000"),
                null,
                catMenTops,
                Gender.MEN,
                "AIRism",
                true, true, true, false,
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("68 BLUE", "#2C3E50", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("32 BEIGE", "#D2B48C", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 2: HEATTECH Crew Neck Long Sleeve T-Shirt
        Product p2 = createProductWithVariants(
                "HEATTECH Áo Cổ Tròn Dài Tay Giữ Nhiệt",
                "UQ-460670",
                "heattech-crew-neck-long-sleeve-t-shirt",
                "Chất liệu HEATTECH kinh điển của Uniqlo chuyển hóa hơi ẩm từ cơ thể thành nhiệt lượng ấm áp, mềm mịn và nhẹ nhàng.",
                "Công nghệ sợi đặc biệt giữ ấm và ngăn mùi hiệu quả.\nChất liệu co giãn 4 chiều linh hoạt ôm trọn cơ thể.",
                "38% Polyeste, 32% Rayon, 21% Acrylic, 9% Spandex",
                "Giặt máy nước ấm, không sấy khô",
                new BigDecimal("399000"),
                null,
                catMenInnerwear,
                Gender.MEN,
                "HEATTECH",
                true, false, true, false,
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("09 BLACK", "#111111", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("03 GRAY", "#7F8C8D", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 3: Smart Ankle Pants (Co giãn 2 chiều)
        Product p3 = createProductWithVariants(
                "Smart Pants Quần Dài Co Giãn 2 Chiều Dáng Suông",
                "UQ-463942",
                "smart-ankle-pants-2-way-stretch",
                "Chiếc quần đa năng phù hợp cả môi trường công sở lịch sự và dạo phố thường ngày. Chất liệu co giãn 2 chiều mang lại cảm giác thoải mái suốt cả ngày dài.",
                "Chống nhăn sau khi giặt (Easy Care).\nCạp quần co giãn ẩn mang lại sự tinh tế.",
                "67% Polyeste, 29% Rayon, 4% Spandex",
                "Giặt máy chế độ nhẹ, ủi ở nhiệt độ trung bình",
                new BigDecimal("799000"),
                new BigDecimal("699000"),
                catMenBottoms,
                Gender.MEN,
                "LifeWear Essentials",
                true, true, false, true,
                "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("69 NAVY", "#1A252F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("31 BEIGE", "#E5D3B3", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 4: Ultra Light Down Jacket
        Product p4 = createProductWithVariants(
                "Ultra Light Down Áo Khoác Lông Vũ Siêu Nhẹ",
                "UQ-460920",
                "ultra-light-down-jacket",
                "Áo khoác lông vũ siêu nhẹ kinh điển của Uniqlo. Dễ dàng gấp gọn vào túi đựng đi kèm, bề mặt chống thấm nước nhẹ và giữ nhiệt vượt trội.",
                "Tỷ lệ 90% lông tơ vũ cao cấp (Down Fill 750+).\nKèm túi đựng mini tiện lợi cho các chuyến du lịch.",
                "Vải ngoài: 100% Nylon; Lớp lót: 90% Lông tơ, 10% Lông vũ",
                "Giặt tay nước lạnh với dung dịch giặt chuyên dụng",
                new BigDecimal("1499000"),
                new BigDecimal("1299000"),
                catMenOuterwear,
                Gender.MEN,
                "Ultra Light Down",
                true, false, true, true,
                "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("57 OLIVE", "#556B2F", List.of("M", "L"), "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("69 NAVY", "#1A252F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 5: UT Graphic T-Shirt
        Product p5 = createProductWithVariants(
                "UT Áo Thun Graphic Jujutsu Kaisen Cổ Tròn",
                "UQ-467812",
                "ut-graphic-t-shirt-jujutsu-kaisen",
                "Bộ sưu tập UT độc quyền hợp tác cùng bộ Anime đình đám Jujutsu Kaisen. Hình in sắc nét thể hiện các nhân vật được yêu thích.",
                "Chất liệu 100% cotton dày dặn bền đẹp.\nForm áo chuẩn unisex cho cả nam và nữ.",
                "100% Bông Cotton",
                "Giặt máy nước lạnh, lộn trái khi giặt",
                new BigDecimal("499000"),
                null,
                catMenTops,
                Gender.MEN,
                "UT Graphic",
                true, true, true, false,
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("00 WHITE", "#FFFFFF", List.of("XS", "S", "M", "L", "XL"), "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 6: Women Supima Cotton Crew Neck T-Shirt
        Product p6 = createProductWithVariants(
                "Áo Thun Nữ Cotton Supima Cổ Tròn Ngắn Tay",
                "UQ-458721",
                "women-supima-cotton-crew-neck-t-shirt",
                "Sử dụng 100% sợi Supima quý hiếm chiếm chưa đến 1% sản lượng bông toàn cầu. Vải có độ bóng nhẹ tự nhiên, mềm mại vượt trội trên da.",
                "Độ co giãn và giữ phom xuất sắc sau nhiều lần giặt.\nCổ áo thanh mảnh nữ tính.",
                "100% Bông Cotton Supima",
                "Giặt máy nước lạnh nhẹ nhàng",
                new BigDecimal("299000"),
                null,
                catWomenTops,
                Gender.WOMEN,
                "LifeWear Essentials",
                true, true, true, false,
                "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("01 OFF WHITE", "#F8F9F9", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("12 PINK", "#FADBD8", List.of("XS", "S", "M"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 7: Women Pleated Wide Pants
        Product p7 = createProductWithVariants(
                "Quần Xếp Ly Dáng Rộng Pleated Wide Pants Nữ",
                "UQ-460311",
                "women-pleated-wide-pants",
                "Item hot hit làm mưa làm gió khắp mạng xã hội. Ống quần suông rộng tôn dáng, xếp ly đôi phía trước tạo hiệu ứng kéo dài chân tinh tế.",
                "Chất vải rủ sang trọng, ít nhăn.\nCạp chun ẩn co giãn tiện lợi.",
                "66% Polyeste, 28% Rayon, 6% Spandex",
                "Giặt máy nước lạnh, ủi hơi nước nhẹ",
                new BigDecimal("999000"),
                new BigDecimal("799000"),
                catWomenBottoms,
                Gender.WOMEN,
                "LifeWear Collection",
                true, true, true, true,
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("32 BEIGE", "#D7BDE2", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("08 DARK GRAY", "#2C3E50", List.of("XS", "S", "M", "L"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 8: Women AIRism UV Protection Mesh Hoodie
        Product p8 = createProductWithVariants(
                "Áo Khoác Vải Mắt Lưới AIRism Chống Tia UV Nữ",
                "UQ-464850",
                "women-airism-uv-protection-mesh-hoodie",
                "Bảo vệ làn da tức thì dưới ánh nắng hè với chỉ số chống tia cực tím UPF50+. Vải mắt lưới AIRism siêu thoáng mát, có lỗ xỏ ngón tay cái che phủ mu bàn tay.",
                "Ngăn chặn hơn 90% tia UV.\nKhô nhanh và mát lạnh suốt cả ngày.",
                "75% Polyeste, 13% Spandex, 12% Cupro",
                "Giặt máy nước lạnh",
                new BigDecimal("599000"),
                null,
                catWomenTops,
                Gender.WOMEN,
                "AIRism UV Protection",
                true, false, true, false,
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("01 OFF WHITE", "#FFFFFF", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("61 BLUE", "#AED6F1", List.of("S", "M"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("71 PURPLE", "#D7BDE2", List.of("M", "L"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // 5. COUPONS
        couponRepository.save(Coupon.builder()
                .code("BEO10")
                .description("Giảm 10% cho toàn bộ đơn hàng BEO Fashion (Tối đa 100,000 VND)")
                .discountType(DiscountType.PERCENT)
                .discountValue(new BigDecimal("10"))
                .minOrderAmount(new BigDecimal("300000"))
                .maxDiscountAmount(new BigDecimal("100000"))
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().plusMonths(3))
                .usageLimit(5000)
                .usedCount(142)
                .active(true)
                .build());

        couponRepository.save(Coupon.builder()
                .code("UNIQLO10")
                .description("Giảm 10% cho toàn bộ đơn hàng (Tối đa 100,000 VND)")
                .discountType(DiscountType.PERCENT)
                .discountValue(new BigDecimal("10"))
                .minOrderAmount(new BigDecimal("300000"))
                .maxDiscountAmount(new BigDecimal("100000"))
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().plusMonths(3))
                .usageLimit(5000)
                .usedCount(142)
                .active(true)
                .build());

        couponRepository.save(Coupon.builder()
                .code("LIFEWEAR50K")
                .description("Giảm ngay 50.000 VND cho đơn từ 400.000 VND")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("50000"))
                .minOrderAmount(new BigDecimal("400000"))
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusMonths(2))
                .usageLimit(1000)
                .usedCount(85)
                .active(true)
                .build());

        // 6. SAMPLE REVIEWS
        reviewRepository.save(Review.builder()
                .product(p1)
                .user(customerUser)
                .rating(5)
                .title("Chất vải AIRism mặc siêu thích!")
                .comment("Áo dày dặn nhưng mặc rất mát mẻ, form oversize vừa vặn chuẩn phong cách tối giản. Mình cao 1m75 nặng 68kg mặc size L vừa đẹp.")
                .fitRating("TRUE_TO_SIZE")
                .purchasedSize("L")
                .purchasedColor("09 BLACK")
                .verifiedPurchase(true)
                .approved(true)
                .build());

        reviewRepository.save(Review.builder()
                .product(p1)
                .user(adminUser)
                .rating(5)
                .title("Màu sắc đẹp, không bị phai khi giặt")
                .comment("Đã mua cái thứ 3 rồi, rất đáng tiền!")
                .fitRating("TRUE_TO_SIZE")
                .purchasedSize("M")
                .purchasedColor("00 WHITE")
                .verifiedPurchase(true)
                .approved(true)
                .build());

        // 7. SAMPLE ORDERS (For dashboard testing)
        ProductVariant sampleVariant = p1.getVariants().get(0);
        Order sampleOrder = orderRepository.save(Order.builder()
                .orderNumber("UQ-260814-1001")
                .user(customerUser)
                .store(storeBeo)
                .orderType(OrderType.ONLINE_DELIVERY)
                .status(OrderStatus.CONFIRMED)
                .customerName(customerUser.getFullName())
                .customerPhone(customerUser.getPhone())
                .customerEmail(customerUser.getEmail())
                .shippingAddress("123 Nguyễn Huệ, Quận 1")
                .shippingCity("TP. Hồ Chí Minh")
                .subTotal(new BigDecimal("798000"))
                .discountAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("798000"))
                .build());

        OrderItem sampleItem = orderItemRepository.save(OrderItem.builder()
                .order(sampleOrder)
                .variant(sampleVariant)
                .productName(p1.getName())
                .productCode(p1.getCode())
                .color(sampleVariant.getColorName())
                .size(sampleVariant.getSize())
                .imageUrl(sampleVariant.getImageUrl())
                .unitPrice(p1.getBasePrice())
                .quantity(2)
                .subTotal(new BigDecimal("798000"))
                .build());

        paymentRepository.save(Payment.builder()
                .order(sampleOrder)
                .paymentMethod(PaymentMethod.VNPAY)
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("VNPAY-260814-8899")
                .amount(new BigDecimal("798000"))
                .paymentTime(LocalDateTime.now().minusHours(2))
                .build());

        log.info("Uniqlo Clone database seeding completed successfully!");
    }

    private Product createProductWithVariants(
            String name,
            String code,
            String slug,
            String description,
            String overview,
            String material,
            String careInstruction,
            BigDecimal basePrice,
            BigDecimal salePrice,
            Category category,
            Gender gender,
            String collection,
            boolean featured,
            boolean isNew,
            boolean bestSeller,
            boolean limitedOffer,
            String primaryImage,
            List<VariantSeed> variantSeeds,
            List<Store> stores) {

        Product product = productRepository.save(Product.builder()
                .name(name)
                .code(code)
                .slug(slug)
                .description(description)
                .overview(overview)
                .material(material)
                .careInstruction(careInstruction)
                .basePrice(basePrice)
                .salePrice(salePrice)
                .category(category)
                .gender(gender)
                .collection(collection)
                .featured(featured)
                .isNew(isNew)
                .bestSeller(bestSeller)
                .limitedOffer(limitedOffer)
                .primaryImageUrl(primaryImage)
                .averageRating(4.9)
                .reviewCount(18)
                .active(true)
                .build());

        List<ProductVariant> variants = new ArrayList<>();
        int barcodeSeed = 1000;

        for (VariantSeed vs : variantSeeds) {
            for (String size : vs.sizes) {
                String sku = code + "-" + vs.colorName.substring(0, 2) + "-" + size;
                String barcode = "45500" + code.replaceAll("[^0-9]", "") + (barcodeSeed++);

                ProductVariant variant = variantRepository.save(ProductVariant.builder()
                        .product(product)
                        .sku(sku)
                        .colorName(vs.colorName)
                        .colorHex(vs.colorHex)
                        .size(size)
                        .priceAdjustment(BigDecimal.ZERO)
                        .imageUrl(vs.imageUrl)
                        .barcode(barcode)
                        .totalStock(120)
                        .active(true)
                        .build());

                // Create store inventories
                for (Store s : stores) {
                    int qty = s.isCentralWarehouse() ? 60 : 20;
                    inventoryRepository.save(Inventory.builder()
                            .store(s)
                            .productVariant(variant)
                            .quantity(qty)
                            .reservedQuantity(0)
                            .lowStockThreshold(5)
                            .build());
                }

                variants.add(variant);
            }

            // Save image for color
            imageRepository.save(ProductImage.builder()
                    .product(product)
                    .imageUrl(vs.imageUrl)
                    .colorName(vs.colorName)
                    .altText(name + " - " + vs.colorName)
                    .displayOrder(0)
                    .isModelShot(false)
                    .build());
        }

        product.setVariants(variants);
        return product;
    }

    private static class VariantSeed {
        String colorName;
        String colorHex;
        List<String> sizes;
        String imageUrl;

        VariantSeed(String colorName, String colorHex, List<String> sizes, String imageUrl) {
            this.colorName = colorName;
            this.colorHex = colorHex;
            this.sizes = sizes;
            this.imageUrl = imageUrl;
        }
    }
}
