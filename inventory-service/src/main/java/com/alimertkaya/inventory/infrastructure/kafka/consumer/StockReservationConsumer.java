package com.alimertkaya.inventory.infrastructure.kafka.consumer;

import com.alimertkaya.inventory.api.request.ReserveStockPayload;
import com.alimertkaya.inventory.application.service.InventoryService;
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
public class StockReservationConsumer {

    private final InventoryService inventoryService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "reserve.stock", groupId = "inventory-group")
    public void consume(String message) {
        log.info("KAFKA'DAN 'reserve.stock' MESAJI YAKALANDI: {}", message);

        try {
            JsonNode rootNode = objectMapper.readTree(message);
            ReserveStockPayload payload = objectMapper.readValue(rootNode.toString(), ReserveStockPayload.class);

            UUID fakeEventId = payload.orderId();

            inventoryService.reserveStock(fakeEventId, payload);
        } catch (Exception e) {
            log.error("Stok rezervasyon mesajı işlenirken hata oluştu!", e);
        }
    }
}
