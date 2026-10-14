package com.beofashion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreDto {
    private Long id;
    private String code;
    private String name;
    private String address;
    private String city;
    private String phone;
    private String openingHours;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private boolean isCentralWarehouse;
    private boolean active;
}
