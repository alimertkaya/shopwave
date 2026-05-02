package com.alimertkaya.payment.infrastructure.kafka.consumer;

import com.alimertkaya.payment.api.dto.OrderEventPayload;
import com.alimertkaya.payment.application.service.PaymentService;
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
public class OrderCreatedEventConsumer {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.created", groupId = "payment-group")
    public void consume(String message) {
        log.info("Kafka'dan yeni sipariş mesajı alındı: {}", message);

        try {
            // string olarak gelen JSON i oku
            JsonNode rootNode = objectMapper.readTree(message);

            // OutboxEvent icinden payload cekip order object JSON u olarak kaydeder
            String payloadString = rootNode.toString();

            // payload i dto cevirir
            OrderEventPayload orderPayload = objectMapper.readValue(payloadString, OrderEventPayload.class);

            UUID fakeEventId = orderPayload.id();
            paymentService.processPayment(fakeEventId, orderPayload);
        } catch (Exception e) {
            log.error("Mesaj işlenirken hata oluştu!", e);
        }
    }
}
