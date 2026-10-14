package com.beofashion.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 50)
    private String colorName; // e.g. "09 BLACK", "00 WHITE", "68 BLUE"

    @Column(nullable = false, length = 20)
    private String colorHex; // e.g. "#1a1a1a", "#ffffff", "#1e3a8a"

    @Column(nullable = false, length = 20)
    private String size; // e.g. "XS", "S", "M", "L", "XL", "XXL", "3XL"

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal priceAdjustment = BigDecimal.ZERO;

    private String imageUrl;

    @Column(unique = true, length = 50)
    private String barcode; // e.g. "4550001234567" for POS scanner

    @Builder.Default
    private Integer totalStock = 0;

    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Inventory> inventories = new ArrayList<>();

    @Builder.Default
    private boolean active = true;
}
