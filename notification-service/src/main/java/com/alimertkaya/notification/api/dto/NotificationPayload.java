package com.alimertkaya.notification.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NotificationPayload(
        UUID orderId,
        String trackingNumber // Eğer kargo mesajıysa dolu gelir, değilse null olur
) {}