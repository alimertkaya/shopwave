package com.alimertkaya.auth.api.response;

public record AuthResponse(
        String accessToken,
        UserResponse user
) {}
