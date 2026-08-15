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
        if (userRepository.count() > 0) {
            log.info("Database already seeded with {} users, {} products, {} orders. Skipping initial data load to preserve all user data.",
                    userRepository.count(), productRepository.count(), orderRepository.count());
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
                .name("Men")
                .slug("men")
                .gender(Gender.MEN)
                .displayOrder(1)
                .bannerImage("https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1200&q=80")
                .build());

        Category catMenTops = categoryRepository.save(Category.builder()
                .name("Men's Tops")
                .slug("men-tops")
                .gender(Gender.MEN)
                .parent(catMen)
                .displayOrder(1)
                .build());

        Category catMenBottoms = categoryRepository.save(Category.builder()
                .name("Men's Bottoms")
                .slug("men-bottoms")
                .gender(Gender.MEN)
                .parent(catMen)
                .displayOrder(2)
                .build());

        Category catMenOuterwear = categoryRepository.save(Category.builder()
                .name("Men's Outerwear")
                .slug("men-outerwear")
                .gender(Gender.MEN)
                .parent(catMen)
                .displayOrder(3)
                .build());

        Category catMenInnerwear = categoryRepository.save(Category.builder()
                .name("Men's Innerwear & HEATTECH")
                .slug("men-innerwear")
                .gender(Gender.MEN)
                .parent(catMen)
                .displayOrder(4)
                .build());

        Category catWomen = categoryRepository.save(Category.builder()
                .name("Women")
                .slug("women")
                .gender(Gender.WOMEN)
                .displayOrder(2)
                .bannerImage("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80")
                .build());

        Category catWomenTops = categoryRepository.save(Category.builder()
                .name("Women's Tops")
                .slug("women-tops")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(1)
                .build());

        Category catWomenBottoms = categoryRepository.save(Category.builder()
                .name("Women's Bottoms & Skirts")
                .slug("women-bottoms")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(2)
                .build());

        Category catWomenDresses = categoryRepository.save(Category.builder()
                .name("Dresses & Jumpsuits")
                .slug("women-dresses")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(3)
                .build());

        Category catWomenOuterwear = categoryRepository.save(Category.builder()
                .name("Women's Outerwear & Hoodies")
                .slug("women-outerwear")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(4)
                .build());

        Category catWomenInnerwear = categoryRepository.save(Category.builder()
                .name("Women's Innerwear & Wireless Bras")
                .slug("women-innerwear")
                .gender(Gender.WOMEN)
                .parent(catWomen)
                .displayOrder(5)
                .build());

        Category catAccessories = categoryRepository.save(Category.builder()
                .name("Accessories & Bags")
                .slug("accessories")
                .gender(Gender.UNISEX)
                .displayOrder(3)
                .bannerImage("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80")
                .build());

        // 4. PRODUCTS & VARIANTS
        List<Store> allStores = List.of(storeBeo);

        // Product 1: AIRism Cotton Oversized T-Shirt (Flagship product)
        Product p1 = createProductWithVariants(
                "AIRism Cotton Oversized Crew Neck T-Shirt",
                "UQ-455359",
                "airism-cotton-oversized-crew-neck-t-shirt",
                "Modern Uniqlo U relaxed fit. High-grade cotton exterior for a clean, elegant drape, bonded with silky AIRism interior for maximum breathability and moisture-wicking comfort.",
                "Signature Uniqlo AIRism cooling technology.\nNeat ribbed neckline with comfortable oversized silhouette.\nEssential daily LifeWear for any weather.",
                "53% Cotton, 47% Polyester",
                "Machine wash cold, gentle cycle",
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
                "HEATTECH Crew Neck Long Sleeve T-Shirt",
                "UQ-460670",
                "heattech-crew-neck-long-sleeve-t-shirt",
                "Classic bio-warming HEATTECH jersey converts moisture from the body into soothing warmth, engineered with soft, stretch fibers that fit smoothly under any outfit.",
                "Advanced thermal fibers lock in warmth and neutralize odors.\n4-way stretch fabric contours softly to the body.",
                "38% Polyester, 32% Rayon, 21% Acrylic, 9% Spandex",
                "Machine wash warm, do not tumble dry",
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
                "Smart Ankle Pants 2-Way Stretch",
                "UQ-463942",
                "smart-ankle-pants-2-way-stretch",
                "Versatile tailored trousers suitable for business or casual everyday styling. 2-way stretch fabric delivers all-day ease with an easy-care wrinkle-resistant finish.",
                "Easy-care wrinkle resistance.\nHidden elastic waistband for refined tailoring.",
                "67% Polyester, 29% Rayon, 4% Spandex",
                "Machine wash gentle, medium iron",
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
                "Ultra Light Down Puffer Jacket",
                "UQ-460920",
                "ultra-light-down-jacket",
                "Iconic lightweight premium down jacket. Packs neatly into its matching carrying pouch with water-repellent coating and superior 750+ fill power insulation.",
                "90% premium down cluster ratio (750+ fill power).\nIncludes matching compact carrying pouch.",
                "Shell: 100% Nylon; Lining: 90% Down, 10% Feathers",
                "Hand wash cold with down cleaner",
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
                "UT Anime Graphic Crew Neck T-Shirt",
                "UQ-467812",
                "ut-graphic-t-shirt-jujutsu-kaisen",
                "Exclusive UT collaboration series showcasing celebrated anime artistry. Heavyweight 100% cotton with a unisex silhouette.",
                "Heavyweight 100% durable cotton.\nStandard unisex fit for versatile styling.",
                "100% Cotton",
                "Machine wash cold, wash inside out",
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
                "Women Supima Cotton Crew Neck T-Shirt",
                "UQ-458721",
                "women-supima-cotton-crew-neck-t-shirt",
                "Crafted from 100% rare Supima cotton representing less than 1% of global cotton output. Features a lustrous natural sheen and delicate feminine crew neckline.",
                "Exceptional shape retention after multiple washes.\nSlim feminine collar design.",
                "100% Supima Cotton",
                "Machine wash cold gentle",
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
                "Women Pleated Wide-Leg Pants",
                "UQ-460311",
                "women-pleated-wide-pants",
                "Viral wide-leg silhouette with front double pleats creating an elongated leg line. Fluid, wrinkle-resistant drape with an elasticated waistband.",
                "Luxurious drape with low-maintenance finish.\nHidden elastic waistband for easy wear.",
                "66% Polyester, 28% Rayon, 6% Spandex",
                "Machine wash cold, light steam iron",
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
                "Women AIRism UV Protection Mesh Hoodie",
                "UQ-464850",
                "women-airism-uv-protection-mesh-hoodie",
                "Instant UPF 50+ sun barrier in breathable AIRism mesh fabric with extended thumbhole cuffs to shield the back of hands from harsh UV rays.",
                "Blocks over 90% of harmful UV rays.\nFast-drying and cool to the touch.",
                "75% Polyester, 13% Spandex, 12% Cupro",
                "Machine wash cold",
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
                "Men Premium Linen Long Sleeve Shirt",
                "UQ-465188",
                "premium-linen-long-sleeve-shirt-men",
                "Woven from 100% Western European flax linen. Becomes softer and gains refined character with every wash, offering natural cooling and airflow.",
                "Naturally breathable with superior moisture absorption.\nRelaxed regular fit silhouette.",
                "100% Western European Linen",
                "Machine wash cold, line dry in shade",
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
                "Men Ultra Stretch Slim Fit Jeans",
                "UQ-463933",
                "ultra-stretch-slim-fit-jeans-men",
                "Breakthrough 40%+ stretch elasticity for unrestricted mobility. Engineered with world-renowned Kaihara Japanese denim and authentic indigo dye.",
                "Renowned Kaihara Japanese denim weaving.\nAuthentic natural indigo dye.",
                "93% Cotton, 5% Polyester, 2% Spandex",
                "Wash separately on first wash, wash inside out",
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
                "Men DRY-EX Performance Polo Shirt",
                "UQ-456778",
                "dry-ex-short-sleeve-polo-shirt-men",
                "Athletic-grade rapid-drying DRY-EX technology engineered to wick away sweat instantaneously. Knit collar maintains its sharp structure after repeated washing.",
                "Rib knit collar resists pilling.\nEngineered mesh ventilation zones.",
                "100% Recycled Polyester",
                "Machine wash cold",
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
                "Women Extra Fine Merino Crew Cardigan",
                "UQ-461083",
                "extra-fine-merino-crew-neck-cardigan-women",
                "Spun from 19.5-micron ultra-fine 100% Merino wool for non-itchy, whisper-soft warmth. Machine washable with lustrous mother-of-pearl buttons.",
                "Shrink-resistant processing for machine washability.\nNatural mother-of-pearl buttons.",
                "100% Extra Fine Merino Wool",
                "Machine wash with laundry net, wool cycle",
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
                "Women Printed Floral Rayon Dress",
                "UQ-466820",
                "rayon-printed-floral-short-sleeve-dress-women",
                "Delicate vintage floral motif on supple rayon fabric. Soft silhouette with a waist tie and flattering V-neck cut for timeless elegance.",
                "Crease-resistant fabric with long-lasting vibrant color.\nGraceful V-neckline.",
                "100% Premium Rayon",
                "Machine wash cold, steam iron",
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
                "Men Stretch Chino Shorts",
                "UQ-455490",
                "stretch-chino-shorts-men",
                "Classic warm-weather chino shorts with knee-length cut. Soft twill weave with stretch flexibility for active weekends.",
                "Standard above-knee length.\nDeep functional pockets for essentials.",
                "97% Cotton, 3% Spandex",
                "Machine wash cold",
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
                "Women Tailored Relaxed Blazer Jacket",
                "UQ-460855",
                "tailored-relaxed-blazer-jacket-women",
                "Elevated menswear-inspired relaxed tailoring with subtle shoulder pads for crisp definition. Premium crease-resistant twill with silky lining.",
                "Premium wrinkle-resistant fabric weave.\nSoft silk-feel lining for fluid motion.",
                "68% Polyester, 28% Rayon, 4% Spandex",
                "Dry clean or delicate hand wash",
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

        // Product 16: AIRism Cotton Relaxed Fit Long Sleeve T-Shirt
        Product p16 = createProductWithVariants(
                "AIRism Cotton Relaxed Fit Long Sleeve T-Shirt",
                "UQ-463200",
                "airism-cotton-relaxed-fit-long-sleeve-t-shirt",
                "Clean cotton outer with silky AIRism inner lining. Perfect relaxed drape for effortless layering all year round.",
                "Smooth moisture-wicking AIRism interior\nDouble-stitched reinforced collar",
                "53% Cotton, 47% Polyester",
                "Machine wash cold",
                new BigDecimal("499000"),
                new BigDecimal("399000"),
                catMenTops,
                Gender.MEN,
                "AIRism",
                true, true, true, false,
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 17: Women Premium Supima Cotton Tank Top
        Product p17 = createProductWithVariants(
                "Women Premium Supima Cotton Tank Top",
                "UQ-463211",
                "women-premium-supima-cotton-tank-top",
                "100% extra-long staple Supima cotton crafted with a flattering scoop neck and comfortable wide straps.",
                "100% Supima Cotton\nFlattering scoop neckline",
                "100% Supima Cotton",
                "Machine wash warm",
                new BigDecimal("299000"),
                new BigDecimal("249000"),
                catWomenTops,
                Gender.WOMEN,
                "Supima Cotton",
                true, false, true, true,
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new VariantSeed("00 WHITE", "#FFFFFF", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"),
                        new VariantSeed("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80")
                ),
                allStores
        );

        // Product 18: Pocketable UV Protection Parka Men
        Product p18 = createProductWithVariants(
                "Men Pocketable UV Protection Parka",
                "UQ-453773",
                "pocketable-uv-protection-parka-men",
                "Featherlight 120g windbreaker with UPF 50+ rating and durable water-repellent (DWR) finish. Packs into its pocket-sized carry pouch.",
                "Ultra-lightweight 120g construction.\nPacks into miniature travel pouch.",
                "100% Recycled Water-Repellent Polyester",
                "Machine wash cold, do not bleach",
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
                "Round Mini Shoulder Bag Unisex",
                "UQ-464484",
                "round-mini-shoulder-bag-unisex",
                "Global viral sensation bag with deceptive capacity. Contoured half-moon shape hugs the body, made of water-resistant lightweight nylon.",
                "Cleverly fits 500ml water bottles and full-sized wallets.\nAdjustable nylon strap for customized drop.",
                "Shell: 100% Nylon; Lining: 100% Polyester",
                "Wipe clean with damp cloth",
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
                "Women AIRism Seamless Wireless Bra",
                "UQ-464332",
                "airism-wireless-bra-seamless-women",
                "2-in-1 design with built-in 3D molded cups for natural lift without underwire pinch. Seamless bonded edges stay invisible under clothing.",
                "3D molded bra cups shape natural, flattering bust line.\nSeamless laser-cut edges eliminate show-through.",
                "85% Polyester, 15% Spandex",
                "Machine wash with laundry mesh bag",
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
                .description("10% OFF all BEO Fashion orders (Max 100,000 VND discount)")
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
                .description("10% OFF all orders (Max 100,000 VND discount)")
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
                .description("50,000 VND direct discount on orders from 400,000 VND")
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
                    .notes(orderType == OrderType.IN_STORE_PICKUP ? "In-store pickup at Can Tho Showroom" : "Standard delivery during business hours")
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
