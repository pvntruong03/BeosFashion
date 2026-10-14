package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.AuthRequest;
import com.beofashion.dto.AuthResponse;
import com.beofashion.dto.RegisterRequest;
import com.beofashion.security.UserPrincipal;
import com.beofashion.service.AuthService;
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
    private final com.beofashion.service.PasswordResetService passwordResetService;

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

    @PostMapping("/forgot-password")
    @Operation(summary = "Create a one-time password reset challenge")
    public ResponseEntity<ApiResponse<com.beofashion.dto.PasswordResetChallenge>> forgotPassword(
            @Valid @RequestBody com.beofashion.dto.ForgotPasswordRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(passwordResetService.createChallenge(request.email())));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with a valid one-time token")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody com.beofashion.dto.ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công", null));
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
            @Valid @RequestBody com.beofashion.dto.ProfileUpdateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Please log in to continue"));
        }
        AuthResponse.UserProfileDto updated = authService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody com.beofashion.dto.ChangePasswordRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Please log in to continue"));
        }
        authService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
