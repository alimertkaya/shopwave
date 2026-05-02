package com.alimertkaya.inventory.application.impl;

import com.alimertkaya.inventory.api.request.InventoryRequest;
import com.alimertkaya.inventory.api.request.ReserveStockPayload;
import com.alimertkaya.inventory.api.response.InventoryResponse;
import com.alimertkaya.inventory.application.service.InventoryService;
import com.alimertkaya.inventory.domain.enums.OutboxStatus;
import com.alimertkaya.inventory.domain.exception.EntityNotFoundException;
import com.alimertkaya.inventory.infrastructure.repository.InventoryRepository;
import com.alimertkaya.inventory.infrastructure.repository.OutboxRepository;
import com.alimertkaya.inventory.infrastructure.repository.ProcessedEventRepository;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * InventoryServiceImpl için Testcontainers tabanlı integration testleri.
 * Gerçek PostgreSQL + Kafka container kullanır; her test @Transactional ile otomatik geri alınır.
 */
@SpringBootTest
@Testcontainers
@Transactional
class InventoryServiceIT {

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
    private InventoryService inventoryService;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OutboxRepository outboxRepository;

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    // ─── addStock ────────────────────────────────────────────────────────────────

    @Test
    void addStock_whenProductNotExist_thenNewInventoryCreated() {
        // given
        UUID productId = UUID.randomUUID();
        InventoryRequest request = new InventoryRequest(productId, 50);

        // when
        InventoryResponse response = inventoryService.addStock(request);

        // then
        assertThat(response.productId()).isEqualTo(productId);
        assertThat(response.quantity()).isEqualTo(50);
        assertThat(inventoryRepository.findByProductId(productId)).isPresent();
    }

    @Test
    void addStock_whenProductAlreadyExists_thenQuantityIncremented() {
        // given
        UUID productId = UUID.randomUUID();
        inventoryService.addStock(new InventoryRequest(productId, 30));

        // when
        InventoryResponse response = inventoryService.addStock(new InventoryRequest(productId, 20));

        // then
        assertThat(response.quantity()).isEqualTo(50);
    }

    // ─── getStockByProductId ─────────────────────────────────────────────────────

    @Test
    void getStockByProductId_whenStockExists_thenInventoryReturned() {
        // given
        UUID productId = UUID.randomUUID();
        inventoryService.addStock(new InventoryRequest(productId, 15));

        // when
        InventoryResponse response = inventoryService.getStockByProductId(productId);

        // then
        assertThat(response.productId()).isEqualTo(productId);
        assertThat(response.quantity()).isEqualTo(15);
    }

    @Test
    void getStockByProductId_whenStockNotFound_thenEntityNotFoundExceptionThrown() {
        // when / then
        assertThatThrownBy(() -> inventoryService.getStockByProductId(UUID.randomUUID()))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ─── reserveStock ────────────────────────────────────────────────────────────

    @Test
    void reserveStock_whenSufficientStock_thenQuantityReducedAndStockReservedEventPublished() {
        // given
        UUID productId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        inventoryService.addStock(new InventoryRequest(productId, 20));

        // when
        inventoryService.reserveStock(eventId, new ReserveStockPayload(orderId, productId, 5));

        // then
        assertThat(inventoryRepository.findByProductId(productId).get().getQuantity()).isEqualTo(15);
        assertThat(outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .anyMatch(e -> e.getEventType().equals("stock.reserved"));
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    @Test
    void reserveStock_whenInsufficientStock_thenStockReserveFailedEventPublished() {
        // given
        UUID productId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        inventoryService.addStock(new InventoryRequest(productId, 3));

        // when
        inventoryService.reserveStock(eventId, new ReserveStockPayload(orderId, productId, 10));

        // then — stok değişmemeli, failure event outbox'a eklenmiş olmalı
        assertThat(inventoryRepository.findByProductId(productId).get().getQuantity()).isEqualTo(3);
        assertThat(outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .anyMatch(e -> e.getEventType().equals("stock.reserve.failed"));
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    @Test
    void reserveStock_whenDuplicateEventId_thenSecondCallIgnoredAndNoExtraRecordsCreated() {
        // given
        UUID productId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        inventoryService.addStock(new InventoryRequest(productId, 20));

        // when
        inventoryService.reserveStock(eventId, new ReserveStockPayload(orderId, productId, 5));
        inventoryService.reserveStock(eventId, new ReserveStockPayload(orderId, productId, 5));

        // then — idempotency: ikinci çağrı işlem yapmaz
        assertThat(processedEventRepository.count()).isEqualTo(1L);
        assertThat(outboxRepository.count()).isEqualTo(1L);
        assertThat(inventoryRepository.findByProductId(productId).get().getQuantity()).isEqualTo(15);
    }
}
