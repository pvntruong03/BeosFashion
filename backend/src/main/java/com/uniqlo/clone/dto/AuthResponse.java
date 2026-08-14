package com.uniqlo.clone.dto;

import com.uniqlo.clone.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn;
    private UserProfileDto user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfileDto {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String address;
        private String city;
        private Role role;
        private String avatar;
        private Integer points;
        private String membershipTier;
        private Long storeId;
        private String storeName;
        private String storeCode;
        private String position;
    }
}
