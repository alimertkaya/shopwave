package com.alimertkaya.order.api.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ShippingEventPayload(
        UUID orderId,
        String trackingNumber
) {}