package com.alimertkaya.shipping.api.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ShipmentResponse(
        UUID id,
        UUID orderId,
        String trackingNumber,
        String status,
        LocalDateTime createdAt
) {}
