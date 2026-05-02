package com.alimertkaya.shipping.application.impl;

import com.alimertkaya.shipping.api.dto.StartShipmentPayload;
import com.alimertkaya.shipping.application.service.ShippingService;
import com.alimertkaya.shipping.domain.entity.OutboxEvent;
import com.alimertkaya.shipping.domain.entity.ProcessedEvent;
import com.alimertkaya.shipping.domain.entity.Shipment;
import com.alimertkaya.shipping.domain.enums.OutboxStatus;
import com.alimertkaya.shipping.domain.enums.ShipmentStatus;
import com.alimertkaya.shipping.infrastructure.repository.OutboxRepository;
import com.alimertkaya.shipping.infrastructure.repository.ProcessedEventRepository;
import com.alimertkaya.shipping.infrastructure.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

        private final ShipmentRepository shipmentRepository;
        private final OutboxRepository outboxRepository;
        private final ProcessedEventRepository processedEventRepository;

        @Override
        @Transactional
        public void startShipment(UUID eventId, StartShipmentPayload payload) {
                if (processedEventRepository.existsByEventId(eventId)) {
                        log.warn("Bu kargo emri daha önce işlenmiş! Event ID: {}", eventId);
                        return;
                }

                log.info("Kargo süreci başlatılıyor... Order ID: {}", payload.orderId());

                // kargo takip
                String trackingNumber = "SHP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

                Shipment shipment = Shipment.builder()
                                .orderId(payload.orderId())
                                .trackingNumber(trackingNumber)
                                .status(ShipmentStatus.SHIPPED)
                                .build();
                shipmentRepository.save(shipment);

                log.info("Kargo hazırlandı! Takip No: {}", trackingNumber);

                // kafka mesaj gonder
                UUID outboxEventId = UUID.randomUUID();
                String outboxPayload = String.format("{\"eventId\":\"%s\",\"orderId\":\"%s\",\"trackingNumber\":\"%s\"}",
                                outboxEventId, payload.orderId(), trackingNumber);

                OutboxEvent outboxEvent = OutboxEvent.builder()
                                .eventId(outboxEventId)
                                .eventType("shipment.started")
                                .aggregateId(payload.orderId().toString())
                                .payload(outboxPayload)
                                .status(OutboxStatus.PENDING)
                                .build();
                outboxRepository.save(outboxEvent);

                processedEventRepository.save(ProcessedEvent.builder()
                                .eventId(eventId)
                                .eventType("start.shipment")
                                .processedAt(LocalDateTime.now())
                                .build());
        }
}
