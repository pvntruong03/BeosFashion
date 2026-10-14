package com.beofashion.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscribers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsletterSubscriber {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Builder.Default
    private boolean active = true;

    @Column(length = 40)
    private String source;

    @Column(length = 30)
    private String couponCode;

    @CreationTimestamp
    private LocalDateTime subscribedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
