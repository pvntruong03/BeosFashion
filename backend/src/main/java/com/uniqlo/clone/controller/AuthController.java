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

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile information")
    public ResponseEntity<ApiResponse<AuthResponse.UserProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody com.uniqlo.clone.dto.ProfileUpdateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập"));
        }
        AuthResponse.UserProfileDto updated = authService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin thành công", updated));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody com.uniqlo.clone.dto.ChangePasswordRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập"));
        }
        authService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }
}
