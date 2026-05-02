package com.alimertkaya.order.infrastructure.kafka.consumer;

import com.alimertkaya.order.api.response.PaymentEventPayload;
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
public class PaymentEventConsumer {

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "payment.failed", groupId = "order-group")
    public void consumePaymentFailed(String message) {
        log.info("KAFKA'DAN 'payment.failed' MESAJI YAKALANDI: {}", message);
        processMessage(message, false);
    }

    @KafkaListener(topics = "payment.success", groupId = "order-group")
    public void consumePaymentSuccess(String message) {
        log.info("KAFKA'DAN 'payment.success' MESAJI YAKALANDI: {}", message);
        processMessage(message, true);
    }

    private void processMessage(String message, boolean isSuccess) {
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            PaymentEventPayload payload = objectMapper.readValue(rootNode.toString(), PaymentEventPayload.class);

            // Gerçek eventId mesajdan alınır — idempotency koruması için kritik
            UUID eventId = rootNode.has("eventId")
                    ? UUID.fromString(rootNode.get("eventId").asText())
                    : UUID.nameUUIDFromBytes(message.getBytes());

            if (isSuccess) {
                orderService.handlePaymentSuccess(eventId, payload);
            } else {
                orderService.handlePaymentFailed(eventId, payload);
            }
        } catch (Exception e) {
            log.error("Ödeme mesajı işlenirken hata oluştu!", e);
        }
    }
}
