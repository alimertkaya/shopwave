package com.alimertkaya.product.api.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Ürün adı boş olamaz")
        String name,

        String description,

        @NotNull(message = "Fiyat boş olamaz")
        @DecimalMin(value = "0.0", inclusive = false, message = "Fiyat sıfırdan büyük olmalı")
        BigDecimal price,

        @NotBlank(message = "Kategori boş olamaz")
        String category,

        String imageUrl
) {}