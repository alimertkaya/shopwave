package com.alimertkaya.shipping.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StartShipmentPayload(
        UUID orderId
) {}