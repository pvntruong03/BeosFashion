package com.beofashion.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AiChatRequest(
        @NotBlank @Size(max = 1000) String message,
        @Size(max = 5) String language,
        @Valid @Size(max = 8) List<ChatTurn> history
) {
    public record ChatTurn(
            @NotBlank @Size(max = 10) String role,
            @NotBlank @Size(max = 1000) String content
    ) {
    }
}
