package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.NewsletterRequest;
import com.beofashion.dto.NewsletterResponse;
import com.beofashion.service.NewsletterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor
public class NewsletterController {
    private final NewsletterService newsletterService;

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<NewsletterResponse>> subscribe(@Valid @RequestBody NewsletterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký bản tin thành công", newsletterService.subscribe(request)));
    }
}
