package com.alimertkaya.notification.application.service;

import com.alimertkaya.notification.api.dto.NotificationPayload;
import java.util.UUID;

public interface NotificationService {

    /**
     * Kargo başlatıldığında müşteriye e-posta bildirimi gönderir (Kafka: shipment.started consumer).
     * Mesajı simüle edip bildirim logunu veritabanına kaydeder.
     * Idempotent: Aynı eventId ile tekrar çağrılırsa işlem atlanır.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Sipariş ID ve kargo takip numarasını içerir
     */
    void sendShipmentEmail(UUID eventId, NotificationPayload payload);

    /**
     * Ödeme başarısız olduğunda veya stok yetersizliğinde müşteriye SMS bildirimi gönderir
     * (Kafka: order.cancelled consumer). Mesajı simüle edip bildirim logunu kaydeder.
     * Idempotent: Aynı eventId ile tekrar çağrılırsa işlem atlanır.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Sipariş ID'sini içerir
     */
    void sendPaymentFailedEmail(UUID eventId, NotificationPayload payload);
}