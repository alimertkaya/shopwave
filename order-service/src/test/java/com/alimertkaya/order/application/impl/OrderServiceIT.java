package com.alimertkaya.order.application.impl;

import com.alimertkaya.order.api.request.CreateOrderRequest;
import com.alimertkaya.order.api.response.InventoryEventPayload;
import com.alimertkaya.order.api.response.OrderResponse;
import com.alimertkaya.order.api.response.PaymentEventPayload;
import com.alimertkaya.order.api.response.ShippingEventPayload;
import com.alimertkaya.order.application.service.OrderService;
import com.alimertkaya.order.domain.entity.Order;
import com.alimertkaya.order.domain.enums.OrderStatus;
import com.alimertkaya.order.infrastructure.client.ProductClient;
import com.alimertkaya.order.infrastructure.client.ProductDto;
import com.alimertkaya.order.infrastructure.repository.OrderRepository;
import com.alimertkaya.order.infrastructure.repository.OutboxRepository;
import com.alimertkaya.order.infrastructure.repository.ProcessedEventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.kafka.KafkaContainer;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * OrderServiceImpl için Testcontainers tabanlı integration testleri.
 * Gerçek PostgreSQL + Kafka container kullanır. ProductClient (Feign) mock'lanır.
 * Her test @Transactional ile otomatik geri alınır.
 */
@SpringBootTest
@Testcontainers
@Transactional
class OrderServiceIT {

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
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OutboxRepository outboxRepository;

    @Autowired
    private ProcessedEventRepository processedEventRepository;

    @MockBean
    private ProductClient productClient;

    // ─── createOrder ─────────────────────────────────────────────────────────────

    @Test
    void createOrder_whenValidRequest_thenOrderPersistedAndOutboxEventCreated() {
        // given
        UUID productId = UUID.randomUUID();
        when(productClient.getProductById(any()))
                .thenReturn(Optional.of(new ProductDto(productId, "Laptop", new BigDecimal("5000.00"))));
        CreateOrderRequest request = new CreateOrderRequest(UUID.randomUUID(), productId, 2, null, null, null, null, null);

        // when
        OrderResponse response = orderService.createOrder(request);

        // then
        assertThat(response.id()).isNotNull();
        assertThat(response.status()).isEqualTo("CREATED");
        assertThat(response.totalPrice()).isEqualByComparingTo(new BigDecimal("10000.00"));
        assertThat(outboxRepository.findAll())
                .anyMatch(e -> e.getEventType().equals("order.created"));
    }

    // ─── handlePaymentSuccess ────────────────────────────────────────────────────

    @Test
    void handlePaymentSuccess_whenValidEvent_thenOrderStatusUpdatedAndStockReservationEventPublished() {
        // given
        OrderResponse order = createTestOrder(new BigDecimal("1000.00"), 1);
        UUID eventId = UUID.randomUUID();

        // when
        orderService.handlePaymentSuccess(eventId, new PaymentEventPayload(order.id()));

        // then
        Order saved = orderRepository.findById(order.id()).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(OrderStatus.PAYMENT_PROCESSED);
        assertThat(outboxRepository.findAll())
                .anyMatch(e -> e.getEventType().equals("reserve.stock"));
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    @Test
    void handlePaymentSuccess_whenDuplicateEventId_thenSecondCallIgnoredAndNoExtraRecordsCreated() {
        // given
        OrderResponse order = createTestOrder(new BigDecimal("500.00"), 1);
        UUID eventId = UUID.randomUUID();
        PaymentEventPayload payload = new PaymentEventPayload(order.id());

        // when
        orderService.handlePaymentSuccess(eventId, payload);
        orderService.handlePaymentSuccess(eventId, payload);

        // then — idempotency: ikinci çağrı işlem yapmaz
        assertThat(processedEventRepository.count()).isEqualTo(1L);
    }

    // ─── handlePaymentFailed ─────────────────────────────────────────────────────

    @Test
    void handlePaymentFailed_whenValidEvent_thenOrderCancelled() {
        // given
        OrderResponse order = createTestOrder(new BigDecimal("2000.00"), 1);
        UUID eventId = UUID.randomUUID();

        // when
        orderService.handlePaymentFailed(eventId, new PaymentEventPayload(order.id()));

        // then
        Order saved = orderRepository.findById(order.id()).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    // ─── handleStockReserved ─────────────────────────────────────────────────────

    @Test
    void handleStockReserved_whenValidEvent_thenOrderStatusUpdatedAndShipmentEventPublished() {
        // given
        OrderResponse order = createTestOrder(new BigDecimal("3000.00"), 1);
        UUID eventId = UUID.randomUUID();

        // when
        orderService.handleStockReserved(eventId, new InventoryEventPayload(order.id()));

        // then
        Order saved = orderRepository.findById(order.id()).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(OrderStatus.STOCK_RESERVED);
        assertThat(outboxRepository.findAll())
                .anyMatch(e -> e.getEventType().equals("start.shipment"));
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    // ─── handleStockReserveFailed ────────────────────────────────────────────────

    @Test
    void handleStockReserveFailed_whenValidEvent_thenOrderCancelledAndRefundEventPublished() {
        // given
        OrderResponse order = createTestOrder(new BigDecimal("4000.00"), 1);
        UUID eventId = UUID.randomUUID();

        // when
        orderService.handleStockReserveFailed(eventId, new InventoryEventPayload(order.id()));

        // then
        Order saved = orderRepository.findById(order.id()).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(outboxRepository.findAll())
                .anyMatch(e -> e.getEventType().equals("refund.payment"));
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    // ─── handleShipmentStarted ───────────────────────────────────────────────────

    @Test
    void handleShipmentStarted_whenValidEvent_thenOrderStatusSetToShipped() {
        // given
        OrderResponse order = createTestOrder(new BigDecimal("1500.00"), 1);
        UUID eventId = UUID.randomUUID();

        // when
        orderService.handleShipmentStarted(eventId, new ShippingEventPayload(order.id(), "SHP-TRACK001"));

        // then
        Order saved = orderRepository.findById(order.id()).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        assertThat(processedEventRepository.existsByEventId(eventId)).isTrue();
    }

    // ─── helper ──────────────────────────────────────────────────────────────────

    private OrderResponse createTestOrder(BigDecimal unitPrice, int quantity) {
        UUID productId = UUID.randomUUID();
        when(productClient.getProductById(any()))
                .thenReturn(Optional.of(new ProductDto(productId, "Test Product", unitPrice)));
        return orderService.createOrder(new CreateOrderRequest(UUID.randomUUID(), productId, quantity, null, null, null, null, null));
    }
}
