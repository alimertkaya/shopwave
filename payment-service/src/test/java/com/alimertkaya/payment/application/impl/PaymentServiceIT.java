package com.alimertkaya.payment.application.impl;

import com.alimertkaya.payment.api.dto.OrderEventPayload;
import com.alimertkaya.payment.application.service.PaymentService;
import com.alimertkaya.payment.domain.enums.OutboxStatus;
import com.alimertkaya.payment.infrastructure.repository.OutboxRepository;
import com.alimertkaya.payment.infrastructure.repository.ProcessedEventRepository;
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

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PaymentServiceImpl için Testcontainers tabanlı integration testleri.
 * Gerçek PostgreSQL + Kafka container kullanır; her test @Transactional ile otomatik geri alınır.
 */
@SpringBootTest
@Testcontainers
@Transactional
class PaymentServiceIT {

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
    private PaymentService paymentService;

    @Autowired
    private OutboxRepository outboxRepository;

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    // ─── processPayment ──────────────────────────────────────────────────────────

    @Test
    void processPayment_whenAmountBelowThreshold_thenPaymentSuccessEventPublished() {
        // given
        UUID eventId = UUID.randomUUID();
        OrderEventPayload payload = new OrderEventPayload(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("50000.00"));

        // when
        paymentService.processPayment(eventId, payload);

        // then
        assertThat(outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .anyMatch(e -> e.getEventType().equals("payment.success"));
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    @Test
    void processPayment_whenAmountAboveThreshold_thenPaymentFailedEventPublished() {
        // given
        UUID eventId = UUID.randomUUID();
        OrderEventPayload payload = new OrderEventPayload(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("150000.00"));

        // when
        paymentService.processPayment(eventId, payload);

        // then
        assertThat(outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .anyMatch(e -> e.getEventType().equals("payment.failed"));
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    @Test
    void processPayment_whenAmountEqualsThreshold_thenPaymentFailedEventPublished() {
        // given — 100_000 TL eşik değeri: "<" operatörü kullanıldığından tam eşikte başarısız olur
        UUID eventId = UUID.randomUUID();
        OrderEventPayload payload = new OrderEventPayload(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("100000.00"));

        // when
        paymentService.processPayment(eventId, payload);

        // then
        assertThat(outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .anyMatch(e -> e.getEventType().equals("payment.failed"));
    }

    @Test
    void processPayment_whenDuplicateEventId_thenSecondCallIgnoredAndNoExtraRecordsCreated() {
        // given
        UUID eventId = UUID.randomUUID();
        OrderEventPayload payload = new OrderEventPayload(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("50000.00"));

        // when
        paymentService.processPayment(eventId, payload);
        paymentService.processPayment(eventId, payload);

        // then — idempotency: ikinci çağrı işlem yapmaz
        assertThat(processedEventRepository.count()).isEqualTo(1L);
        assertThat(outboxRepository.count()).isEqualTo(1L);
    }
}
