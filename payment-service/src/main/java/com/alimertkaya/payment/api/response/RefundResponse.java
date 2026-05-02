package com.alimertkaya.payment.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record RefundResponse(
        UUID id,
        UUID orderId,
        BigDecimal amount,
        String reason,
        String status,
        LocalDateTime requestedAt,
        LocalDateTime completedAt
) {}
