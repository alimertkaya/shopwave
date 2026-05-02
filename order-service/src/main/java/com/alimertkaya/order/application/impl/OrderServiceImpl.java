package com.alimertkaya.order.application.impl;

import com.alimertkaya.order.api.request.CreateOrderRequest;
import com.alimertkaya.order.api.response.DashboardStatsResponse;
import com.alimertkaya.order.api.response.InventoryEventPayload;
import com.alimertkaya.order.api.response.OrderResponse;
import com.alimertkaya.order.api.response.OrderStatusCountResponse;
import com.alimertkaya.order.api.response.PaymentEventPayload;
import com.alimertkaya.order.api.response.ShippingEventPayload;
import com.alimertkaya.order.domain.exception.EntityNotFoundException;
import com.alimertkaya.order.application.mapper.OrderMapper;
import com.alimertkaya.order.application.service.OrderService;
import com.alimertkaya.order.domain.entity.Order;
import com.alimertkaya.order.domain.entity.OutboxEvent;
import com.alimertkaya.order.domain.entity.ProcessedEvent;
import com.alimertkaya.order.domain.enums.OrderStatus;
import com.alimertkaya.order.domain.enums.OutboxStatus;
import com.alimertkaya.order.domain.exception.BusinessException;
import com.alimertkaya.order.infrastructure.client.ProductClient;
import com.alimertkaya.order.infrastructure.client.ProductDto;
import com.alimertkaya.order.infrastructure.repository.OrderRepository;
import com.alimertkaya.order.infrastructure.repository.OutboxRepository;
import com.alimertkaya.order.infrastructure.repository.ProcessedEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final OrderMapper orderMapper;
    private final ProcessedEventRepository processedEventRepository;
    private final ObjectMapper objectMapper; // java object --> JSON
    private final ProductClient productClient; // Feign Client

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Sipariş oluşturma isteği alındı. Ürün ID: {}, Adet: {}", request.productId(), request.quantity());

        ProductDto product = productClient.getProductById(request.productId())
                .orElseThrow(() -> new BusinessException("PRODUCT_UNAVAILABLE",
                        "Ürün bulunamadı veya şu an sistemlerimize ulaşılamıyor. Lütfen daha sonra tekrar deneyiniz."));

        Order order = orderMapper.toEntity(request);
        BigDecimal realTotalPrice = product.price().multiply(new BigDecimal(request.quantity()));
        order.setTotalPrice(realTotalPrice);
        order.setStatus(OrderStatus.CREATED);
        orderRepository.save(order);

        try {
            OutboxEvent event = OutboxEvent.builder()
                    .eventId(UUID.randomUUID())
                    .eventType("order.created")
                    .aggregateId(order.getId().toString())
                    .payload(objectMapper.writeValueAsString(order))
                    .status(OutboxStatus.PENDING)
                    .build();

            outboxRepository.save(event);
            log.info("Sipariş alındı ve Outbox kaydı oluşturuldu. Order ID: {}", order.getId());
        } catch (JsonProcessingException e) {
            log.error("JSON dönüştürme hatası!", e);
            throw new RuntimeException("Outbox payload oluşturulamadı", e);
        }
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void handlePaymentFailed(UUID eventId, PaymentEventPayload payload) {
        if (processedEventRepository.existsByEventId(eventId)) return;

        log.info("Ödeme BAŞARISIZ mesajı alındı. Sipariş iptal ediliyor. Order ID: {}", payload.orderId());

        Order order = orderRepository.findById(payload.orderId())
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı: " + payload.orderId()));

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        processedEventRepository.save(ProcessedEvent.builder()
                .eventId(eventId)
                .eventType("payment.failed")
                .processedAt(LocalDateTime.now())
                .build());
    }

    @Override
    @Transactional
    public void handlePaymentSuccess(UUID eventId, PaymentEventPayload payload) {
        if (processedEventRepository.existsByEventId(eventId)) return;

        log.info("Ödeme BAŞARILI mesajı alındı. Stok rezervasyonuna geçiliyor. Order ID: {}", payload.orderId());

        Order order = orderRepository.findById(payload.orderId())
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı: " + payload.orderId()));

        order.setStatus(OrderStatus.PAYMENT_PROCESSED);
        orderRepository.save(order);

        try {
            record InventoryPayload(String orderId, String productId, int quantity) {}
            String inventoryPayload = objectMapper.writeValueAsString(
                    new InventoryPayload(order.getId().toString(), order.getProductId().toString(), order.getQuantity()));

            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .eventId(UUID.randomUUID())
                    .eventType("reserve.stock")
                    .aggregateId(order.getId().toString())
                    .payload(inventoryPayload)
                    .status(OutboxStatus.PENDING)
                    .build();

            outboxRepository.save(outboxEvent);
        } catch (Exception e) {
            log.error("Outbox payload oluşturulamadı", e);
            throw new RuntimeException("Stok rezervasyon mesajı oluşturulamadı", e);
        }

        processedEventRepository.save(ProcessedEvent.builder()
                .eventId(eventId)
                .eventType("payment.success")
                .processedAt(LocalDateTime.now())
                .build());
    }

    @Override
    @Transactional
    public void handleStockReserveFailed(UUID eventId, InventoryEventPayload payload) {
        if (processedEventRepository.existsByEventId(eventId)) return;

        log.error("STOK YETERSİZ mesajı alındı! Sipariş iptal ediliyor ve para iadesi (Refund) başlatılıyor. Order ID: {}", payload.orderId());

        Order order = orderRepository.findById(payload.orderId())
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı: " + payload.orderId()));

        // durumu iptal yap
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // saga compensation - para iade
        try {
            record RefundPayload(String orderId, String amount, String reason) {}
            String refundPayload = objectMapper.writeValueAsString(
                    new RefundPayload(
                            order.getId().toString(),
                            order.getTotalPrice() != null ? order.getTotalPrice().toPlainString() : "0",
                            "Stok rezervasyon hatası nedeniyle otomatik iade"
                    ));

            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .eventId(UUID.randomUUID())
                    .eventType("refund.payment")
                    .aggregateId(order.getId().toString())
                    .payload(refundPayload)
                    .status(OutboxStatus.PENDING)
                    .build();
            outboxRepository.save(outboxEvent);
        } catch (Exception e) {
            log.error("Refund outbox payload oluşturulamadı", e);
            throw new RuntimeException("Para iade mesajı oluşturulamadı", e);
        }

        processedEventRepository.save(ProcessedEvent.builder()
                .eventId(eventId)
                .eventType("stock.reserve.failed")
                .processedAt(LocalDateTime.now())
                .build());
    }

    @Override
    @Transactional
    public void handleStockReserved(UUID eventId, InventoryEventPayload payload) {
        if (processedEventRepository.existsByEventId(eventId)) return;

        log.info("STOK REZERVE EDİLDİ mesajı alındı. Kargo süreci başlatılıyor! Order ID: {}", payload.orderId());

        Order order = orderRepository.findById(payload.orderId())
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı: " + payload.orderId()));

        // stok durumu rezerve edilir
        order.setStatus(OrderStatus.STOCK_RESERVED);
        orderRepository.save(order);

        try {
            record ShipmentPayload(String orderId) {}
            String shipmentPayload = objectMapper.writeValueAsString(new ShipmentPayload(order.getId().toString()));

            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .eventId(UUID.randomUUID())
                    .eventType("start.shipment")
                    .aggregateId(order.getId().toString())
                    .payload(shipmentPayload)
                    .status(OutboxStatus.PENDING)
                    .build();
            outboxRepository.save(outboxEvent);
        } catch (Exception e) {
            log.error("Shipment outbox payload oluşturulamadı", e);
            throw new RuntimeException("Kargo başlatma mesajı oluşturulamadı", e);
        }

        processedEventRepository.save(ProcessedEvent.builder()
                .eventId(eventId)
                .eventType("stock.reserved")
                .processedAt(LocalDateTime.now())
                .build());

    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        return orderRepository.findById(id)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Sipariş bulunamadı: " + id));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sipariş bulunamadı: " + id));
        order.setStatus(status);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalPrice)
                .filter(p -> p != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long cancelled = orders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();
        long shipped = orders.stream().filter(o -> o.getStatus() == OrderStatus.SHIPPED).count();
        return new DashboardStatsResponse(totalRevenue, orders.size(), cancelled, shipped);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusCountResponse> getOrderStatusCounts() {
        Map<OrderStatus, Long> counts = orderRepository.findAll().stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
        return counts.entrySet().stream()
                .map(e -> new OrderStatusCountResponse(e.getKey().name(), e.getValue()))
                .toList();
    }

    @Override
    @Transactional
    public void handleShipmentStarted(UUID eventId, ShippingEventPayload payload) {
        if (processedEventRepository.existsByEventId(eventId)) return;

        log.info("KARGO BAŞLATILDI mesajı alındı! Sipariş durumu güncelleniyor. Order ID: {}, Takip No: {}",
                payload.orderId(), payload.trackingNumber());

        Order order = orderRepository.findById(payload.orderId())
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı: " + payload.orderId()));

        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        processedEventRepository.save(ProcessedEvent.builder()
                .eventId(eventId)
                .eventType("shipment.started")
                .processedAt(LocalDateTime.now())
                .build());
    }
}