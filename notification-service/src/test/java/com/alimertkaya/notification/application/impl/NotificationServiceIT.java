package com.alimertkaya.notification.application.impl;

import com.alimertkaya.notification.api.dto.NotificationPayload;
import com.alimertkaya.notification.application.service.NotificationService;
import com.alimertkaya.notification.infrastructure.repository.NotificationLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.kafka.KafkaContainer;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * NotificationServiceImpl için Testcontainers tabanlı integration testleri.
 * Gerçek PostgreSQL + Kafka container kullanır; her test @Transactional ile otomatik geri alınır.
 */
@SpringBootTest
@Testcontainers
@Transactional
class NotificationServiceIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Container
    static KafkaContainer kafka = new KafkaContainer("apache/kafka:3.7.0");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    // ─── sendShipmentEmail ───────────────────────────────────────────────────────

    @Test
    void sendShipmentEmail_whenNewEvent_thenEmailLogPersistedToDatabase() {
        // given
        UUID eventId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        NotificationPayload payload = new NotificationPayload(orderId, "SHP-TESTTRACK");

        // when
        notificationService.sendShipmentEmail(eventId, payload);

        // then
        assertThat(notificationLogRepository.findAll())
                .anyMatch(log -> log.getEventId().equals(eventId)
                        && log.getNotificationType().equals("EMAIL")
                        && log.getMessage().contains("SHP-TESTTRACK"));
    }

    @Test
    void sendShipmentEmail_whenDuplicateEventId_thenSecondCallIgnoredAndNoExtraLogCreated() {
        // given
        UUID eventId = UUID.randomUUID();
        NotificationPayload payload = new NotificationPayload(UUID.randomUUID(), "SHP-XYZ");

        // when
        notificationService.sendShipmentEmail(eventId, payload);
        notificationService.sendShipmentEmail(eventId, payload);

        // then — idempotency: ikinci çağrı yeni log oluşturmaz
        assertThat(notificationLogRepository.count()).isEqualTo(1L);
    }

    // ─── sendPaymentFailedEmail ──────────────────────────────────────────────────

    @Test
    void sendPaymentFailedEmail_whenNewEvent_thenSmsLogPersistedToDatabase() {
        // given
        UUID eventId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        NotificationPayload payload = new NotificationPayload(orderId, null);

        // when
        notificationService.sendPaymentFailedEmail(eventId, payload);

        // then
        assertThat(notificationLogRepository.findAll())
                .anyMatch(log -> log.getEventId().equals(eventId)
                        && log.getNotificationType().equals("SMS")
                        && log.getMessage().contains("iptal"));
    }

    @Test
    void sendPaymentFailedEmail_whenDuplicateEventId_thenSecondCallIgnoredAndNoExtraLogCreated() {
        // given
        UUID eventId = UUID.randomUUID();
        NotificationPayload payload = new NotificationPayload(UUID.randomUUID(), null);

        // when
        notificationService.sendPaymentFailedEmail(eventId, payload);
        notificationService.sendPaymentFailedEmail(eventId, payload);

        // then — idempotency: ikinci çağrı yeni log oluşturmaz
        assertThat(notificationLogRepository.count()).isEqualTo(1L);
    }
}
