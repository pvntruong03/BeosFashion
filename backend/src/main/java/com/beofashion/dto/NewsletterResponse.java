package com.beofashion.dto;

public record NewsletterResponse(String email, String couponCode, boolean alreadySubscribed) {}
