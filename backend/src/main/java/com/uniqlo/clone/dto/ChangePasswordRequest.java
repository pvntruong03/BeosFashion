package com.uniqlo.clone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {
    @NotBlank(message = "Please enter current password")
    private String oldPassword;

    @NotBlank(message = "Please enter new password")
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;
}
