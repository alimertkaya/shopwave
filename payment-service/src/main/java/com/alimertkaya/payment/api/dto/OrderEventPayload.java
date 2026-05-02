package com.alimertkaya.payment.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OrderEventPayload(
        UUID id, // order id
        UUID userId,
        BigDecimal totalPrice
) {}
