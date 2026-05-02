package com.alimertkaya.notification.api.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationLogResponse(
        UUID id,
        UUID orderId,
        String notificationType,
        String message,
        LocalDateTime sentAt
) {}
