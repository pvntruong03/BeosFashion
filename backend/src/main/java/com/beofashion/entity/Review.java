package com.beofashion.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(length = 30)
    private String fitRating; // "TRUE_TO_SIZE", "RUNS_SMALL", "RUNS_LARGE"

    @Column(length = 50)
    private String purchasedSize;

    @Column(length = 50)
    private String purchasedColor;

    @Builder.Default
    private boolean verifiedPurchase = true;

    @Builder.Default
    private boolean approved = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
