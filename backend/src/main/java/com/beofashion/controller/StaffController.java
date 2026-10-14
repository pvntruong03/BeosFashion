package com.beofashion.controller;

import com.beofashion.dto.*;
import com.beofashion.security.UserPrincipal;
import com.beofashion.service.OrderService;
import com.beofashion.service.StaffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@Tag(name = "Store Manager Portal", description = "Store operations, Order Fulfillment, Stock Transfers, and Branch Inventory")
@PreAuthorize("hasAnyAuthority('ROLE_STAFF_MANAGER', 'ROLE_ADMIN')")
public class StaffController {

    private final StaffService staffService;
    private final OrderService orderService;

    @GetMapping("/store-info")
    @Operation(summary = "Get current staff's assigned store info")
    public ResponseEntity<ApiResponse<StoreDto>> getStaffStore(@AuthenticationPrincipal UserPrincipal principal) {
        StoreDto store = staffService.getStaffStore(principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.ok(store));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get orders assigned to current staff's store (Fulfillment Queue)")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getStoreOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderDto> orders = staffService.getStoreOrders(principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update order status (Packing -> Shipping -> Delivered)")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderDto updated = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated to " + request.getStatus(), updated));
    }

    @GetMapping("/inventory")
    @Operation(summary = "Get current store inventory by product variants")
    public ResponseEntity<ApiResponse<List<ProductVariantDto>>> getStoreInventory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ProductVariantDto> inventory = staffService.getStoreInventory(principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.ok(inventory));
    }

    @PutMapping("/inventory/adjust")
    @Operation(summary = "Adjust store inventory count (Audit / Intake / Damage)")
    public ResponseEntity<ApiResponse<ProductVariantDto>> adjustInventory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StockAdjustmentRequest request) {
        ProductVariantDto updated = staffService.adjustStoreInventory(principal.getStoreId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Inventory adjusted successfully", updated));
    }

    @PostMapping("/transfers")
    @Operation(summary = "Create stock transfer request between stores or from central warehouse")
    public ResponseEntity<ApiResponse<StockTransferDto>> createTransfer(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StockTransferDto dto) {
        if (dto.getToStoreId() == null && principal.getStoreId() != null) {
            dto.setToStoreId(principal.getStoreId());
        }
        StockTransferDto created = staffService.createStockTransfer(principal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Stock transfer requested successfully", created));
    }

    @GetMapping("/transfers")
    @Operation(summary = "Get stock transfers for current store")
    public ResponseEntity<ApiResponse<List<StockTransferDto>>> getTransfers(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<StockTransferDto> transfers = staffService.getStoreTransfers(principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.ok(transfers));
    }

    @GetMapping("/reports/daily")
    @Operation(summary = "Get daily store revenue & shift report")
    public ResponseEntity<ApiResponse<StaffDailyReportDto>> getDailyReport(
            @AuthenticationPrincipal UserPrincipal principal) {
        StaffDailyReportDto report = staffService.getDailyReport(principal.getStoreId());
        return ResponseEntity.ok(ApiResponse.ok(report));
    }
}
