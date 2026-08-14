package com.uniqlo.clone.controller;

import com.uniqlo.clone.dto.*;
import com.uniqlo.clone.entity.Coupon;
import com.uniqlo.clone.entity.Role;
import com.uniqlo.clone.entity.User;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.UserRepository;
import com.uniqlo.clone.service.AdminService;
import com.uniqlo.clone.service.CouponService;
import com.uniqlo.clone.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin CMS", description = "System-wide administration, catalog, analytics, and user management")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF_MANAGER')")
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;
    private final CouponService couponService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get overall business analytics, revenue KPIs, and charts")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboardStats()));
    }

    @PostMapping("/products")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF_MANAGER')")
    @Operation(summary = "Create a new product with variants")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductDto dto) {
        ProductDto created = adminService.createProduct(dto);
        return ResponseEntity.ok(ApiResponse.ok("Product created successfully", created));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF_MANAGER')")
    @Operation(summary = "Update product details")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        ProductDto updated = adminService.updateProduct(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF_MANAGER')")
    @Operation(summary = "Soft delete / toggle active product")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product status updated successfully", null));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all system orders with pagination")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OrderDto> orders = orderService.getAllOrders(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @PutMapping("/orders/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin update order status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderDto updated = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Order updated successfully", updated));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all registered users and staff")
    public ResponseEntity<ApiResponse<List<AuthResponse.UserProfileDto>>> getAllUsers() {
        List<AuthResponse.UserProfileDto> users = userRepository.findAll().stream()
                .map(u -> AuthResponse.UserProfileDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .phone(u.getPhone())
                        .address(u.getAddress())
                        .city(u.getCity())
                        .role(u.getRole())
                        .avatar(u.getAvatar())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Change user role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        String roleStr = body.get("role");
        user.setRole(Role.valueOf(roleStr));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User role updated to " + roleStr, null));
    }

    @GetMapping("/coupons")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "List all coupons")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.ok(couponService.getAllCoupons()));
    }

    @PostMapping("/coupons")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create a new coupon code")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.ok("Coupon created", couponService.createCoupon(coupon)));
    }
}
