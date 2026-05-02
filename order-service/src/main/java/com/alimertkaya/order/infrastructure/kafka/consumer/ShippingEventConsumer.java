package com.alimertkaya.order.infrastructure.kafka.consumer;

import com.alimertkaya.order.api.response.ShippingEventPayload;
import com.alimertkaya.order.application.service.OrderService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShippingEventConsumer {

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "shipment.started", groupId = "order-group")
    public void consume(String message) {
        log.info("KAFKA'DAN 'shipment.started' MESAJI YAKALANDI: {}", message);

        try {
            JsonNode rootNode = objectMapper.readTree(message);
            ShippingEventPayload payload = objectMapper.readValue(rootNode.toString(), ShippingEventPayload.class);

            // Gerçek eventId mesajdan alınır — idempotency koruması için kritik
            UUID eventId = rootNode.has("eventId")
                    ? UUID.fromString(rootNode.get("eventId").asText())
                    : UUID.nameUUIDFromBytes(message.getBytes());

            orderService.handleShipmentStarted(eventId, payload);

        } catch (Exception e) {
            log.error("Kargo mesajı işlenirken hata oluştu!", e);
        }
    }
}
