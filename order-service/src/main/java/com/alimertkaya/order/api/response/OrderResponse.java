package com.alimertkaya.order.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderResponse(
                UUID id,
                UUID userId,
                UUID productId,
                Integer quantity,
                BigDecimal totalPrice,
                String status,
                LocalDateTime createdAt,
                String recipientName,
                String phone,
                String address,
                String city,
                String postalCode) {
}
