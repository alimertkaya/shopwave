package com.alimertkaya.shipping.infrastructure.kafka.consumer;

import com.alimertkaya.shipping.api.dto.StartShipmentPayload;
import com.alimertkaya.shipping.application.service.ShippingService;
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
public class StartShipmentConsumer {

    private final ShippingService shippingService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "start.shipment", groupId = "shipping-group")
    public void consume(String message) {
        log.info("KAFKA'DAN 'start.shipment' MESAJI YAKALANDI: {}", message);

        try {
            JsonNode rootNode = objectMapper.readTree(message);
            StartShipmentPayload payload = objectMapper.readValue(rootNode.toString(), StartShipmentPayload.class);

            // Gerçekte Header'dan alınır, test için OrderID'yi kullanıyoruz.
            UUID fakeEventId = payload.orderId();

            shippingService.startShipment(fakeEventId, payload);

        } catch (Exception e) {
            log.error("Kargo emri işlenirken hata oluştu!", e);
        }
    }
}
