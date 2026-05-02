package com.alimertkaya.notification.infrastructure.kafka.consumer;

import com.alimertkaya.notification.api.dto.NotificationPayload;
import com.alimertkaya.notification.application.service.NotificationService;
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
public class NotificationEventConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "shipment.started", groupId = "notification-group")
    public void consumeShipmentStarted(String message) {
        try {
            NotificationPayload payload = objectMapper.readValue(message, NotificationPayload.class);
            UUID fakeEventId = UUID.randomUUID();
            notificationService.sendShipmentEmail(fakeEventId, payload);
        } catch (Exception e) {
            log.error("Kargo bildirim mesajı işlenemedi!", e);
        }
    }

    @KafkaListener(topics = {"payment.failed", "stock.reserve.failed"}, groupId = "notification-group")
    public void consumeFailures(String message) {
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            NotificationPayload payload = objectMapper.readValue(rootNode.toString(), NotificationPayload.class);
            UUID fakeEventId = UUID.randomUUID();
            notificationService.sendPaymentFailedEmail(fakeEventId, payload);
        } catch (Exception e) {
            log.error("Hata bildirim mesajı işlenemedi!", e);
        }
    }
}