package com.alimertkaya.inventory.api.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record InventoryRequest(
        @NotNull(message = "Ürün ID boş olamaz")
        UUID productId,

        @NotNull(message = "Miktar boş olmaz")
        @Min(value = 1, message = "Eklenecek miktar en az 1 olmalıdır")
        Integer quantity
) {}
