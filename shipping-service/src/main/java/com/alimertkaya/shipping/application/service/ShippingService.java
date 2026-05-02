package com.alimertkaya.shipping.application.service;

import com.alimertkaya.shipping.api.dto.StartShipmentPayload;

import java.util.UUID;

public interface ShippingService {

    /**
     * Kargo sürecini başlatır (Kafka: start.shipment consumer).
     * Benzersiz bir takip numarası üretir, Shipment kaydeder ve
     * 'shipment.started' event'ini Outbox aracılığıyla yayınlar.
     * Idempotent: Aynı eventId ile tekrar çağrılırsa işlem atlanır.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Kargoya verilecek siparişin ID'sini içerir
     */
    void startShipment(UUID eventId, StartShipmentPayload payload);
}
