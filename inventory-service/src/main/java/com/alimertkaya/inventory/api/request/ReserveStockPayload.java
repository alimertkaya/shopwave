package com.alimertkaya.inventory.api.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ReserveStockPayload(
        UUID orderId,
        UUID productId,
        Integer quantity
) {}
