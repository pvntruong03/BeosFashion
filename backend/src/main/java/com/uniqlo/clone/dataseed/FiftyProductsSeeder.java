package com.uniqlo.clone.dataseed;

import com.uniqlo.clone.entity.*;
import com.uniqlo.clone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class FiftyProductsSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Permanently deactivate all KIDS products and categories (Strict user business rule)
        List<Product> kidsProducts = productRepository.findAll().stream()
                .filter(p -> p.getGender() == Gender.KIDS || (p.getCategory() != null && p.getCategory().getGender() == Gender.KIDS))
                .toList();

        for (Product kp : kidsProducts) {
            log.info("Deactivating legacy Kids product from catalog: {}", kp.getName());
            kp.setActive(false);
            productRepository.save(kp);
        }

        categoryRepository.findBySlug("kids-tops").ifPresent(cat -> { cat.setActive(false); categoryRepository.save(cat); });
        categoryRepository.findBySlug("kids-bottoms").ifPresent(cat -> { cat.setActive(false); categoryRepository.save(cat); });
        categoryRepository.findBySlug("kids").ifPresent(cat -> { cat.setActive(false); categoryRepository.save(cat); });

        long activeCount = productRepository.findByActiveTrue().size();
        if (activeCount >= 70) {
            log.info("Catalog already contains {} active adult products (>= 70). FiftyProductsSeeder completed.", activeCount);
            return;
        }

        log.info("Seeding adult high-fashion products to reach full catalog size (current count: {})...", productRepository.count());

        Optional<Store> optionalStore = storeRepository.findByCode("STR-BEO-01");
        Store store = optionalStore.orElseGet(() -> {
            List<Store> all = storeRepository.findAll();
            return all.isEmpty() ? null : all.get(0);
        });

        if (store == null) {
            log.warn("No store found to allocate inventory for new products. Skipping seeder.");
            return;
        }

        // Fetch adult categories safely
        Category catMenTops = categoryRepository.findBySlug("men-tops").orElse(null);
        Category catMenBottoms = categoryRepository.findBySlug("men-bottoms").orElse(null);
        Category catMenOuterwear = categoryRepository.findBySlug("men-outerwear").orElse(null);
        Category catMenInnerwear = categoryRepository.findBySlug("men-innerwear").orElse(null);
        Category catWomenTops = categoryRepository.findBySlug("women-tops").orElse(null);
        Category catWomenBottoms = categoryRepository.findBySlug("women-bottoms").orElse(null);
        Category catWomenDresses = categoryRepository.findBySlug("women-dresses").orElse(null);
        Category catWomenOuterwear = categoryRepository.findBySlug("women-outerwear").orElse(null);
        Category catWomenInnerwear = categoryRepository.findBySlug("women-innerwear").orElse(null);
        Category catAccessories = categoryRepository.findBySlug("accessories").orElse(null);

        List<ProductSeedData> items = buildFiftyProductsList(
                catMenTops, catMenBottoms, catMenOuterwear, catMenInnerwear,
                catWomenTops, catWomenBottoms, catWomenDresses, catWomenOuterwear, catWomenInnerwear,
                catAccessories
        );

        int countAdded = 0;
        for (ProductSeedData data : items) {
            Optional<Product> optProd = productRepository.findByCode(data.code);
            if (optProd.isPresent()) {
                Product p = optProd.get();
                p.setName(data.name);
                p.setSlug(data.slug);
                p.setDescription(data.description);
                p.setOverview(data.overview);
                p.setMaterial(data.material);
                p.setCareInstruction(data.careInstruction);
                p.setCategory(data.category);
                p.setGender(data.gender);
                p.setCollection(data.collection);
                p.setPrimaryImageUrl(data.primaryImage);
                p.setBasePrice(data.basePrice);
                p.setSalePrice(data.salePrice);
                p.setActive(true);
                productRepository.save(p);

                // Update product variants with clean adult images
                List<ProductVariant> variants = variantRepository.findByProductId(p.getId());
                if (!data.variants.isEmpty()) {
                    for (int i = 0; i < variants.size(); i++) {
                        ProductVariant pv = variants.get(i);
                        ColorVariantData cvd = data.variants.get(i % data.variants.size());
                        pv.setImageUrl(cvd.imageUrl);
                        pv.setColorName(cvd.colorName);
                        pv.setColorHex(cvd.colorHex);
                        pv.setActive(true);
                        variantRepository.save(pv);
                    }
                }

                // Refresh product images
                List<ProductImage> oldImages = imageRepository.findByProductId(p.getId());
                if (!oldImages.isEmpty()) {
                    imageRepository.deleteAll(oldImages);
                }
                for (ColorVariantData cvd : data.variants) {
                    imageRepository.save(ProductImage.builder()
                            .product(p)
                            .imageUrl(cvd.imageUrl)
                            .colorName(cvd.colorName)
                            .altText(data.name + " - " + cvd.colorName)
                            .displayOrder(0)
                            .isModelShot(false)
                            .build());
                }
                continue;
            }

            Product product = productRepository.save(Product.builder()
                    .name(data.name)
                    .code(data.code)
                    .slug(data.slug)
                    .description(data.description)
                    .overview(data.overview)
                    .material(data.material)
                    .careInstruction(data.careInstruction)
                    .basePrice(data.basePrice)
                    .salePrice(data.salePrice)
                    .category(data.category)
                    .gender(data.gender)
                    .collection(data.collection)
                    .featured(data.featured)
                    .isNew(data.isNew)
                    .bestSeller(data.bestSeller)
                    .limitedOffer(data.limitedOffer)
                    .primaryImageUrl(data.primaryImage)
                    .averageRating(4.8 + (countAdded % 3) * 0.1)
                    .reviewCount(12 + (countAdded * 3) % 40)
                    .active(true)
                    .build());

            int seedIndex = 1;
            for (ColorVariantData cvd : data.variants) {
                for (String size : cvd.sizes) {
                    String sku = data.code + "-" + cvd.colorName.substring(0, Math.min(2, cvd.colorName.length())) + "-" + size;
                    String barcode = "45500" + data.code.replaceAll("[^0-9]", "") + (100 + seedIndex++);

                    ProductVariant variant = variantRepository.save(ProductVariant.builder()
                            .product(product)
                            .sku(sku)
                            .colorName(cvd.colorName)
                            .colorHex(cvd.colorHex)
                            .size(size)
                            .priceAdjustment(BigDecimal.ZERO)
                            .imageUrl(cvd.imageUrl)
                            .barcode(barcode)
                            .totalStock(100)
                            .active(true)
                            .build());

                    inventoryRepository.save(Inventory.builder()
                            .store(store)
                            .productVariant(variant)
                            .quantity(80)
                            .reservedQuantity(0)
                            .lowStockThreshold(5)
                            .build());
                }

                imageRepository.save(ProductImage.builder()
                        .product(product)
                        .imageUrl(cvd.imageUrl)
                        .colorName(cvd.colorName)
                        .altText(data.name + " - " + cvd.colorName)
                        .displayOrder(0)
                        .isModelShot(false)
                        .build());
            }

            countAdded++;
        }

        log.info("FiftyProductsSeeder successfully seeded {} new products. Total catalog size: {}", countAdded, productRepository.count());
    }

    private List<ProductSeedData> buildFiftyProductsList(
            Category catMenTops, Category catMenBottoms, Category catMenOuterwear, Category catMenInnerwear,
            Category catWomenTops, Category catWomenBottoms, Category catWomenDresses, Category catWomenOuterwear, Category catWomenInnerwear,
            Category catAccessories
    ) {
        List<ProductSeedData> list = new ArrayList<>();

        // 1-8: MEN TOPS
        list.add(new ProductSeedData(
                "Extra Fine Merino Wool Crew Neck Sweater", "UQ-500001", "extra-fine-merino-wool-crew-neck-sweater",
                "100% ultra-fine 19.5-micron Merino wool. Incredibly soft, lightweight, and machine-washable with anti-pilling treatment.",
                "100% Premium Merino Wool\nMachine washable on wool cycle\nGlossy smooth texture for refined elegance",
                "100% Merino Wool", "Machine wash cold wool cycle",
                new BigDecimal("799000"), new BigDecimal("699000"), catMenTops, Gender.MEN, "Extra Fine Merino",
                true, true, true, false,
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("32 BEIGE", "#D2B48C", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Dry-EX UV Protection Full-Zip Active Hoodie", "UQ-500002", "dry-ex-uv-protection-full-zip-hoodie",
                "Engineered for athletic performance and daily urban commute. Quick-drying Dry-EX fabric with UPF50+ UV protection.",
                "UPF50+ UV Protection\nErgonomic seam construction for freedom of movement",
                "100% Polyester (Dry-EX)", "Machine wash cold",
                new BigDecimal("599000"), null, catMenOuterwear, Gender.MEN, "Dry-EX",
                false, true, false, false,
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("03 GRAY", "#7F8C8D", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Oxford Slim-Fit Long Sleeve Casual Shirt", "UQ-500003", "oxford-slim-fit-long-sleeve-shirt",
                "Classic 100% combed cotton Oxford cloth. Pre-washed for a soft vintage feel that pairs with suits or chinos.",
                "Thick, durable 100% Oxford cotton\nButton-down collar maintains clean shape",
                "100% Cotton", "Machine wash warm, easy iron",
                new BigDecimal("699000"), new BigDecimal("599000"), catMenTops, Gender.MEN, "LifeWear Essentials",
                true, false, true, true,
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("62 BLUE", "#5DADE2", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Premium French Linen Stand Collar Shirt", "UQ-500004", "premium-french-linen-stand-collar-shirt",
                "Woven from 100% certified European flax linen. Breathable, lightweight, and gains character with every wash.",
                "100% High-grade European Linen\nModern band/mandarin collar for relaxed silhouette",
                "100% Linen", "Machine wash cold, air dry",
                new BigDecimal("899000"), null, catMenTops, Gender.MEN, "Premium Linen",
                true, true, false, false,
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("01 OFF WHITE", "#FDFEFE", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Supima Cotton Classic V-Neck T-Shirt", "UQ-500005", "supima-cotton-classic-v-neck-tshirt",
                "Made with 100% extra-long staple Supima cotton. Unmatched silky softness, brilliant color retention, and durability.",
                "100% Supima Cotton\nSilky smooth finish with refined V-neckline",
                "100% Supima Cotton", "Machine wash cold",
                new BigDecimal("349000"), new BigDecimal("299000"), catMenTops, Gender.MEN, "Supima Cotton",
                false, false, true, true,
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Heavyweight Flannel Checked Overshirt", "UQ-500006", "heavyweight-flannel-checked-overshirt",
                "Double-brushed cotton flannel for superior warmth and cozy softness. Relaxed overshirt fit ideal for layering.",
                "Double-brushed 100% heavyweight cotton\nClassic buffalo check pattern",
                "100% Cotton", "Machine wash gentle",
                new BigDecimal("799000"), null, catMenTops, Gender.MEN, "Flannel Collection",
                false, true, false, false,
                "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("18 WINE", "#78281F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "AIRism Pique Short Sleeve Polo Shirt", "UQ-500007", "airism-pique-short-sleeve-polo-shirt",
                "Classic polo collar tailored with AIRism tech fibers. Quick-drying and cool to the touch with clean business profile.",
                "Smooth AIRism interior with textured pique exterior\nClean button placket",
                "51% Cotton, 49% Polyester", "Machine wash cold",
                new BigDecimal("499000"), new BigDecimal("399000"), catMenTops, Gender.MEN, "AIRism",
                true, false, true, true,
                "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Washed Cotton Denim Work Shirt", "UQ-500008", "washed-cotton-denim-work-shirt",
                "Authentic indigo-dyed 6.5oz denim with subtle fading. Triple-needle stitching on shoulders and twin chest pockets.",
                "100% Pure Indigo Cotton Denim\nReinforced utility chest pockets",
                "100% Cotton", "Machine wash cold inside out",
                new BigDecimal("799000"), null, catMenTops, Gender.MEN, "Denim Atelier",
                false, true, false, false,
                "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("65 BLUE", "#2980B9", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("68 DARK BLUE", "#1B4F72", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80")
                )
        ));

        // 9-15: MEN BOTTOMS
        list.add(new ProductSeedData(
                "Ultra Stretch Slim Fit Chino Pants", "UQ-500009", "ultra-stretch-slim-fit-chino-pants",
                "High-recovery ultra-stretch fabric offers extraordinary comfort while holding its sleek tailored shape all day.",
                "Over 40% stretch rate with superior shape retention\nTapered slim fit for clean leg lines",
                "96% Cotton, 4% Spandex", "Machine wash warm, tumble dry low",
                new BigDecimal("799000"), new BigDecimal("699000"), catMenBottoms, Gender.MEN, "Ultra Stretch",
                true, true, true, false,
                "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("32 BEIGE", "#D2B48C", List.of("29", "30", "31", "32", "34"), "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("29", "30", "31", "32", "34"), "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Regular Fit Selvedge Japanese Denim Jeans", "UQ-500010", "regular-fit-selvedge-japanese-denim-jeans",
                "Crafted on traditional vintage shuttle looms using authentic red-line selvedge denim. Develops custom patina with wear.",
                "13.5oz Authentic Red-Line Selvedge Denim\nClassic straight leg regular rise",
                "99% Cotton, 1% Spandex", "Wash inside out cold",
                new BigDecimal("1199000"), new BigDecimal("999000"), catMenBottoms, Gender.MEN, "Selvedge Denim",
                true, false, true, true,
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("30", "31", "32", "34"), "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Geared Easy Cargo Utility Shorts", "UQ-500011", "geared-easy-cargo-utility-shorts",
                "Water-repellent nylon ripstop fabric with an integrated webbing belt and 6 functional utility pockets.",
                "Durable water-repellent (DWR) finish\nBuilt-in adjustable web belt",
                "100% Nylon Ripstop", "Machine wash cold",
                new BigDecimal("499000"), null, catMenBottoms, Gender.MEN, "Utility Gear",
                false, true, false, false,
                "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("57 OLIVE", "#556B2F", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "AIRism Ultra Stretch Active Joggers", "UQ-500012", "airism-ultra-stretch-active-joggers",
                "Silky cool AIRism jersey with 360-degree all-way stretch and cuffed hems for effortless streetwear styling.",
                "Smooth moisture-wicking AIRism\nConcealed zippered security pocket",
                "77% Polyester, 23% Spandex", "Machine wash cold",
                new BigDecimal("699000"), new BigDecimal("599000"), catMenBottoms, Gender.MEN, "AIRism",
                true, false, true, true,
                "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("03 GRAY", "#7F8C8D", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Vintage Regular Fit Pleated Chino Pants", "UQ-500013", "vintage-regular-fit-pleated-chino-pants",
                "Inspired by classic workwear tailoring with front pleats and dense high-count cotton twill.",
                "100% Heavy Combed Cotton Twill\nSingle front pleats with roomy thigh profile",
                "100% Cotton", "Machine wash warm",
                new BigDecimal("899000"), null, catMenBottoms, Gender.MEN, "Vintage Chino",
                false, true, false, false,
                "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("30", "31", "32", "34"), "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Miracle Air Lightweight Tailored Trousers", "UQ-500014", "miracle-air-lightweight-tailored-trousers",
                "Weighs less than standard suit pants with remarkable breathability, quick-drying performance, and stretch.",
                "Ultra-lightweight miracle fiber\nWrinkle-free wash-and-wear design",
                "100% Polyester", "Machine wash gentle",
                new BigDecimal("899000"), new BigDecimal("799000"), catMenBottoms, Gender.MEN, "Miracle Air",
                true, false, true, false,
                "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("76", "79", "82", "85"), "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("08 DARK GRAY", "#34495E", List.of("76", "79", "82", "85"), "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Linen Cotton Blend Relaxed Drawstring Pants", "UQ-500015", "linen-cotton-blend-relaxed-drawstring-pants",
                "Natural cooling linen meets soft breathable cotton with an elasticated drawstring waistband for summer ease.",
                "55% French Linen, 45% Cotton\nRelaxed straight taper fit",
                "55% Linen, 45% Cotton", "Machine wash cold",
                new BigDecimal("699000"), null, catMenBottoms, Gender.MEN, "Linen Blend",
                false, true, false, false,
                "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("01 OFF WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("57 OLIVE", "#556B2F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80")
                )
        ));

        // 16-21: MEN OUTERWEAR & INNERWEAR
        list.add(new ProductSeedData(
                "Seamless Down 3D Cut Winter Parka", "UQ-500016", "seamless-down-3d-cut-winter-parka",
                "Stitch-free bonded seamless construction blocks freezing winds and precipitation. Superior 750+ fill down warmth.",
                "Seamless stitchless baffle technology\nWindproof and water-resistant shell",
                "Shell: 100% Polyester; Filling: 90% Down, 10% Feathers", "Hand wash cold",
                new BigDecimal("2499000"), new BigDecimal("2199000"), catMenOuterwear, Gender.MEN, "Seamless Down",
                true, true, true, true,
                "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("57 OLIVE", "#556B2F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Windproof Fleece Full-Zip Stand Collar Jacket", "UQ-500017", "windproof-fleece-full-zip-stand-jacket",
                "An ultra-thin windproof membrane sandwiched inside plush fluffy fleece blocks cold breezes while maintaining breathability.",
                "Windproof middle layer membrane\nSoft, plush fleece lining",
                "100% Polyester", "Machine wash cold gentle",
                new BigDecimal("899000"), new BigDecimal("799000"), catMenOuterwear, Gender.MEN, "Fleece Atelier",
                false, false, true, false,
                "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Single-Breasted Smart Tailored Trench Coat", "UQ-500018", "single-breasted-smart-tailored-trench-coat",
                "Minimalist architectural silhouette with clean hidden button placket and water-repellent gabardine twill.",
                "Water-repellent cotton blend gabardine\nRemovable storm flap collar",
                "65% Cotton, 35% Polyester", "Dry clean only",
                new BigDecimal("1899000"), new BigDecimal("1699000"), catMenOuterwear, Gender.MEN, "LifeWear Atelier",
                true, true, false, false,
                "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("32 BEIGE", "#D2B48C", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "AIRism Micro Mesh V-Neck Undershirt (2-Pack)", "UQ-500019", "airism-micro-mesh-v-neck-undershirt-2pack",
                "Highest breathability in the AIRism lineup. Seamless neck and sleeve hems stay undetectable beneath dress shirts.",
                "3x more breathable micro-mesh knit\nSeamless bonded edges",
                "86% Polyester, 14% Spandex", "Machine wash cold",
                new BigDecimal("399000"), null, catMenInnerwear, Gender.MEN, "AIRism Mesh",
                false, false, true, false,
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Ultra Light Down Compact Quilted Vest", "UQ-500020", "ultra-light-down-compact-quilted-vest",
                "Converts into a V-neck to hide under suit coats. Packs down into its compact pouch for effortless on-the-go insulation.",
                "Convertible collar snaps into V-neck\nPremium 750+ fill power down",
                "Shell: 100% Nylon; Filling: 90% Down, 10% Feathers", "Hand wash cold",
                new BigDecimal("999000"), new BigDecimal("849000"), catMenOuterwear, Gender.MEN, "Ultra Light Down",
                true, false, true, true,
                "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Hybrid Down Thermal Waterproof Parka", "UQ-500021", "hybrid-down-thermal-waterproof-parka",
                "Strategic hybrid design combines natural down insulation in the torso with high-tech moisture-absorbing padding in arms.",
                "Waterproof & windproof shell\nHybrid insulation mapping for mobility",
                "Shell: 100% Polyester; Torso: 90% Down; Arms: 100% Polyester", "Hand wash cold",
                new BigDecimal("2899000"), null, catMenOuterwear, Gender.MEN, "Hybrid Down",
                true, true, false, false,
                "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("57 OLIVE", "#556B2F", List.of("M", "L"), "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80")
                )
        ));

        // 22-29: WOMEN TOPS
        list.add(new ProductSeedData(
                "3D Knit 100% Cashmere Crew Neck Sweater", "UQ-500022", "3d-knit-100-cashmere-crew-neck-sweater",
                "Seamless 3D WHOLEGARMENT knit with 100% Mongolian cashmere. Conforms effortlessly to curves without friction.",
                "100% Pure Mongolian Cashmere\nSeamless 3D knit comfort",
                "100% Cashmere", "Dry clean or gentle hand wash",
                new BigDecimal("1999000"), new BigDecimal("1799000"), catWomenTops, Gender.WOMEN, "3D Knit",
                true, true, true, false,
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("01 OFF WHITE", "#FFFFFF", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("11 PINK", "#FADBD8", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Rayon Long Sleeve Georgette Relaxed Blouse", "UQ-500023", "rayon-long-sleeve-georgette-relaxed-blouse",
                "Silky crepe georgette texture with easy-care wrinkle resistance. Elegant drape that pairs with trousers or skirts.",
                "Wrinkle-resistant easy-care finish\nGraceful drape collar",
                "76% Rayon, 24% Polyester", "Machine wash cold gentle",
                new BigDecimal("699000"), new BigDecimal("599000"), catWomenTops, Gender.WOMEN, "Easy Care",
                false, false, true, true,
                "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Ribbed Boat Neck Half-Sleeve Stretch T-Shirt", "UQ-500024", "ribbed-boat-neck-half-sleeve-stretch-tshirt",
                "Flattering wide boat neckline balances shoulders. Fine 2x2 rib cotton with 5% spandex for flexible contouring.",
                "Feminine boat neckline\nFine 2x2 rib stretch fabric",
                "95% Cotton, 5% Spandex", "Machine wash cold",
                new BigDecimal("399000"), null, catWomenTops, Gender.WOMEN, "Ribbed Cotton",
                false, true, false, false,
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Premium Lambswool Relaxed V-Neck Cardigan", "UQ-500025", "premium-lambswool-relaxed-v-neck-cardigan",
                "Spun from 19.5-micron premium lambswool. Cozy, fluffy, and lightweight with natural horn-effect buttons.",
                "100% Premium Lambswool\nRelaxed drop-shoulder silhouette",
                "100% Wool", "Hand wash cold, dry flat",
                new BigDecimal("899000"), new BigDecimal("749000"), catWomenTops, Gender.WOMEN, "Lambswool",
                true, false, true, true,
                "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("34 BROWN", "#6E2C00", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("03 GRAY", "#7F8C8D", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "AIRism UV Protection Mesh Relaxed Hoodie", "UQ-500026", "airism-uv-protection-mesh-relaxed-hoodie",
                "UPF50+ blocks over 90% of harmful UV rays. Breathable mesh AIRism with thumbholes for back-of-hand sun protection.",
                "UPF50+ UV protection mesh\nConvenient packable design with thumbholes",
                "75% Polyester, 13% Spandex, 12% Cupro", "Machine wash cold",
                new BigDecimal("599000"), new BigDecimal("499000"), catWomenOuterwear, Gender.WOMEN, "AIRism UV",
                true, true, true, false,
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("00 WHITE", "#FFFFFF", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("61 BLUE", "#85C1E9", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Linen Blend Sleeveless Summer Tunic Top", "UQ-500027", "linen-blend-sleeveless-summer-tunic-top",
                "Airy linen-rayon blend creates an effortless summer silhouette with a gentle high-low hem and side slits.",
                "Breathable French linen & silky rayon blend\nFlattering tunic length with side vents",
                "53% Linen, 47% Rayon", "Machine wash cold",
                new BigDecimal("499000"), null, catWomenTops, Gender.WOMEN, "Linen Blend",
                false, true, false, false,
                "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("01 OFF WHITE", "#FFFFFF", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("57 OLIVE", "#556B2F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Drape Cowl Neck Silk Blend Camisole", "UQ-500028", "drape-cowl-neck-silk-blend-camisole",
                "Lustrous silk blend fabric with adjustable delicate spaghetti straps and flattering cowl draping.",
                "70% Silk, 30% Modal\nAdjustable shoulder straps",
                "70% Silk, 30% Modal", "Hand wash gentle cold",
                new BigDecimal("449000"), new BigDecimal("379000"), catWomenTops, Gender.WOMEN, "Silk Touch",
                false, false, true, true,
                "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Soft Souffle Yarn Mock-Neck Chunky Jumper", "UQ-500029", "soft-souffle-yarn-mock-neck-chunky-jumper",
                "Brushed soufflé yarn technology provides marshmallow cloud softness with zero scratchiness against skin.",
                "Non-itchy soufflé yarn knit\nChic mock-neck cozy profile",
                "60% Acrylic, 30% Nylon, 8% Wool, 2% Spandex", "Hand wash cold",
                new BigDecimal("799000"), new BigDecimal("699000"), catWomenTops, Gender.WOMEN, "Souffle Yarn",
                true, true, false, false,
                "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("01 OFF WHITE", "#FFFFFF", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("32 BEIGE", "#D2B48C", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80")
                )
        ));

        // 30-38: WOMEN BOTTOMS & DRESSES
        list.add(new ProductSeedData(
                "Pleated Wide-Leg Ankle Trousers (Tuck Wide)", "UQ-500030", "pleated-wide-leg-ankle-trousers-tuck-wide",
                "Viral Tokyo street-style wide-leg trousers. Double front pleats create a flattering leg-lengthening drape.",
                "2-way stretch easy-care fabric\nClean hidden elastic back waistband",
                "66% Polyester, 28% Rayon, 6% Spandex", "Machine wash gentle",
                new BigDecimal("899000"), new BigDecimal("799000"), catWomenBottoms, Gender.WOMEN, "Tuck Wide Pants",
                true, true, true, true,
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("32 BEIGE", "#D2B48C", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Ultra Stretch High-Rise Denim Leggings Pants", "UQ-500031", "ultra-stretch-high-rise-denim-leggings-pants",
                "Combines the authentic texture of denim with the 360-degree all-way stretch comfort of leggings.",
                "Ultra stretch recovery fabric\nFlattering high-rise waist",
                "53% Cotton, 32% Polyester, 15% Spandex", "Machine wash cold",
                new BigDecimal("599000"), null, catWomenBottoms, Gender.WOMEN, "Ultra Stretch",
                false, false, true, false,
                "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Satin Bias Cut Flared Maxi Skirt", "UQ-500032", "satin-bias-cut-flared-maxi-skirt",
                "Glossy liquid satin woven on the bias for fluid movement. Elastic waist lies smooth against the midsection.",
                "Bias cut delivers natural fluid drape\nSmooth satin with delicate sheen",
                "100% Polyester Satin", "Machine wash gentle",
                new BigDecimal("799000"), new BigDecimal("699000"), catWomenBottoms, Gender.WOMEN, "Satin Luxe",
                true, true, false, false,
                "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("30 NATURAL", "#F5EEF8", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Linen Blend Belted A-Line Midi Dress", "UQ-500033", "linen-blend-belted-a-line-midi-dress",
                "Effortless summer dress with matching tie belt. Flowing A-line skirt and functional side seam pockets.",
                "50% European Linen, 50% Rayon\nIncludes removable fabric belt",
                "50% Linen, 50% Rayon", "Machine wash cold",
                new BigDecimal("999000"), new BigDecimal("849000"), catWomenDresses, Gender.WOMEN, "Linen Blend",
                true, true, true, true,
                "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("57 OLIVE", "#556B2F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "3D Knit Seamless Cotton Flared Midi Skirt", "UQ-500034", "3d-knit-seamless-cotton-flared-midi-skirt",
                "3D WHOLEGARMENT knit without side seams. Gentle flare creates a flattering silhouette for work or weekend.",
                "100% Combed Cotton 3D Knit\nZero-seam construction",
                "100% Cotton", "Machine wash cold gentle",
                new BigDecimal("899000"), null, catWomenBottoms, Gender.WOMEN, "3D Knit",
                false, true, false, false,
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Denim Wide Straight Leg High-Waist Jeans", "UQ-500035", "denim-wide-straight-leg-high-waist-jeans",
                "100% authentic cotton Kaihara denim. High-rise waist with relaxed wide straight leg profile.",
                "100% Kaihara Japanese Cotton Denim\nClassic 5-pocket styling",
                "100% Cotton", "Machine wash cold inside out",
                new BigDecimal("999000"), new BigDecimal("899000"), catWomenBottoms, Gender.WOMEN, "Denim Atelier",
                true, false, true, false,
                "https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("65 BLUE", "#2980B9", List.of("24", "25", "26", "27", "28"), "https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("00 WHITE", "#FFFFFF", List.of("24", "25", "26", "27", "28"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Smart Brushed Flannel Ankle Pants", "UQ-500036", "smart-brushed-flannel-ankle-pants",
                "Soft brushed texture gives warmth with refined wool-like appearance. 2-way stretch for all-day comfort.",
                "Warm brushed flannel finish\nEasy care machine washable",
                "64% Polyester, 34% Rayon, 2% Spandex", "Machine wash gentle",
                new BigDecimal("799000"), null, catWomenBottoms, Gender.WOMEN, "Smart Ankle",
                false, false, true, false,
                "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("08 DARK GRAY", "#34495E", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("32 BEIGE", "#D2B48C", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Rayon Printed Floral Wrap Midi Dress", "UQ-500037", "rayon-printed-floral-wrap-midi-dress",
                "Delicate micro-floral print on smooth rayon crepe. V-neckline with flattering self-tie waist wrap.",
                "Smooth lightweight rayon drape\nFlattering wrap waistline",
                "100% Rayon", "Machine wash cold gentle",
                new BigDecimal("899000"), new BigDecimal("749000"), catWomenDresses, Gender.WOMEN, "Floral Collection",
                true, true, false, true,
                "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "3D Knit Seamless Cotton Cocoon Midi Dress", "UQ-500038", "3d-knit-seamless-cotton-cocoon-midi-dress",
                "Voluminous cocoon silhouette knitted seamlessly in one piece. Breathable pure cotton for year-round styling.",
                "Seamless 3D knit cocoon silhouette\n100% Combed Cotton",
                "100% Cotton", "Machine wash cold",
                new BigDecimal("1199000"), new BigDecimal("999000"), catWomenDresses, Gender.WOMEN, "3D Knit",
                true, false, true, false,
                "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80")
                )
        ));

        // 39-43: WOMEN OUTERWEAR & INNERWEAR
        list.add(new ProductSeedData(
                "Double-Faced Wool Blend Short Tailored Coat", "UQ-500039", "double-faced-wool-blend-short-tailored-coat",
                "Handcrafted double-faced wool construction provides lightweight warmth without bulky lining.",
                "Premium double-faced wool blend\nElegant lapel collar with horn buttons",
                "70% Wool, 30% Nylon", "Dry clean only",
                new BigDecimal("2199000"), new BigDecimal("1899000"), catWomenOuterwear, Gender.WOMEN, "Wool Atelier",
                true, true, true, false,
                "https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("32 BEIGE", "#D2B48C", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1544022613-e87ce71c85b9?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Ultra Light Down Relaxed Collarless Jacket", "UQ-500040", "ultra-light-down-relaxed-collarless-jacket",
                "Clean collarless neckline easily layers under wool coats. Includes compact carrying pouch with water-repellent coating.",
                "Collarless silhouette for chic layering\n750+ fill power down",
                "Shell: 100% Nylon; Filling: 90% Down, 10% Feathers", "Hand wash cold",
                new BigDecimal("1399000"), new BigDecimal("1199000"), catWomenOuterwear, Gender.WOMEN, "Ultra Light Down",
                true, false, true, true,
                "https://images.unsplash.com/photo-1544022613-e87ce71c85b9?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("01 OFF WHITE", "#FFFFFF", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1544022613-e87ce71c85b9?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Fluffy Yarn Fleece Full-Zip Warm Jacket", "UQ-500041", "fluffy-yarn-fleece-full-zip-warm-jacket",
                "Long-pile fluffy fleece feels as soft as cloud. High stand collar warms the neck with zippered side pockets.",
                "Ultra-soft long-pile fluffy fleece\nHigh stand collar warmth",
                "100% Polyester", "Machine wash cold gentle",
                new BigDecimal("699000"), new BigDecimal("599000"), catWomenOuterwear, Gender.WOMEN, "Fluffy Fleece",
                false, true, true, true,
                "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("30 NATURAL", "#F5EEF8", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("11 PINK", "#FADBD8", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "AIRism Wireless Bra (Plunge Seamless)", "UQ-500042", "airism-wireless-bra-plunge-seamless",
                "Deep V-neckline stays hidden under lower-cut tops. Ultra-fine AIRism jersey with bonded edges.",
                "Deep plunge neckline design\nWire-free soft support",
                "85% Polyester, 15% Spandex", "Hand wash recommended",
                new BigDecimal("499000"), new BigDecimal("399000"), catWomenInnerwear, Gender.WOMEN, "Wireless Bra",
                false, false, true, true,
                "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#F5CBA7", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "HEATTECH Ultra Warm Scoop Neck Thermal Top", "UQ-500043", "heattech-ultra-warm-scoop-neck-thermal-top",
                "2.25x warmer than standard HEATTECH. Heavyweight brushed interior provides maximum defense against extreme cold.",
                "2.25x warmer Ultra Warm technology\nWide scoop neck stays invisible under outerwear",
                "49% Polyester, 34% Acrylic, 15% Rayon, 2% Spandex", "Machine wash warm",
                new BigDecimal("599000"), null, catWomenInnerwear, Gender.WOMEN, "HEATTECH Ultra Warm",
                true, false, true, false,
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("01 OFF WHITE", "#FFFFFF", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80")
                )
        ));

        // 44-47: ADULT LIFEWEAR & LUXURY ATELIER
        list.add(new ProductSeedData(
                "French Terry Relaxed Crew Neck Sweatshirt", "UQ-500044", "french-terry-relaxed-crew-neck-sweatshirt",
                "High-density 100% loopback French terry cotton. Ultra-durable, breathable, and pre-shrunk for effortless relaxed layering.",
                "100% Loopback French Terry Cotton\nRibbed cuffs and hem maintain shape",
                "100% Cotton", "Machine wash cold",
                new BigDecimal("599000"), new BigDecimal("499000"), catMenTops, Gender.MEN, "Sweat Collection",
                false, true, true, false,
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("03 GRAY", "#7F8C8D", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L", "XL"), "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Pleated Chiffon Elegant Maxi Dress", "UQ-500045", "pleated-chiffon-elegant-maxi-dress",
                "Flowing pleated chiffon fabric with subtle micro-pleats from bodice to hem. Delicate flutter sleeves and lined interior.",
                "Micro-pleated airy chiffon fabric\nFully lined for opacity and comfort",
                "100% Polyester Chiffon", "Hand wash cold gentle",
                new BigDecimal("1199000"), new BigDecimal("999000"), catWomenDresses, Gender.WOMEN, "Chiffon Luxe",
                true, true, false, false,
                "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("69 NAVY", "#1A252F", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Italian Full-Grain Leather Minimalist Belt", "UQ-500046", "italian-full-grain-leather-minimalist-belt",
                "Handcrafted from genuine vegetable-tanned Italian bridle leather. Brushed matte nickel buckle with beveled edges.",
                "100% Genuine Italian Full-Grain Leather\nMatte brushed nickel buckle",
                "100% Genuine Leather", "Wipe clean with leather conditioner",
                new BigDecimal("499000"), new BigDecimal("399000"), catAccessories, Gender.UNISEX, "Leather Goods",
                false, false, true, true,
                "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("38 DARK BROWN", "#512E5F", List.of("M", "L", "XL"), "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "AIRism Seamless High-Waist Briefs (2-Pack)", "UQ-500047", "airism-seamless-high-waist-briefs-2pack",
                "Ultra-smooth bonded laser-cut edges remain completely invisible under form-fitting trousers and dresses.",
                "Silky cool AIRism with zero visible panty lines\nCotton gusset lining",
                "85% Polyester, 15% Spandex", "Machine wash with mesh laundry bag",
                new BigDecimal("299000"), null, catWomenInnerwear, Gender.WOMEN, "AIRism Seamless",
                false, true, false, false,
                "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("31 BEIGE", "#F5CBA7", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("09 BLACK", "#111111", List.of("S", "M", "L"), "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80")
                )
        ));

        // 48-50: ACCESSORIES & LIFESTYLE
        list.add(new ProductSeedData(
                "Round Mini Dumpling Nylon Shoulder Bag", "UQ-500048", "round-mini-dumpling-nylon-shoulder-bag",
                "The world-famous viral dumpling crescent bag. Deceptively spacious, water-repellent, with an ergonomic contoured body.",
                "Water-repellent nylon shell\nExpands to hold water bottle, wallet, phone, and keys",
                "Shell: 100% Nylon; Lining: 100% Polyester", "Wipe clean with damp cloth",
                new BigDecimal("349000"), new BigDecimal("299000"), catAccessories, Gender.UNISEX, "BEO Iconic Bag",
                true, true, true, true,
                "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("FREE"), "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("30 NATURAL", "#F5EEF8", List.of("FREE"), "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("57 OLIVE", "#556B2F", List.of("FREE"), "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "Cashmere Knitted Winter Scarf & Beanie", "UQ-500049", "cashmere-knitted-winter-scarf-beanie",
                "100% pure cashmere knitted set. Luxurious cloud-like softness and timeless ribbed edges.",
                "100% Mongolian Cashmere\n2-piece scarf and beanie set",
                "100% Cashmere", "Dry clean only",
                new BigDecimal("999000"), new BigDecimal("849000"), catAccessories, Gender.UNISEX, "100% Cashmere",
                true, false, true, false,
                "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("03 GRAY", "#7F8C8D", List.of("FREE"), "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("FREE"), "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80")
                )
        ));

        list.add(new ProductSeedData(
                "UV Protection Packable Wide Brim Metro Hat", "UQ-500050", "uv-protection-packable-wide-brim-metro-hat",
                "UPF50+ sun hat engineered with lightweight quick-drying fabric and breathable mesh sweatband. Rolls up for travel.",
                "UPF50+ Sun protection\nFoldable packable shape for travel",
                "100% Cotton Canvas", "Hand wash cold",
                new BigDecimal("499000"), null, catAccessories, Gender.UNISEX, "UV Protection",
                false, true, false, false,
                "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80",
                List.of(
                        new ColorVariantData("09 BLACK", "#111111", List.of("M", "L"), "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80"),
                        new ColorVariantData("31 BEIGE", "#E5D3B3", List.of("M", "L"), "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80")
                )
        ));

        return list;
    }

    private static class ProductSeedData {
        String name;
        String code;
        String slug;
        String description;
        String overview;
        String material;
        String careInstruction;
        BigDecimal basePrice;
        BigDecimal salePrice;
        Category category;
        Gender gender;
        String collection;
        boolean featured;
        boolean isNew;
        boolean bestSeller;
        boolean limitedOffer;
        String primaryImage;
        List<ColorVariantData> variants;

        ProductSeedData(String name, String code, String slug, String description, String overview,
                        String material, String careInstruction, BigDecimal basePrice, BigDecimal salePrice,
                        Category category, Gender gender, String collection, boolean featured, boolean isNew,
                        boolean bestSeller, boolean limitedOffer, String primaryImage, List<ColorVariantData> variants) {
            this.name = name;
            this.code = code;
            this.slug = slug;
            this.description = description;
            this.overview = overview;
            this.material = material;
            this.careInstruction = careInstruction;
            this.basePrice = basePrice;
            this.salePrice = salePrice;
            this.category = category;
            this.gender = gender;
            this.collection = collection;
            this.featured = featured;
            this.isNew = isNew;
            this.bestSeller = bestSeller;
            this.limitedOffer = limitedOffer;
            this.primaryImage = primaryImage;
            this.variants = variants;
        }
    }

    private static class ColorVariantData {
        String colorName;
        String colorHex;
        List<String> sizes;
        String imageUrl;

        ColorVariantData(String colorName, String colorHex, List<String> sizes, String imageUrl) {
            this.colorName = colorName;
            this.colorHex = colorHex;
            this.sizes = sizes;
            this.imageUrl = imageUrl;
        }
    }
}
