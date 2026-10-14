package com.beofashion.dataseed;

import com.beofashion.entity.*;
import com.beofashion.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@org.springframework.core.annotation.Order(3)
@RequiredArgsConstructor
@Slf4j
public class RealisticDataEnhancer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.data.enhance-on-startup:false}")
    private boolean enhanceOnStartup;

    @Override
    @Transactional
    public void run(String... args) {
        if (!enhanceOnStartup) {
            log.info("Skipping automatic demo-data enhancement. Use the admin reseed action when it is intentionally needed.");
            return;
        }
        log.info("Checking and enhancing BEO Fashion data realism and freshness...");
        enhanceData();
    }

    @Transactional
    public void enhanceData() {
        // 1. Ensure central flagship store
        Store store = storeRepository.findByCode("STR-BEO-01")
                .orElseGet(() -> storeRepository.findAll().stream().findFirst().orElse(null));

        if (store == null) {
            log.warn("No store found. Skipping realistic data enhancement.");
            return;
        }

        // 2. Enhance Customers (25+ realistic Vietnamese profiles)
        seedRealisticCustomers();

        // 3. Enhance Coupons
        seedRealisticCoupons();

        // 4. Normalize Product Variants so all apparel has 4 distinct sizes: S, M, L, XL
        normalizeProductVariants(store);

        // 5. Enhance Product Inventory & Low Stock Alerts
        seedRealisticInventory(store);

        // 6. Enhance Orders & Payments (Anchored dynamically to today & past 30 days)
        seedRealisticOrders(store);

        // 7. Enhance Customer Reviews
        seedRealisticReviews();

        log.info("BEO Fashion realistic data enhancement completed successfully!");
    }

    private void normalizeProductVariants(Store store) {
        List<Product> allProducts = productRepository.findAll();
        String[] standardSizes = {"S", "M", "L", "XL"};

        for (Product product : allProducts) {
            boolean isAccessory = product.getCategory() != null &&
                    product.getCategory().getSlug() != null &&
                    product.getCategory().getSlug().contains("access");

            List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
            if (variants.isEmpty()) continue;

            if (isAccessory) {
                for (ProductVariant v : variants) {
                    if (v.getSize() == null || v.getSize().isBlank() || v.getSize().equalsIgnoreCase("ONE SIZE")) {
                        v.setSize("FREE");
                        variantRepository.save(v);
                    }
                }
                continue;
            }

            // Group existing variants by colorName
            Map<String, List<ProductVariant>> colorMap = new LinkedHashMap<>();
            for (ProductVariant v : variants) {
                colorMap.computeIfAbsent(v.getColorName(), k -> new ArrayList<>()).add(v);
            }

            for (Map.Entry<String, List<ProductVariant>> entry : colorMap.entrySet()) {
                String colorName = entry.getKey();
                List<ProductVariant> colorVariants = entry.getValue();
                Set<String> existingSizes = new HashSet<>();

                ProductVariant template = colorVariants.get(0);

                for (ProductVariant cv : colorVariants) {
                    existingSizes.add(cv.getSize());
                }

                // Add missing standard sizes among S, M, L, XL
                for (String sz : standardSizes) {
                    if (!existingSizes.contains(sz)) {
                        String cleanColor = colorName.replaceAll("[^a-zA-Z0-9]", "");
                        String prefix = cleanColor.length() >= 2 ? cleanColor.substring(0, 2) : "CL";
                        String sku = product.getCode() + "-" + prefix + "-" + sz;
                        
                        if (variantRepository.findBySku(sku).isPresent()) {
                            log.warn("Skipping duplicate variant seed for SKU {}", sku);
                            existingSizes.add(sz);
                            continue;
                        }

                        long codeNum = 500000L + Math.abs((product.getId() * 31 + colorName.hashCode() * 17 + sz.hashCode()) % 400000L);
                        String barcode = "455" + String.format("%09d", codeNum);
                        while (variantRepository.findByBarcode(barcode).isPresent()) {
                            codeNum++;
                            barcode = "455" + String.format("%09d", codeNum);
                        }

                        ProductVariant newV = ProductVariant.builder()
                                .product(product)
                                .sku(sku)
                                .colorName(colorName)
                                .colorHex(template.getColorHex())
                                .size(sz)
                                .priceAdjustment(BigDecimal.ZERO)
                                .imageUrl(template.getImageUrl())
                                .barcode(barcode)
                                .totalStock(60)
                                .active(true)
                                .build();

                        ProductVariant savedV = variantRepository.save(newV);

                        inventoryRepository.save(Inventory.builder()
                                .store(store)
                                .productVariant(savedV)
                                .quantity(50)
                                .reservedQuantity(0)
                                .lowStockThreshold(5)
                                .build());
                        existingSizes.add(sz);
                    }
                }
            }
        }
    }

    private void seedRealisticCustomers() {
        String[][] customerData = {
                {"hoang.pham@gmail.com", "Phạm Minh Hoàng", "0912345678", "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1", "TP. Hồ Chí Minh", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"},
                {"linh.dang@gmail.com", "Đặng Thùy Linh", "0938123456", "54 Đại lộ Hòa Bình, Phường An Cư, Quận Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"},
                {"long.le@gmail.com", "Lê Hoàng Long", "0903987654", "88 Cách Mạng Tháng 8, Phường An Thới, Quận Bình Thủy", "Cần Thơ", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"},
                {"huong.giang@gmail.com", "Nguyễn Hương Giang", "0977889900", "45 Lê Lợi, Phường Bến Nghé, Quận 1", "TP. Hồ Chí Minh", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"},
                {"quoc.bao@gmail.com", "Đặng Quốc Bảo", "0988776655", "120 Hai Bà Trưng, Phường Tân Định, Quận 1", "TP. Hồ Chí Minh", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"},
                {"thanh.mai@gmail.com", "Trần Thị Thanh Mai", "0918234567", "310 Đường 30 Tháng 4, Phường Hưng Lợi, Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"},
                {"tuan.anh@gmail.com", "Vũ Tuấn Anh", "0945678901", "25 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm", "Hà Nội", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80"},
                {"yen.nhi@gmail.com", "Đỗ Yến Nhi", "0966554433", "72 Bạch Đằng, Phường Hải Châu 1, Quận Hải Châu", "Đà Nẵng", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"},
                {"minh.tri@gmail.com", "Huỳnh Minh Trí", "0923456789", "15 Trần Hưng Đạo, Phường Mỹ Bình, TP. Long Xuyên", "An Giang", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"},
                {"ngoc.anh@gmail.com", "Bùi Ngọc Ánh", "0934567890", "99 Nguyễn Trung Trực, Phường Vĩnh Lạc, TP. Rạch Giá", "Kiên Giang", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80"},
                {"huy.tran@gmail.com", "Trần Quốc Huy", "0901234567", "215 Trần Hưng Đạo, Phường An Phú, Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"},
                {"kimngan.nguyen@gmail.com", "Nguyễn Thị Kim Ngân", "0919876543", "86 Lý Tự Trọng, Phường An Cư, Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80"},
                {"giahung.lam@gmail.com", "Lâm Gia Hưng", "0981122334", "150 Mậu Thân, Phường Xuân Khánh, Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80"},
                {"thaovy.phan@gmail.com", "Phan Thảo Vy", "0976543210", "42 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu, Quận 3", "TP. Hồ Chí Minh", "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80"},
                {"thanhdat.vo@gmail.com", "Võ Thành Đạt", "0967890123", "77 Pasteur, Phường Bến Nghé, Quận 1", "TP. Hồ Chí Minh", "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=200&q=80"},
                {"myduyen.ho@gmail.com", "Hồ Mỹ Duyên", "0933445566", "198 Nguyễn Văn Cừ, Phường An Khánh, Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80"},
                {"anhtuan.truong@gmail.com", "Trương Anh Tuấn", "0914567890", "32 Hùng Vương, Phường Thới Bình, Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80"},
                {"dieu.cao@gmail.com", "Cao Thị Diệu", "0908765432", "105 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3", "TP. Hồ Chí Minh", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"},
                {"khanh.duong@gmail.com", "Dương Văn Khánh", "0989012345", "68 Quang Trung, Phường 10, Quận Gò Vấp", "TP. Hồ Chí Minh", "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80"},
                {"thuyhang.pham@gmail.com", "Phạm Thúy Hằng", "0978901234", "14 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận", "TP. Hồ Chí Minh", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"},
                {"huuphuoc.nguyen@gmail.com", "Nguyễn Hữu Phước", "0921234567", "56 Lê Duẩn, Phường Hải Châu 1, Quận Hải Châu", "Đà Nẵng", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"},
                {"baongoc.trinh@gmail.com", "Trịnh Bảo Ngọc", "0932345678", "18 Kim Mã, Phường Kim Mã, Quận Ba Đình", "Hà Nội", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80"},
                {"thevinh.dinh@gmail.com", "Đinh Thế Vinh", "0943456789", "92 Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân", "Hà Nội", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"},
                {"bichtram.le@gmail.com", "Lê Thị Bích Trâm", "0954567890", "45 Trần Phú, Phường Cái Khế, Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"},
                {"minhquan.vu@gmail.com", "Vũ Minh Quân", "0965678901", "12 Đường 3/2, Phường Xuân Khánh, Ninh Kiều", "Cần Thơ", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80"}
        };

        String defaultPass = passwordEncoder.encode("customer123");

        for (String[] c : customerData) {
            String email = c[0];
            if (userRepository.findByEmail(email).isEmpty()) {
                userRepository.save(User.builder()
                        .email(email)
                        .password(defaultPass)
                        .fullName(c[1])
                        .phone(c[2])
                        .address(c[3])
                        .city(c[4])
                        .role(Role.ROLE_CUSTOMER)
                        .avatar(c[5])
                        .build());
            }
        }
    }

    private void seedRealisticCoupons() {
        Object[][] coupons = {
                {"BEOCHAOHE", "Ưu đãi Chào Hè BEO - Giảm 15% tối đa 150.000₫ cho đơn từ 499.000₫", DiscountType.PERCENT, new BigDecimal("15"), new BigDecimal("499000"), new BigDecimal("150000"), 500, 142},
                {"CANTHOFS", "Miễn phí vận chuyển toàn quốc cho đơn hàng từ 299.000₫", DiscountType.FIXED_AMOUNT, new BigDecimal("30000"), new BigDecimal("299000"), new BigDecimal("30000"), 1000, 318},
                {"BEONEW", "Tặng 50.000₫ cho đơn hàng đầu tiên của khách hàng mới từ 300.000₫", DiscountType.FIXED_AMOUNT, new BigDecimal("50000"), new BigDecimal("300000"), new BigDecimal("50000"), 300, 89},
                {"VIPMEMBER", "Đặc quyền VIP BEO Club - Giảm 10% không giới hạn cho mọi đơn hàng", DiscountType.PERCENT, new BigDecimal("10"), new BigDecimal("0"), new BigDecimal("500000"), 200, 64},
                {"BEOFLASH", "Flash Voucher - Giảm ngay 100.000₫ cho đơn hàng từ 800.000₫", DiscountType.FIXED_AMOUNT, new BigDecimal("100000"), new BigDecimal("800000"), new BigDecimal("100000"), 150, 45},
                {"BEO20", "Voucher tri ân - Giảm 20.000₫ cho mọi đơn hàng từ 200.000₫", DiscountType.FIXED_AMOUNT, new BigDecimal("20000"), new BigDecimal("200000"), new BigDecimal("20000"), 500, 210},
                {"BEOLUXURY", "Ưu đãi Bộ Sưu Tập Cao Cấp - Giảm 200.000₫ cho đơn từ 1.500.000₫", DiscountType.FIXED_AMOUNT, new BigDecimal("200000"), new BigDecimal("1500000"), new BigDecimal("200000"), 100, 28}
        };

        for (Object[] row : coupons) {
            String code = (String) row[0];
            Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(code);
            if (opt.isEmpty()) {
                couponRepository.save(Coupon.builder()
                        .code(code)
                        .description((String) row[1])
                        .discountType((DiscountType) row[2])
                        .discountValue((BigDecimal) row[3])
                        .minOrderAmount((BigDecimal) row[4])
                        .maxDiscountAmount((BigDecimal) row[5])
                        .usageLimit((Integer) row[6])
                        .usedCount((Integer) row[7])
                        .active(true)
                        .startDate(LocalDate.now().minusDays(30))
                        .endDate(LocalDate.now().plusMonths(6))
                        .build());
            }
        }
    }

    private void seedRealisticInventory(Store store) {
        List<ProductVariant> allVariants = variantRepository.findAll();
        if (allVariants.isEmpty()) return;

        // Reset and ensure accurate inventory with 6 specific low stock items
        int lowStockCount = 0;

        for (int i = 0; i < allVariants.size(); i++) {
            ProductVariant v = allVariants.get(i);
            Optional<Inventory> optInv = inventoryRepository.findByStoreIdAndProductVariantId(store.getId(), v.getId());

            int qty;
            // First 6 variants in popular categories will be low stock (2 to 4 units)
            if (lowStockCount < 6 && (i % 12 == 1 || i % 15 == 2)) {
                qty = 2 + (i % 3); // 2, 3, 4
                lowStockCount++;
            } else {
                qty = 35 + (i * 7) % 55; // 35 to 89
            }

            v.setTotalStock(qty);
            variantRepository.save(v);

            if (optInv.isPresent()) {
                Inventory inv = optInv.get();
                inv.setQuantity(qty);
                inv.setLowStockThreshold(5);
                inv.setReservedQuantity(0);
                inventoryRepository.save(inv);
            } else {
                inventoryRepository.save(Inventory.builder()
                        .store(store)
                        .productVariant(v)
                        .quantity(qty)
                        .reservedQuantity(0)
                        .lowStockThreshold(5)
                        .build());
            }
        }
    }

    private void seedRealisticOrders(Store store) {
        List<Product> allProducts = productRepository.findByActiveTrue();
        if (allProducts.isEmpty()) return;

        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_CUSTOMER)
                .toList();

        if (customers.isEmpty()) return;

        // Check if we already have orders anchored to today
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        long todayOrdersCount = orderRepository.findAll().stream()
                .filter(o -> !o.getCreatedAt().isBefore(startOfToday))
                .count();

        if (todayOrdersCount >= 5 && orderRepository.count() >= 70) {
            log.info("System already has {} orders including {} for today. Retaining live order stream.",
                    orderRepository.count(), todayOrdersCount);
            return;
        }

        log.info("Generating realistic omnichannel order history (past 30 days anchored to current time)...");

        // Clear existing orders to avoid stale historical dates if outdated
        orderRepository.deleteAll();

        Random random = new Random(42); // Deterministic seed for reproducible realistic data
        LocalDateTime now = LocalDateTime.now();

        // 7-day plan:
        // Day 0 (Today): 8 orders
        // Day 1 (Yesterday): 12 orders
        // Day 2: 14 orders
        // Day 3: 10 orders
        // Day 4: 13 orders
        // Day 5: 9 orders
        // Day 6: 11 orders
        // Days 7-30: 38 orders
        // Total: 115 orders

        List<OrderBlueprint> blueprints = new ArrayList<>();

        // Day 0: Today (8 orders)
        blueprints.add(new OrderBlueprint(0, 8, 30, OrderStatus.COMPLETED, OrderType.POS_IN_STORE, PaymentMethod.BANK_TRANSFER, PaymentStatus.SUCCESS));
        blueprints.add(new OrderBlueprint(0, 9, 45, OrderStatus.SHIPPING, OrderType.ONLINE_DELIVERY, PaymentMethod.COD, PaymentStatus.PENDING));
        blueprints.add(new OrderBlueprint(0, 10, 15, OrderStatus.COMPLETED, OrderType.POS_IN_STORE, PaymentMethod.VNPAY, PaymentStatus.SUCCESS));
        blueprints.add(new OrderBlueprint(0, 11, 20, OrderStatus.PACKING, OrderType.IN_STORE_PICKUP, PaymentMethod.BANK_TRANSFER, PaymentStatus.SUCCESS));
        blueprints.add(new OrderBlueprint(0, 12, 10, OrderStatus.PACKING, OrderType.ONLINE_DELIVERY, PaymentMethod.MOMO, PaymentStatus.SUCCESS));
        blueprints.add(new OrderBlueprint(0, 12, 45, OrderStatus.CONFIRMED, OrderType.ONLINE_DELIVERY, PaymentMethod.BANK_TRANSFER, PaymentStatus.SUCCESS));
        blueprints.add(new OrderBlueprint(0, 13, 05, OrderStatus.PENDING, OrderType.ONLINE_DELIVERY, PaymentMethod.COD, PaymentStatus.PENDING));
        blueprints.add(new OrderBlueprint(0, 13, 18, OrderStatus.PENDING, OrderType.ONLINE_DELIVERY, PaymentMethod.BANK_TRANSFER, PaymentStatus.SUCCESS));

        // Day 1 to 6 (Past 6 days)
        int[] dayCounts = {12, 14, 10, 13, 9, 11};
        for (int day = 1; day <= 6; day++) {
            int count = dayCounts[day - 1];
            for (int k = 0; k < count; k++) {
                int hour = 8 + (k * 13) % 13;
                int minute = (k * 17) % 60;
                OrderStatus status = (day <= 2) 
                        ? (k % 4 == 0 ? OrderStatus.SHIPPING : OrderStatus.DELIVERED)
                        : (k % 15 == 0 ? OrderStatus.CANCELLED : OrderStatus.COMPLETED);
                OrderType type = (k % 5 == 0) ? OrderType.POS_IN_STORE : (k % 4 == 0 ? OrderType.IN_STORE_PICKUP : OrderType.ONLINE_DELIVERY);
                PaymentMethod pm = (k % 4 == 0) ? PaymentMethod.BANK_TRANSFER : (k % 4 == 1 ? PaymentMethod.VNPAY : (k % 4 == 2 ? PaymentMethod.MOMO : PaymentMethod.COD));
                PaymentStatus ps = (status == OrderStatus.CANCELLED) ? PaymentStatus.FAILED : (pm == PaymentMethod.COD && status != OrderStatus.DELIVERED && status != OrderStatus.COMPLETED ? PaymentStatus.PENDING : PaymentStatus.SUCCESS);
                blueprints.add(new OrderBlueprint(day, hour, minute, status, type, pm, ps));
            }
        }

        // Days 7 to 28 (38 historical orders)
        for (int i = 1; i <= 38; i++) {
            int day = 7 + (i * 21) % 22; // 7 to 28 days ago
            int hour = 9 + (i * 7) % 12;
            int minute = (i * 19) % 60;
            OrderStatus status = (i % 18 == 0) ? OrderStatus.CANCELLED : OrderStatus.COMPLETED;
            OrderType type = (i % 6 == 0) ? OrderType.POS_IN_STORE : (i % 5 == 0 ? OrderType.IN_STORE_PICKUP : OrderType.ONLINE_DELIVERY);
            PaymentMethod pm = (i % 3 == 0) ? PaymentMethod.BANK_TRANSFER : (i % 3 == 1 ? PaymentMethod.VNPAY : PaymentMethod.COD);
            PaymentStatus ps = (status == OrderStatus.CANCELLED) ? PaymentStatus.FAILED : PaymentStatus.SUCCESS;
            blueprints.add(new OrderBlueprint(day, hour, minute, status, type, pm, ps));
        }

        int orderSeq = 1001;
        for (OrderBlueprint bp : blueprints) {
            LocalDateTime orderDate = now.minusDays(bp.daysAgo).withHour(bp.hour).withMinute(bp.minute).withSecond(15);
            User customer = customers.get(random.nextInt(customers.size()));

            String orderNumber = String.format("BEO-%04d%02d%02d-%04d", 
                    orderDate.getYear(), orderDate.getMonthValue(), orderDate.getDayOfMonth(), orderSeq++);

            // Pick 1 to 3 items
            int numItems = 1 + random.nextInt(3);
            List<OrderItem> items = new ArrayList<>();
            BigDecimal subTotal = BigDecimal.ZERO;

            for (int j = 0; j < numItems; j++) {
                Product product = allProducts.get(random.nextInt(allProducts.size()));
                List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
                if (variants.isEmpty()) continue;
                ProductVariant variant = variants.get(random.nextInt(variants.size()));

                int qty = 1 + random.nextInt(2);
                BigDecimal price = product.getSalePrice() != null ? product.getSalePrice() : product.getBasePrice();
                BigDecimal itemSubTotal = price.multiply(BigDecimal.valueOf(qty));
                subTotal = subTotal.add(itemSubTotal);

                items.add(OrderItem.builder()
                        .variant(variant)
                        .productName(product.getName())
                        .productCode(product.getCode())
                        .color(variant.getColorName())
                        .size(variant.getSize())
                        .imageUrl(variant.getImageUrl())
                        .unitPrice(price)
                        .quantity(qty)
                        .subTotal(itemSubTotal)
                        .build());
            }

            if (items.isEmpty()) continue;

            // Discount calculation
            BigDecimal discount = BigDecimal.ZERO;
            String couponCode = null;
            if (subTotal.compareTo(new BigDecimal("500000")) >= 0 && random.nextBoolean()) {
                discount = subTotal.multiply(new BigDecimal("0.10")).min(new BigDecimal("100000"));
                couponCode = "BEOCHAOHE";
            } else if (subTotal.compareTo(new BigDecimal("300000")) >= 0 && bp.orderType == OrderType.ONLINE_DELIVERY && random.nextInt(3) == 0) {
                discount = new BigDecimal("30000");
                couponCode = "CANTHOFS";
            }

            BigDecimal shippingFee = (bp.orderType == OrderType.IN_STORE_PICKUP || bp.orderType == OrderType.POS_IN_STORE || subTotal.compareTo(new BigDecimal("499000")) >= 0 || "CANTHOFS".equals(couponCode))
                    ? BigDecimal.ZERO
                    : new BigDecimal("30000");

            BigDecimal finalAmount = subTotal.subtract(discount).add(shippingFee);

            String trackingNumber = (bp.status == OrderStatus.SHIPPING || bp.status == OrderStatus.DELIVERED || bp.status == OrderStatus.COMPLETED)
                    ? "VNPOST-" + (7890000 + random.nextInt(99999))
                    : null;

            String custName = (customer != null && customer.getFullName() != null && !customer.getFullName().isBlank()) ? customer.getFullName() : "Phạm Minh Hoàng";
            String custPhone = (customer != null && customer.getPhone() != null && !customer.getPhone().isBlank()) ? customer.getPhone() : ("09" + (10000000 + random.nextInt(89999999)));
            String custEmail = (customer != null && customer.getEmail() != null) ? customer.getEmail() : "customer" + random.nextInt(1000) + "@gmail.com";
            String custAddr = (customer != null && customer.getAddress() != null) ? customer.getAddress() : "209 Đường 30 Tháng 4, Phường Xuân Khánh";
            String custCity = (customer != null && customer.getCity() != null) ? customer.getCity() : "Cần Thơ";

            com.beofashion.entity.Order order = com.beofashion.entity.Order.builder()
                    .orderNumber(orderNumber)
                    .user(bp.orderType == OrderType.POS_IN_STORE && random.nextBoolean() ? null : customer)
                    .store(store)
                    .orderType(bp.orderType)
                    .status(bp.status)
                    .customerName(custName)
                    .customerPhone(custPhone)
                    .customerEmail(custEmail)
                    .shippingAddress(custAddr)
                    .shippingCity(custCity)
                    .trackingNumber(trackingNumber)
                    .subTotal(subTotal)
                    .discountAmount(discount)
                    .shippingFee(shippingFee)
                    .finalAmount(finalAmount)
                    .couponCode(couponCode)
                    .notes(bp.orderType == OrderType.POS_IN_STORE ? "POS In-Store Checkout - BEO Can Tho Showroom" : (bp.orderType == OrderType.IN_STORE_PICKUP ? "Khách nhận tại showroom BEO Cần Thơ" : "Giao hàng giờ hành chính"))
                    .createdAt(orderDate)
                    .updatedAt(orderDate.plusMinutes(15))
                    .build();

            for (OrderItem item : items) {
                item.setOrder(order);
            }
            order.setItems(items);

            com.beofashion.entity.Order savedOrder = orderRepository.save(order);

            Payment payment = Payment.builder()
                    .order(savedOrder)
                    .paymentMethod(bp.paymentMethod)
                    .paymentStatus(bp.paymentStatus)
                    .transactionId("TXN-" + savedOrder.getOrderNumber().replace("BEO-", ""))
                    .amount(finalAmount)
                    .paymentTime(bp.paymentStatus == PaymentStatus.SUCCESS ? orderDate : null)
                    .paymentDetails(bp.paymentMethod == PaymentMethod.BANK_TRANSFER ? "VietQR Instant Transfer via MB Bank" : bp.paymentMethod.name())
                    .createdAt(orderDate)
                    .build();
            paymentRepository.save(payment);
        }

        log.info("Successfully created {} realistic omnichannel orders with accurate timeline!", blueprints.size());
    }

    private void seedRealisticReviews() {
        if (reviewRepository.count() >= 20) return;

        List<Product> products = productRepository.findByActiveTrue();
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_CUSTOMER)
                .toList();

        if (products.isEmpty() || customers.isEmpty()) return;

        String[][] reviewsData = {
                {"Chất vải BEO AirFlow mặc cực kỳ mát mẻ và nhẹ!", "Đi ngoài trời Cần Thơ 34 độ không hề bị hầm bí. Form áo oversize rất chuẩn, đường may kỹ lưỡng và dày dặn.", "5", "TRUE_TO_SIZE", "L", "09 BLACK"},
                {"Quần Smart Ankle Pants co giãn 2 chiều siêu thoải mái", "Mặc ngồi làm việc văn phòng suốt 8 tiếng không bị cấn hay gò bó. Vải không nhăn sau khi giặt máy.", "5", "TRUE_TO_SIZE", "M", "08 DARK GRAY"},
                {"Áo khoác Ultra Light Down nhẹ tênh mà giữ ấm rất tốt", "Đi du lịch Đà Lạt mặc em này là chuẩn bài, gấp gọn vào túi nhỏ tiện lợi. Đóng gói hộp BEO sang xịn mịn.", "5", "TRUE_TO_SIZE", "XL", "69 NAVY"},
                {"Sơ mi Oxford chất vải dệt dày dặn, form đứng", "Áo lên dáng rất sang và lịch sự, giặt không bị xù lông hay mất form cổ áo. Rất đáng đồng tiền bát gạo!", "5", "TRUE_TO_SIZE", "L", "00 WHITE"},
                {"Túi Half Moon nhỏ gọn đựng được cả thế giới", "Túi nhẹ, khóa kéo mượt mà, vải chống nước nhẹ. Đi chơi hay đi làm mang theo rất tiện.", "5", "TRUE_TO_SIZE", "FREE", "32 BEIGE"},
                {"Đầm Rayon mặc nhẹ và bay dáng, che khuyết điểm bụng tốt", "Chất vải mềm mịn lướt trên da, mặc đi dạo phố hay dự tiệc nhẹ đều xinh xắn thanh lịch.", "5", "TRUE_TO_SIZE", "S", "09 BLACK"},
                {"Mũ Bucket UV Protection che nắng rất hiệu quả", "Vành mũ rộng vừa phải, có dây rút chỉnh vòng đầu tiện lợi. Gấp gọn bỏ balo thoải mái không bị gãy vành.", "4", "TRUE_TO_SIZE", "M", "32 BEIGE"},
                {"Áo Polo Dry Pique thấm hút mồ hôi xuất sắc", "Chất vải dệt pique tổ ong thoáng khí, cổ áo dệt kim chỉn chu không bị quăn mép sau nhiều lần giặt.", "5", "TRUE_TO_SIZE", "L", "68 BLUE"},
                {"Quần Shorts Chino co giãn năng động", "Màu sắc nhã nhặn, form trên gối trẻ trung hiện đại. Mặc đi cafe cuối tuần rất hợp.", "5", "TRUE_TO_SIZE", "M", "31 BEIGE"},
                {"Giao hàng Cần Thơ siêu nhanh trong ngày", "Đặt buổi sáng trưa đã nhận được hàng tại Ninh Kiều. Nhân viên đóng gói cẩn thận, sản phẩm chuẩn như mô tả.", "5", "TRUE_TO_SIZE", "L", "00 WHITE"},
                {"Áo Len Merino dệt mịn màng không bị ngứa da", "Chất len tự nhiên mềm mại, mặc giữ ấm nhẹ nhàng rất dễ chịu trong phòng máy lạnh.", "5", "TRUE_TO_SIZE", "M", "03 GRAY"},
                {"Blazer Không Cấu Trúc phong cách Smart Casual", "Áo không đệm vai nên mặc rất tự nhiên và thoải mái, dễ phối cùng áo thun hoặc sơ mi.", "5", "TRUE_TO_SIZE", "L", "09 BLACK"}
        };

        for (int i = 0; i < reviewsData.length && i < products.size(); i++) {
            Product product = products.get(i);
            User user = customers.get(i % customers.size());
            String[] r = reviewsData[i];

            reviewRepository.save(Review.builder()
                    .product(product)
                    .user(user)
                    .rating(Integer.parseInt(r[2]))
                    .title(r[0])
                    .comment(r[1])
                    .fitRating(r[3])
                    .purchasedSize(r[4])
                    .purchasedColor(r[5])
                    .verifiedPurchase(true)
                    .approved(true)
                    .build());
        }
    }

    private static class OrderBlueprint {
        int daysAgo;
        int hour;
        int minute;
        OrderStatus status;
        OrderType orderType;
        PaymentMethod paymentMethod;
        PaymentStatus paymentStatus;

        OrderBlueprint(int daysAgo, int hour, int minute, OrderStatus status, OrderType orderType, PaymentMethod paymentMethod, PaymentStatus paymentStatus) {
            this.daysAgo = daysAgo;
            this.hour = hour;
            this.minute = minute;
            this.status = status;
            this.orderType = orderType;
            this.paymentMethod = paymentMethod;
            this.paymentStatus = paymentStatus;
        }
    }
}
