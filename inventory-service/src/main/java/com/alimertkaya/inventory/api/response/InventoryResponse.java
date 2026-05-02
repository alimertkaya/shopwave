package com.alimertkaya.inventory.api.response;

import java.util.UUID;

public record InventoryResponse(
        UUID id,
        UUID productId,
        Integer quantity
) {}
