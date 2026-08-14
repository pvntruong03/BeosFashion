package com.uniqlo.clone.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(length = 50)
    private String colorName; // Color this image corresponds to

    private String altText;

    @Builder.Default
    private Integer displayOrder = 0;

    @Builder.Default
    private boolean isModelShot = false; // Model wearing photo
}
