package com.beofashion.dto;

public record PasswordResetChallenge(String message, String resetToken, long expiresInMinutes) {}
