package com.uniqlo.clone.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    private String phone;
    private String address;
    private String city;
    private String avatar;
}
