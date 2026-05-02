package com.alimertkaya.payment.application.service;

import com.alimertkaya.payment.api.dto.OrderEventPayload;

import java.util.UUID;

public interface PaymentService {

    /**
     * Sipariş için ödeme işlemi yapar (Kafka: order.created consumer).
     * Ödeme 100.000 TL altındaysa başarılı kabul edilir ve 'payment.success' event'i tetiklenir.
     * Üstündeyse 'payment.failed' tetiklenerek Saga compensation başlar.
     * Idempotent: Aynı eventId ile tekrar çağrılırsa işlem atlanır.
     *
     * @param eventId      Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param orderPayload Sipariş ID, kullanıcı ID ve toplam tutarı içerir
     */
    void processPayment(UUID eventId, OrderEventPayload orderPayload);
}
