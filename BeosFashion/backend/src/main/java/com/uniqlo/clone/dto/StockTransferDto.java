package com.uniqlo.clone.dto;

import com.uniqlo.clone.entity.TransferStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockTransferDto {
    private Long id;
    private String requestCode;

    @NotNull(message = "From Store ID is required")
    private Long fromStoreId;
    private String fromStoreName;

    @NotNull(message = "To Store ID is required")
    private Long toStoreId;
    private String toStoreName;

    @NotNull(message = "Variant ID is required")
    private Long variantId;
    private String productName;
    private String productCode;
    private String color;
    private String size;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private TransferStatus status;
    private String reason;
    private String requesterName;
    private String approverName;
    private LocalDateTime createdAt;
}
