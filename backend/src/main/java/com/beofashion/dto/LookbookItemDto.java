package com.beofashion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LookbookItemDto {
    private Long id;
    private String slug;
    private String name;
    private BigDecimal price;
    private String color; // Represents a sample color for display
}
