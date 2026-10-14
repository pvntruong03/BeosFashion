package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.StoreDto;
import com.beofashion.service.StoreService;
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
