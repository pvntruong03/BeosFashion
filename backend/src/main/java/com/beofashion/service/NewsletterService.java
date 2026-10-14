package com.beofashion.service;

import com.beofashion.dto.NewsletterRequest;
import com.beofashion.dto.NewsletterResponse;
import com.beofashion.entity.NewsletterSubscriber;
import com.beofashion.repository.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NewsletterService {
    private static final String WELCOME_COUPON = "BEO10";
    private final NewsletterSubscriberRepository repository;

    @Transactional
    public NewsletterResponse subscribe(NewsletterRequest request) {
        String email = request.email().trim().toLowerCase();
        NewsletterSubscriber existing = repository.findByEmailIgnoreCase(email).orElse(null);
        if (existing != null) {
            existing.setActive(true);
            repository.save(existing);
            return new NewsletterResponse(email, existing.getCouponCode(), true);
        }

        NewsletterSubscriber subscriber = repository.save(NewsletterSubscriber.builder()
                .email(email)
                .source(request.source() == null || request.source().isBlank() ? "website-footer" : request.source())
                .couponCode(WELCOME_COUPON)
                .build());
        return new NewsletterResponse(subscriber.getEmail(), subscriber.getCouponCode(), false);
    }
}
