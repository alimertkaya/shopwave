package com.alimertkaya.payment.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID orderId,
        BigDecimal amount,
        String status,
        LocalDateTime createdAt
) {}
