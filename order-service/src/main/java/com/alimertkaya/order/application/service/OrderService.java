package com.alimertkaya.order.application.service;

import com.alimertkaya.order.api.request.CreateOrderRequest;
import com.alimertkaya.order.api.response.DashboardStatsResponse;
import com.alimertkaya.order.api.response.InventoryEventPayload;
import com.alimertkaya.order.api.response.OrderResponse;
import com.alimertkaya.order.api.response.OrderStatusCountResponse;
import com.alimertkaya.order.api.response.PaymentEventPayload;
import com.alimertkaya.order.api.response.ShippingEventPayload;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    /**
     * Yeni bir sipariş oluşturur. Ürün bilgisini ProductService'ten çeker,
     * fiyatı hesaplar ve Outbox aracılığıyla 'order.created' event'ini yayınlar.
     *
     * @param request Sipariş oluşturma isteği (userId, productId, quantity)
     * @return Oluşturulan siparişin özet bilgisi
     */
    OrderResponse createOrder(CreateOrderRequest request);

    /**
     * Belirli bir kullanıcıya ait tüm siparişleri döndürür.
     *
     * @param userId Kullanıcının kimliği
     * @return Kullanıcıya ait sipariş listesi
     */
    List<OrderResponse> getOrdersByUserId(String userId);

    /**
     * Tüm siparişleri döndürür (admin).
     *
     * @return Tüm sipariş listesi
     */
    List<OrderResponse> getAllOrders();

    /**
     * Belirtilen ID'ye sahip siparişi döndürür.
     *
     * @param id Sipariş ID'si
     * @return Sipariş bilgisi
     */
    OrderResponse getOrderById(UUID id);

    /**
     * Admin dashboard için özet istatistikleri döndürür.
     *
     * @return Toplam gelir, sipariş sayısı ve durum dağılımı
     */
    DashboardStatsResponse getDashboardStats();

    /**
     * Sipariş durumlarına göre dağılımı döndürür.
     *
     * @return Her durum için sipariş sayısı listesi
     */
    List<OrderStatusCountResponse> getOrderStatusCounts();

    /**
     * Ödeme başarısız olduğunda (payment.failed event) çağrılır.
     * Siparişi CANCELLED statüsüne çeker. Idempotent çağrıları destekler.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Ödeme event payload'ı
     */
    void handlePaymentFailed(UUID eventId, PaymentEventPayload payload);

    /**
     * Ödeme başarılı olduğunda (payment.success event) çağrılır.
     * Siparişi PAYMENT_PROCESSED statüsüne çeker ve 'reserve.stock' event'ini tetikler.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Ödeme event payload'ı
     */
    void handlePaymentSuccess(UUID eventId, PaymentEventPayload payload);

    /**
     * Stok başarıyla rezerve edildiğinde (stock.reserved event) çağrılır.
     * Siparişi STOCK_RESERVED statüsüne çeker ve 'start.shipment' event'ini tetikler.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Stok event payload'ı
     */
    void handleStockReserved(UUID eventId, InventoryEventPayload payload);

    /**
     * Stok yetersiz olduğunda (stock.reserve.failed event) çağrılır. Saga compensation
     * başlatır: siparişi CANCELLED yapar ve 'refund.payment' event'ini tetikler.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Stok event payload'ı
     */
    void handleStockReserveFailed(UUID eventId, InventoryEventPayload payload);

    /**
     * Kargo süreci başlatıldığında (shipment.started event) çağrılır.
     * Siparişi SHIPPED statüsüne çeker.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Kargo event payload'ı
     */
    void handleShipmentStarted(UUID eventId, ShippingEventPayload payload);

    /**
     * Admin tarafından sipariş durumunu manuel olarak günceller.
     *
     * @param id     Sipariş ID'si
     * @param status Yeni durum
     * @return Güncellenmiş sipariş bilgisi
     */
    OrderResponse updateOrderStatus(UUID id, com.alimertkaya.order.domain.enums.OrderStatus status);
}