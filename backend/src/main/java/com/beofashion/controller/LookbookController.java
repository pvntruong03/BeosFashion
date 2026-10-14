package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.LookbookDto;
import com.beofashion.service.LookbookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lookbooks")
@RequiredArgsConstructor
@Tag(name = "Lookbooks", description = "Public lookbook collection catalog")
public class LookbookController {

    private final LookbookService lookbookService;

    @GetMapping
    @Operation(summary = "Get all active lookbooks")
    public ResponseEntity<ApiResponse<List<LookbookDto>>> getActiveLookbooks() {
        return ResponseEntity.ok(ApiResponse.ok(lookbookService.getActiveLookbooks()));
    }
}
