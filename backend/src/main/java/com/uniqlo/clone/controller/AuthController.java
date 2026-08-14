package com.uniqlo.clone.controller;

import com.uniqlo.clone.dto.ApiResponse;
import com.uniqlo.clone.dto.AuthRequest;
import com.uniqlo.clone.dto.AuthResponse;
import com.uniqlo.clone.dto.RegisterRequest;
import com.uniqlo.clone.security.UserPrincipal;
import com.uniqlo.clone.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Single Login and Registration for Customer, Staff and Admin")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Single Login endpoint for all user roles (Customer, Staff, Admin)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new customer account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile and roles")
    public ResponseEntity<ApiResponse<AuthResponse.UserProfileDto>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        AuthResponse.UserProfileDto profile = authService.getCurrentUserProfile(principal);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}
