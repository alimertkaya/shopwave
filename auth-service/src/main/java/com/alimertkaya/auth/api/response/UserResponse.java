package com.alimertkaya.auth.api.response;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String role,
        String phone
) {}
