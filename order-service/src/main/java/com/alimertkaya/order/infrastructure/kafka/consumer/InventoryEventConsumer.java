package com.alimertkaya.order.infrastructure.kafka.consumer;

import com.alimertkaya.order.api.response.InventoryEventPayload;
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
public class InventoryEventConsumer {

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "stock.reserve.failed", groupId = "order-group")
    public void consumeStockFailed(String message) {
        log.info("KAFKA'DAN 'stock.reserve.failed' MESAJI YAKALANDI: {}", message);
        processMessage(message, false);
    }

    @KafkaListener(topics = "stock.reserved", groupId = "order-group")
    public void consumeStockSuccess(String message) {
        log.info("KAFKA'DAN 'stock.reserved' MESAJI YAKALANDI: {}", message);
        processMessage(message, true);
    }

    private void processMessage(String message, boolean isSuccess) {
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            InventoryEventPayload payload = objectMapper.readValue(rootNode.toString(), InventoryEventPayload.class);

            // Gerçek eventId mesajdan alınır — idempotency koruması için kritik
            UUID eventId = rootNode.has("eventId")
                    ? UUID.fromString(rootNode.get("eventId").asText())
                    : UUID.nameUUIDFromBytes(message.getBytes());

            if (isSuccess) {
                orderService.handleStockReserved(eventId, payload);
            } else {
                orderService.handleStockReserveFailed(eventId, payload);
            }
        } catch (Exception e) {
            log.error("Stok mesajı işlenirken hata oluştu!", e);
        }
    }
}
