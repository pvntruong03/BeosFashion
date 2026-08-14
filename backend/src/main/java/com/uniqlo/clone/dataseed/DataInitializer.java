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
import java.util.Random;

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
        if (userRepository.count() > 0 && orderRepository.count() >= 50) {
            log.info("Database already seeded with {} orders. Skipping initial data load.", orderRepository.count());
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

        Category catWomenOuterwear = categoryRepository.save(Category.builder()
                .name("Áo Khoác Nữ")
                .slug("women-outerwear")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(4)
                .build());

        Category catWomenInnerwear = categoryRepository.save(Category.builder()
                .name("Đồ Lót & Bra Top Nữ")
                .slug("women-innerwear")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(5)
                .build());

        Category catKids = categoryRepository.save(Category.builder()
                .name("Trẻ Em")
                .slug("kids")
                .gender(Gender.KIDS)
                .displayOrder(3)
                .bannerImage("https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80")
                .build());

        Category catKidsTops = categoryRepository.save(Category.builder()
                .name("Áo Trẻ Em")
                .slug("kids-tops")
                .gender(Gender.KIDS)
                .parent(catKids)
                .displayOrder(1)
                .build());

        Category catKidsBottoms = categoryRepository.save(Category.builder()
                .name("Quần Trẻ Em")
                .slug("kids-bottoms")
                .gender(Gender.KIDS)
                .parent(catKids)
                .displayOrder(2)
                .build());

        Category catAccessories = categoryRepository.save(Category.builder()
                .name("Phụ Kiện & Túi")
                .slug("accessories")
                .gender(Gender.UNISEX)
                .displayOrder(4)
                .bannerImage("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80")
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
                catWomenOuterwear,
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

        // Product 9: Premium Linen Long Sleeve Shirt Men
        Product p9 = createProductWithVariants(
                "Áo Sơ Mi Vải Linen Premium Dài Tay Nam",
                "UQ-465188",
                "premium-linen-long-sleeve-shirt-men",
                "Được may từ 100% sợi lanh cao cấp có nguồn gốc từ Tây Âu. Càng giặt chất vải càng mềm mịn và mang nét đẹp tự nhiên mộc mạc.",
                "Thoáng khí tự nhiên, thấm hút mồ hôi vượt trội.\nPhom dáng suông rộng rãi thoải mái.",
                "100% Vải Lanh (Linen)",
                "Giặt máy nước lạnh, phơi trong bóng râm",
                new BigDecimal("899000"),
                new BigDecimal("749000"),
                catMenTops,
                Gender.MEN,
                "Premium Linen",
                true, true, true, true,
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("65 BLUE", "#85C1E9", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("31 BEIGE", "#F5EEF8", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 10: Ultra Stretch Slim Fit Jeans Men
        Product p10 = createProductWithVariants(
                "Quần Jeans Co Giãn Siêu Thoải Mái Ultra Stretch Slim Fit Nam",
                "UQ-463933",
                "ultra-stretch-slim-fit-jeans-men",
                "Độ co giãn đột phá lên tới hơn 40% giúp bạn vận động linh hoạt không chút gò bó. Phom dáng ống ôm vừa vặn tôn dáng vẻ nam tính hiện đại.",
                "Công nghệ dệt denim Kaihara Nhật Bản trứ danh.\nMàu nhuộm chàm tự nhiên bền đẹp.",
                "93% Bông, 5% Polyeste, 2% Spandex",
                "Giặt riêng ở lần giặt đầu, lộn trái khi giặt",
                new BigDecimal("999000"),
                null,
                catMenBottoms,
                Gender.MEN,
                "Denim Collection",
                true, true, true, false,
                "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("68 BLUE", "#2471A3", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 11: DRY-EX Polo Shirt Men
        Product p11 = createProductWithVariants(
                "Áo Polo DRY-EX Cổ Bẻ Thể Thao Nam",
                "UQ-456778",
                "dry-ex-short-sleeve-polo-shirt-men",
                "Công nghệ vải DRY-EX khô siêu tốc được các vận động viên hàng đầu tin dùng. Thấm hút mồ hôi và khuếch tán cực nhanh giữ cho cơ thể luôn khô ráo.",
                "Cổ áo dệt rib tinh xảo chống xù lông.\nCấu trúc mắt lưới thông khí ở các vùng dễ toát mồ hôi.",
                "100% Polyeste tái chế thân thiện môi trường",
                "Giặt máy nước lạnh",
                new BigDecimal("499000"),
                new BigDecimal("399000"),
                catMenTops,
                Gender.MEN,
                "DRY-EX",
                true, false, true, true,
                "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("69 NAVY", "#1A252F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 12: Extra Fine Merino Cardigan Women
        Product p12 = createProductWithVariants(
                "Áo Cardigan Vải Len Cừu Extra Fine Merino Nữ",
                "UQ-461083",
                "extra-fine-merino-crew-neck-cardigan-women",
                "Được dệt từ 100% sợi len cừu Merino siêu mảnh 19.5 micron cực kỳ mềm mại, không gây ngứa hay kích ứng da. Bề mặt có độ bóng mượt sang trọng.",
                "Công nghệ xử lý chống co rút, có thể giặt máy.\nHàng cúc xà cừ tinh tế.",
                "100% Len Cừu Merino Cao Cấp",
                "Giặt máy với lưới giặt, chế độ len",
                new BigDecimal("899000"),
                null,
                catWomenTops,
                Gender.WOMEN,
                "Extra Fine Merino",
                true, true, true, false,
                "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("01 OFF WHITE", "#FAF9F6", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("12 PINK", "#FADBD8", List.of("XS", "S", "M"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 13: Rayon Printed Floral Dress Women
        Product p13 = createProductWithVariants(
                "Đầm Rayon Họa Tiết Hoa Nhí Thắt Nơ Eo Nữ",
                "UQ-466820",
                "rayon-printed-floral-short-sleeve-dress-women",
                "Chất liệu Rayon mềm rủ tôn lên nét duyên dáng thướt tha. Họa tiết hoa nhí phong cách vintage trang nhã đi cùng dây thắt eo tạo điểm nhấn hoàn hảo.",
                "Vải ít nhăn và giữ màu tươi sáng sau khi giặt.\nCổ áo chữ V thanh thoát.",
                "100% Sợi Rayon cao cấp",
                "Giặt máy nước lạnh, ủi hơi nước",
                new BigDecimal("999000"),
                new BigDecimal("799000"),
                catWomenDresses,
                Gender.WOMEN,
                "LifeWear Dresses",
                true, true, true, true,
                "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("69 NAVY", "#1A252F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("10 PINK", "#FADBD8", List.of("S", "M"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("30 NATURAL", "#F5EEF8", List.of("M", "L"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 14: Chino Shorts Men
        Product p14 = createProductWithVariants(
                "Quần Short Kaki Chino Co Giãn Thoải Mái Nam",
                "UQ-455490",
                "stretch-chino-shorts-men",
                "Chiếc quần short hoàn hảo cho những chuyến du lịch và hoạt động mùa hè. Chất liệu kaki dệt chéo mềm mại có bổ sung sợi co giãn mang lại sự năng động.",
                "Độ dài ngang gối chuẩn mực thanh lịch.\nTúi sâu tiện lợi đựng điện thoại và ví.",
                "97% Bông Cotton, 3% Spandex",
                "Giặt máy nước lạnh",
                new BigDecimal("499000"),
                null,
                catMenBottoms,
                Gender.MEN,
                "Chino Shorts",
                true, false, true, false,
                "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("32 BEIGE", "#D2B48C", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("57 OLIVE", "#556B2F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("69 NAVY", "#1A252F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 15: Tailored Relaxed Blazer Women
        Product p15 = createProductWithVariants(
                "Áo Blazer Phom Rộng Phong Cách Thanh Lịch Nữ",
                "UQ-460855",
                "tailored-relaxed-blazer-jacket-women",
                "Item thời thượng mang phong cách menswear sang trọng cho phái đẹp. Cầu vai nhẹ nhàng tạo phom đứng dáng thanh thoát chuẩn quý cô công sở hiện đại.",
                "Chất vải dệt cao cấp chống nhăn.\nLớp lót lụa mềm êm ái khi cử động.",
                "68% Polyeste, 28% Rayon, 4% Spandex",
                "Giặt khô chuyên dụng hoặc giặt tay nhẹ",
                new BigDecimal("1499000"),
                new BigDecimal("1299000"),
                catWomenOuterwear,
                Gender.WOMEN,
                "Tailored Jacket",
                true, true, true, true,
                "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("31 BEIGE", "#E5D3B3", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("08 DARK GRAY", "#2C3E50", List.of("M", "L"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 16: Kids Graphic T-Shirt
        Product p16 = createProductWithVariants(
                "Áo Thun Cotton Họa Tiết Hoạt Hình Trẻ Em Kids",
                "UQ-463200",
                "kids-graphic-short-sleeve-t-shirt",
                "100% sợi bông cotton tự nhiên an toàn và êm dịu cho làn da nhạy cảm của bé. Hình in ngộ nghĩnh nhiều màu sắc sinh động kích thích sự sáng tạo.",
                "Đường may bo viền êm ái không cọ xát da bé.\nVải thấm hút mồ hôi cho bé thỏa sức chạy nhảy.",
                "100% Bông Cotton Tự Nhiên",
                "Giặt máy nước lạnh",
                new BigDecimal("199000"),
                null,
                catKidsTops,
                Gender.KIDS,
                "Kids UT",
                true, true, true, false,
                "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("00 WHITE", "#FFFFFF", List.of("110", "120", "130", "140", "150"), "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("52 GREEN", "#2ECC71", List.of("110", "120", "130", "140"), "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("70 LIGHT PURPLE", "#D7BDE2", List.of("120", "130", "140"), "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 17: Kids Sweat Jogger Pants
        Product p17 = createProductWithVariants(
                "Quần Nỉ Bo Gấu Dễ Vận Động Trẻ Em Kids Jogger",
                "UQ-463211",
                "kids-sweat-jogger-pants",
                "Quần nỉ mềm mại có cạp chun co giãn và dây rút điều chỉnh bên trong. Ống quần bo gấu gọn gàng giúp bé vui chơi chạy nhảy an toàn không vấp ngã.",
                "Lớp nỉ lót bên trong êm mịn và giữ ấm nhẹ nhàng.\nTúi 2 bên tiện lợi.",
                "100% Bông Cotton mềm",
                "Giặt máy nước ấm",
                new BigDecimal("349000"),
                new BigDecimal("299000"),
                catKidsBottoms,
                Gender.KIDS,
                "Kids Active",
                true, false, true, true,
                "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("03 GRAY", "#BDC3C7", List.of("110", "120", "130", "140"), "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("69 NAVY", "#1A252F", List.of("110", "120", "130", "140"), "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("09 BLACK", "#111111", List.of("120", "130", "140", "150"), "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 18: Pocketable UV Protection Parka Men
        Product p18 = createProductWithVariants(
                "Áo Khoác Gió Kháng Nước Siêu Nhẹ Pocketable Parka Nam",
                "UQ-453773",
                "pocketable-uv-protection-parka-men",
                "Chiếc áo khoác gió mỏng nhẹ gấp gọn tiện lợi, có chỉ số chống nắng UPF50+ và lớp phủ trượt nước bền bỉ bảo vệ bạn trước những cơn mưa bất chợt.",
                "Trọng lượng siêu nhẹ chỉ 120g.\nKèm túi đựng nhỏ gọn bỏ vừa túi xách.",
                "100% Polyeste tái chế kháng nước",
                "Giặt máy nước lạnh, không dùng chất tẩy mạnh",
                new BigDecimal("799000"),
                null,
                catMenOuterwear,
                Gender.MEN,
                "Pocketable Parka",
                true, true, true, false,
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("68 BLUE", "#2980B9", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("56 OLIVE", "#556B2F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 19: Round Mini Shoulder Bag Unisex
        Product p19 = createProductWithVariants(
                "Túi Đeo Chéo Bán Nguyệt Mini Round Shoulder Bag Unisex",
                "UQ-464484",
                "round-mini-shoulder-bag-unisex",
                "Chiếc túi đeo chéo hiện tượng toàn cầu với sức chứa đáng kinh ngạc. Thiết kế ôm trọn cơ thể, chất vải nylon trượt nước cùng trọng lượng siêu nhẹ.",
                "Bên trong chia ngăn thông minh đựng vừa bình nước 500ml và ví dài.\nDây đeo có thể điều chỉnh độ dài linh hoạt.",
                "Vải ngoài: 100% Nylon; Lớp lót: 100% Polyeste",
                "Lau sạch bằng khăn ẩm",
                new BigDecimal("299000"),
                null,
                catAccessories,
                Gender.UNISEX,
                "Accessories",
                true, true, true, false,
                "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("09 BLACK", "#111111", List.of("FREE"), "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("30 NATURAL", "#EAECEE", List.of("FREE"), "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("12 PINK", "#FADBD8", List.of("FREE"), "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("57 OLIVE", "#556B2F", List.of("FREE"), "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 20: AIRism Wireless Bra Top Women
        Product p20 = createProductWithVariants(
                "Áo Bra Top Không Gọng Vải AIRism Nâng Ngực Nữ",
                "UQ-464332",
                "airism-wireless-bra-seamless-women",
                "Thiết kế 2 trong 1 tích hợp cúp ngực nâng đỡ tự nhiên mà không cần gọng kim loại. Vải AIRism mềm mịn như làn da thứ 2, mát lạnh và thấm hút mồ hôi tối ưu.",
                "Cúp áo đệm mút 3D định hình vòng 1 chuẩn đẹp.\nĐường viền không đường may (Seamless) không hằn vết dưới trang phục.",
                "85% Polyeste, 15% Spandex",
                "Giặt máy với túi giặt đồ lót",
                new BigDecimal("499000"),
                new BigDecimal("399000"),
                catWomenInnerwear,
                Gender.WOMEN,
                "AIRism Wireless Bra",
                true, true, true, true,
                "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("31 BEIGE", "#F5CBA7", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("01 OFF WHITE", "#FFFFFF", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80")
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

        // 7. SEED 50 REALISTIC RANDOM ORDERS
        List<Product> allProducts = List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20);
        seed50RandomOrders(allProducts, customerUser, storeBeo);

        log.info("BEO Fashion database seeding completed successfully with 20 products and 50 realistic orders!");
    }

    private void seed50RandomOrders(List<Product> allProducts, User defaultUser, Store store) {
        log.info("Generating 50 realistic fashion orders for BEO Modern Fashion...");

        String[] customerNames = {
                "Nguyễn Văn An", "Trần Thị Bích Ngọc", "Lê Hoàng Long", "Phạm Thùy Linh",
                "Võ Minh Trí", "Đặng Thu Hà", "Bùi Quốc Cường", "Hoàng Kim Oanh",
                "Ngô Đức Thắng", "Đỗ Quỳnh Như", "Huỳnh Thanh Tùng", "Trương Mỹ Duyên",
                "Phan Gia Hưng", "Vũ Mai Phương", "Lý Thanh Bình", "Đinh Ngọc Hân",
                "Dương Quốc Anh", "Tạ Bích Phượng", "Cao Văn Hậu", "Lâm Mỹ Lan"
        };

        String[] streets = {
                "209 Đường 30/4, P. Xuân Khánh, Q. Ninh Kiều",
                "45 Cách Mạng Tháng 8, P. Cái Khế, Q. Ninh Kiều",
                "128 Nguyễn Trãi, P. Thới Bình, Q. Ninh Kiều",
                "KDC 91B, P. An Khánh, Q. Ninh Kiều",
                "88 Trần Văn Khéo, P. Cái Khế, Q. Ninh Kiều",
                "15 Mậu Thân, P. An Hòa, Q. Ninh Kiều",
                "60 Đại lộ Hòa Bình, P. Tân An, Q. Ninh Kiều",
                "22 Lê Hồng Phong, P. Trà An, Q. Bình Thủy",
                "99 Đường 3/2, P. Hưng Lợi, Q. Ninh Kiều",
                "12 Võ Văn Kiệt, P. An Thới, Q. Bình Thủy",
                "33 Trần Hưng Đạo, P. An Phú, Q. Ninh Kiều",
                "KDC Hưng Phú 1, P. Hưng Phú, Q. Cái Răng",
                "120 Hùng Vương, P. Thới Bình, Q. Ninh Kiều",
                "54 Nam Kỳ Khởi Nghĩa, P. Tân An, Q. Ninh Kiều",
                "76 Lý Tự Trọng, P. An Cư, Q. Ninh Kiều"
        };

        Random random = new Random(42);

        PaymentMethod[] paymentMethods = {
                PaymentMethod.COD, PaymentMethod.BANK_TRANSFER, PaymentMethod.VNPAY, PaymentMethod.MOMO
        };

        LocalDate today = LocalDate.now();

        for (int i = 1; i <= 50; i++) {
            String name = customerNames[i % customerNames.length];
            String phone = "09" + (10000000 + random.nextInt(89999999));
            String email = "customer" + i + "@gmail.com";
            String street = streets[i % streets.length];
            String city = "Cần Thơ";

            int daysAgo;
            int hour;
            int minute;

            if (i <= 42) {
                // Exactly 6 orders for each of the last 7 days (daysAgo: 0 to 6)
                daysAgo = (i - 1) % 7;
                hour = 8 + (((i * 7) + 3) % 13); // 8:00 to 20:00
                minute = (i * 13) % 60;
            } else {
                // Remaining 8 orders for older days (8 to 28 days ago)
                daysAgo = 8 + (i - 43) * 2;
                hour = 9 + (i % 10);
                minute = (i * 17) % 60;
            }

            LocalDateTime orderDate = today.minusDays(daysAgo).atTime(hour, minute);
            String orderNumber = String.format("UQ-2608%02d-%05d", orderDate.getDayOfMonth(), 1000 + i);

            // Status distribution based on daysAgo
            OrderStatus status;
            if (daysAgo >= 4) {
                status = (i % 20 == 0) ? OrderStatus.CANCELLED : OrderStatus.COMPLETED;
            } else if (daysAgo >= 2) {
                status = OrderStatus.DELIVERED;
            } else if (daysAgo == 1) {
                status = (i % 2 == 0) ? OrderStatus.DELIVERED : OrderStatus.SHIPPING;
            } else {
                // Today (daysAgo == 0)
                if (hour >= 18) {
                    status = OrderStatus.PENDING;
                } else if (hour >= 14) {
                    status = OrderStatus.CONFIRMED;
                } else if (hour >= 11) {
                    status = OrderStatus.PACKING;
                } else {
                    status = OrderStatus.SHIPPING;
                }
            }

            OrderType orderType = (i % 4 == 0) ? OrderType.IN_STORE_PICKUP : OrderType.ONLINE_DELIVERY;
            PaymentMethod paymentMethod = paymentMethods[i % paymentMethods.length];

            // Pick 1 to 3 random products
            int itemCount = 1 + random.nextInt(3);
            List<OrderItem> items = new ArrayList<>();
            BigDecimal subTotal = BigDecimal.ZERO;

            for (int k = 0; k < itemCount; k++) {
                Product prod = allProducts.get((i * 3 + k) % allProducts.size());
                if (prod.getVariants() == null || prod.getVariants().isEmpty()) continue;
                ProductVariant variant = prod.getVariants().get(random.nextInt(prod.getVariants().size()));

                int qty = 1 + random.nextInt(2);
                BigDecimal price = prod.getSalePrice() != null ? prod.getSalePrice() : prod.getBasePrice();
                BigDecimal itemSubTotal = price.multiply(BigDecimal.valueOf(qty));
                subTotal = subTotal.add(itemSubTotal);

                items.add(OrderItem.builder()
                        .variant(variant)
                        .productName(prod.getName())
                        .productCode(prod.getCode())
                        .color(variant.getColorName())
                        .size(variant.getSize())
                        .imageUrl(variant.getImageUrl())
                        .unitPrice(price)
                        .quantity(qty)
                        .subTotal(itemSubTotal)
                        .build());
            }

            boolean useCoupon = (i % 3 == 0);
            BigDecimal discount = BigDecimal.ZERO;
            String couponCode = null;
            if (useCoupon && subTotal.compareTo(new BigDecimal("300000")) >= 0) {
                discount = subTotal.multiply(new BigDecimal("0.10")).min(new BigDecimal("100000"));
                couponCode = "BEO10";
            }

            BigDecimal shippingFee = (orderType == OrderType.IN_STORE_PICKUP || subTotal.compareTo(new BigDecimal("500000")) >= 0) 
                    ? BigDecimal.ZERO 
                    : new BigDecimal("30000");

            BigDecimal finalAmount = subTotal.subtract(discount).add(shippingFee);

            Order order = Order.builder()
                    .orderNumber(orderNumber)
                    .user((i % 2 == 0) ? defaultUser : null)
                    .store(store)
                    .orderType(orderType)
                    .status(status)
                    .customerName(name)
                    .customerPhone(phone)
                    .customerEmail(email)
                    .shippingAddress(street)
                    .shippingCity(city)
                    .trackingNumber(status == OrderStatus.SHIPPING || status == OrderStatus.DELIVERED || status == OrderStatus.COMPLETED ? "VNPOST-" + (7000000 + i * 137) : null)
                    .subTotal(subTotal)
                    .discountAmount(discount)
                    .shippingFee(shippingFee)
                    .finalAmount(finalAmount)
                    .couponCode(couponCode)
                    .notes(orderType == OrderType.IN_STORE_PICKUP ? "Nhận hàng trực tiếp tại Showroom Cần Thơ" : "Giao hàng giờ hành chính")
                    .createdAt(orderDate)
                    .updatedAt(orderDate.plusHours(1))
                    .build();

            for (OrderItem it : items) {
                it.setOrder(order);
            }
            order.setItems(items);

            Order savedOrder = orderRepository.save(order);

            PaymentStatus payStatus = (status == OrderStatus.COMPLETED || status == OrderStatus.DELIVERED || paymentMethod == PaymentMethod.BANK_TRANSFER) 
                    ? PaymentStatus.SUCCESS 
                    : (status == OrderStatus.CANCELLED ? PaymentStatus.FAILED : PaymentStatus.PENDING);

            Payment payment = Payment.builder()
                    .order(savedOrder)
                    .paymentMethod(paymentMethod)
                    .paymentStatus(payStatus)
                    .transactionId("TXN-" + savedOrder.getOrderNumber())
                    .amount(finalAmount)
                    .paymentTime(payStatus == PaymentStatus.SUCCESS ? orderDate : null)
                    .createdAt(orderDate)
                    .build();
            paymentRepository.save(payment);
        }

        log.info("50 realistic fashion orders generated successfully!");
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
