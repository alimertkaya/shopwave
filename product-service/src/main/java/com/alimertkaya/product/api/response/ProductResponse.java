package com.alimertkaya.product.api.response;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        String category,
        String imageUrl
) implements Serializable {}
