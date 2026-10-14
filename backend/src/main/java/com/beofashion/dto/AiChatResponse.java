package com.beofashion.dto;

public record AiChatResponse(
        String reply,
        String provider,
        String model,
        boolean aiEnabled,
        boolean fallbackUsed
) {
}
