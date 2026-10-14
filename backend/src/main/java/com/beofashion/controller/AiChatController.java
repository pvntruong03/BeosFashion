package com.beofashion.controller;

import com.beofashion.dto.AiChatRequest;
import com.beofashion.dto.AiChatResponse;
import com.beofashion.service.AiChatService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private static final int REQUESTS_PER_MINUTE = 15;
    private static final long WINDOW_MILLIS = 60_000L;

    private final AiChatService aiChatService;
    private final Map<String, ArrayDeque<Long>> requestWindows = new ConcurrentHashMap<>();

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(
            @Valid @RequestBody AiChatRequest request,
            HttpServletRequest httpRequest
    ) {
        enforceRateLimit(httpRequest.getRemoteAddr());
        return ResponseEntity.ok(aiChatService.chat(request));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "configured", aiChatService.isConfigured(),
                "provider", aiChatService.isConfigured() ? "Gemini" : "BEO Knowledge Base",
                "model", aiChatService.isConfigured() ? aiChatService.getModel() : "local-fallback",
                "checkedAt", Instant.now().toString()
        ));
    }

    private void enforceRateLimit(String clientAddress) {
        long now = System.currentTimeMillis();
        ArrayDeque<Long> timestamps = requestWindows.computeIfAbsent(clientAddress, ignored -> new ArrayDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() >= WINDOW_MILLIS) {
                timestamps.removeFirst();
            }
            if (timestamps.size() >= REQUESTS_PER_MINUTE) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Bạn đang gửi quá nhanh. Vui lòng thử lại sau một phút."
                );
            }
            timestamps.addLast(now);
        }
    }
}
