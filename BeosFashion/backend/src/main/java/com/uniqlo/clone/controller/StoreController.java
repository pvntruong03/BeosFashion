package com.uniqlo.clone.controller;

import com.uniqlo.clone.dto.ApiResponse;
import com.uniqlo.clone.dto.StoreDto;
import com.uniqlo.clone.service.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
@Tag(name = "Stores", description = "Physical retail store locations and inventory lookup")
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    @Operation(summary = "Get all active store locations")
    public ResponseEntity<ApiResponse<List<StoreDto>>> getAllStores() {
        return ResponseEntity.ok(ApiResponse.ok(storeService.getAllActiveStores()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get store details by ID")
    public ResponseEntity<ApiResponse<StoreDto>> getStoreById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(storeService.getStoreById(id)));
    }
}
