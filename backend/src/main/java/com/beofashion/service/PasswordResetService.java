package com.beofashion.service;

import com.beofashion.dto.PasswordResetChallenge;
import com.beofashion.entity.PasswordResetToken;
import com.beofashion.entity.User;
import com.beofashion.exception.BadRequestException;
import com.beofashion.repository.PasswordResetTokenRepository;
import com.beofashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.expose-token:true}")
    private boolean exposeToken;

    @Transactional
    public PasswordResetChallenge createChallenge(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        String rawToken = UUID.randomUUID().toString().replace("-", "");

        if (user != null && user.isEnabled()) {
            tokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(hash(rawToken))
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build());
        }

        return new PasswordResetChallenge(
                "Nếu email tồn tại, mã đặt lại mật khẩu đã được tạo.",
                user != null && exposeToken ? rawToken : null,
                15
        );
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadRequestException("Mã đặt lại mật khẩu không hợp lệ"));
        if (token.getUsedAt() != null) {
            throw new BadRequestException("Mã đặt lại mật khẩu đã được sử dụng");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã đặt lại mật khẩu đã hết hạn");
        }

        token.getUser().setPassword(passwordEncoder.encode(newPassword));
        token.setUsedAt(LocalDateTime.now());
        userRepository.save(token.getUser());
        tokenRepository.save(token);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
