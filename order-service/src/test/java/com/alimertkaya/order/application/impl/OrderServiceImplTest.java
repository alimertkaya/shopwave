package com.alimertkaya.order.application.impl;

import com.alimertkaya.order.api.request.CreateOrderRequest;
import com.alimertkaya.order.api.response.InventoryEventPayload;
import com.alimertkaya.order.api.response.OrderResponse;
import com.alimertkaya.order.api.response.PaymentEventPayload;
import com.alimertkaya.order.application.mapper.OrderMapper;
import com.alimertkaya.order.domain.entity.Order;
import com.alimertkaya.order.domain.entity.OutboxEvent;
import com.alimertkaya.order.domain.entity.ProcessedEvent;
import com.alimertkaya.order.domain.enums.OrderStatus;
import com.alimertkaya.order.domain.exception.BusinessException;
import com.alimertkaya.order.infrastructure.client.ProductClient;
import com.alimertkaya.order.infrastructure.client.ProductDto;
import com.alimertkaya.order.infrastructure.repository.OrderRepository;
import com.alimertkaya.order.infrastructure.repository.OutboxRepository;
import com.alimertkaya.order.infrastructure.repository.ProcessedEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * OrderServiceImpl için birim testleri.
 * CLAUDE.md kuralı: methodName_whenCondition_thenExpected naming convention.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OutboxRepository outboxRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private ProcessedEventRepository processedEventRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ProductClient productClient;

    @InjectMocks
    private OrderServiceImpl orderService;

    private UUID productId;
    private UUID orderId;
    private UUID userId;
    private ProductDto mockProduct;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        orderId = UUID.randomUUID();
        userId = UUID.randomUUID();
        mockProduct = new ProductDto(productId, "Test Ürünü", new BigDecimal("100.00"));
    }

    // ─── createOrder ────────────────────────────────────────────────────────────

    @Test
    void createOrder_whenValidRequest_thenOrderCreatedAndOutboxEventPublished() throws Exception {
        // given
        CreateOrderRequest request = new CreateOrderRequest(userId, productId, 2, null, null, null, null, null);

        Order mockOrder = buildOrder(orderId, OrderStatus.CREATED);
        OrderResponse expectedResponse = new OrderResponse(
                orderId, userId, productId, 2, new BigDecimal("200.00"), "CREATED", null, null, null, null, null, null);

        when(productClient.getProductById(productId)).thenReturn(Optional.of(mockProduct));
        when(orderMapper.toEntity(request)).thenReturn(mockOrder);
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"id\":\"" + orderId + "\"}");
        when(orderMapper.toResponse(mockOrder)).thenReturn(expectedResponse);

        // when
        OrderResponse result = orderService.createOrder(request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(OrderStatus.CREATED.name());
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(outboxRepository, times(1)).save(any(OutboxEvent.class));

        ArgumentCaptor<OutboxEvent> outboxCaptor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(outboxCaptor.capture());
        assertThat(outboxCaptor.getValue().getEventType()).isEqualTo("order.created");
    }

    @Test
    void createOrder_whenProductNotFound_thenThrowsBusinessException() {
        // given
        CreateOrderRequest request = new CreateOrderRequest(userId, productId, 1, null, null, null, null, null);
        when(productClient.getProductById(productId)).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(BusinessException.class);

        verifyNoInteractions(orderRepository);
        verifyNoInteractions(outboxRepository);
    }

    // ─── handlePaymentSuccess ────────────────────────────────────────────────────

    @Test
    void handlePaymentSuccess_whenNewEvent_thenStatusUpdatedAndStockEventPublished() throws Exception {
        // given
        UUID eventId = UUID.randomUUID();
        PaymentEventPayload payload = new PaymentEventPayload(orderId);
        Order order = buildOrder(orderId, OrderStatus.CREATED);

        when(processedEventRepository.existsByEventId(eventId)).thenReturn(false);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"orderId\":\"" + orderId + "\"}");

        // when
        orderService.handlePaymentSuccess(eventId, payload);

        // then
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAYMENT_PROCESSED);
        verify(outboxRepository, times(1)).save(any(OutboxEvent.class));
        verify(processedEventRepository, times(1)).save(any(ProcessedEvent.class));

        ArgumentCaptor<OutboxEvent> outboxCaptor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(outboxCaptor.capture());
        assertThat(outboxCaptor.getValue().getEventType()).isEqualTo("reserve.stock");
    }

    @Test
    void handlePaymentSuccess_whenDuplicateEvent_thenIgnored() {
        // given — Aynı eventId tekrar gelirse işleme
        UUID eventId = UUID.randomUUID();
        PaymentEventPayload payload = new PaymentEventPayload(orderId);

        when(processedEventRepository.existsByEventId(eventId)).thenReturn(true);

        // when
        orderService.handlePaymentSuccess(eventId, payload);

        // then — Idempotency: hiçbir şey değişmemeli
        verifyNoInteractions(orderRepository);
        verifyNoInteractions(outboxRepository);
    }

    // ─── handlePaymentFailed ─────────────────────────────────────────────────────

    @Test
    void handlePaymentFailed_whenNewEvent_thenOrderCancelledAndNoStockEvent() {
        // given
        UUID eventId = UUID.randomUUID();
        PaymentEventPayload payload = new PaymentEventPayload(orderId);
        Order order = buildOrder(orderId, OrderStatus.CREATED);

        when(processedEventRepository.existsByEventId(eventId)).thenReturn(false);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // when
        orderService.handlePaymentFailed(eventId, payload);

        // then
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(orderRepository, times(1)).save(order);
        verifyNoInteractions(outboxRepository);
        verify(processedEventRepository, times(1)).save(any(ProcessedEvent.class));
    }

    // ─── handleStockReserveFailed ────────────────────────────────────────────────

    @Test
    void handleStockReserveFailed_whenNewEvent_thenOrderCancelledAndRefundEventPublished() throws Exception {
        // given
        UUID eventId = UUID.randomUUID();
        InventoryEventPayload payload = new InventoryEventPayload(orderId);
        Order order = buildOrder(orderId, OrderStatus.PAYMENT_PROCESSED);

        when(processedEventRepository.existsByEventId(eventId)).thenReturn(false);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"orderId\":\"" + orderId + "\"}");

        // when
        orderService.handleStockReserveFailed(eventId, payload);

        // then — Saga Compensation başlatıldı
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);

        ArgumentCaptor<OutboxEvent> outboxCaptor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(outboxCaptor.capture());
        assertThat(outboxCaptor.getValue().getEventType()).isEqualTo("refund.payment");
    }

    // ─── Yardımcı Metodlar ──────────────────────────────────────────────────────

    private Order buildOrder(UUID id, OrderStatus status) {
        Order order = new Order();
        order.setId(id);
        order.setStatus(status);
        order.setProductId(productId);
        order.setQuantity(2);
        order.setTotalPrice(new BigDecimal("200.00"));
        return order;
    }
}
