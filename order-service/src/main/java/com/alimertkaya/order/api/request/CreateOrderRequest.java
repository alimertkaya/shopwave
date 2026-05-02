package com.alimertkaya.order.api.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Sipariş oluşturma isteği.
 * Not: totalPrice burada yer almaz — fiyat manipülasyonunu önlemek için
 * backend her zaman ProductService'ten gerçek fiyatı çekip hesaplar.
 */
public record CreateOrderRequest(
        @NotNull(message = "Kullanıcı ID boş olamaz") UUID userId,
        @NotNull(message = "Ürün ID boş olamaz") UUID productId,
        @NotNull(message = "Miktar boş olamaz") @Min(1) Integer quantity,
        String recipientName,
        String phone,
        String address,
        String city,
        String postalCode
) {}