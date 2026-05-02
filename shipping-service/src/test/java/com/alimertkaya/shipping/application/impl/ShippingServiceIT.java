package com.alimertkaya.shipping.application.impl;

import com.alimertkaya.shipping.api.dto.StartShipmentPayload;
import com.alimertkaya.shipping.application.service.ShippingService;
import com.alimertkaya.shipping.infrastructure.repository.OutboxRepository;
import com.alimertkaya.shipping.infrastructure.repository.ProcessedEventRepository;
import com.alimertkaya.shipping.infrastructure.repository.ShipmentRepository;
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
 * ShippingServiceImpl için Testcontainers tabanlı integration testleri.
 * Gerçek PostgreSQL + Kafka container kullanır; her test @Transactional ile otomatik geri alınır.
 */
@SpringBootTest
@Testcontainers
@Transactional
class ShippingServiceIT {

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
    private ShippingService shippingService;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private OutboxRepository outboxRepository;

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    // ─── startShipment ───────────────────────────────────────────────────────────

    @Test
    void startShipment_whenNewEvent_thenShipmentPersistedWithTrackingNumberAndEventPublished() {
        // given
        UUID eventId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        StartShipmentPayload payload = new StartShipmentPayload(orderId);

        // when
        shippingService.startShipment(eventId, payload);

        // then
        assertThat(shipmentRepository.findAll())
                .anyMatch(s -> s.getOrderId().equals(orderId)
                        && s.getTrackingNumber().startsWith("SHP-"));
        assertThat(outboxRepository.findAll())
                .anyMatch(e -> e.getEventType().equals("shipment.started"));
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    @Test
    void startShipment_whenDuplicateEventId_thenSecondCallIgnoredAndNoExtraRecordsCreated() {
        // given
        UUID eventId = UUID.randomUUID();
        StartShipmentPayload payload = new StartShipmentPayload(UUID.randomUUID());

        // when
        shippingService.startShipment(eventId, payload);
        shippingService.startShipment(eventId, payload);

        // then — idempotency: ikinci çağrı işlem yapmaz
        assertThat(shipmentRepository.count()).isEqualTo(1L);
        assertThat(outboxRepository.count()).isEqualTo(1L);
        assertThat(processedEventRepository.count()).isEqualTo(1L);
    }
}
