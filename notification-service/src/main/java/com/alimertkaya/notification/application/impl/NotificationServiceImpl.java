package com.alimertkaya.notification.application.impl;

import com.alimertkaya.notification.api.dto.NotificationPayload;
import com.alimertkaya.notification.application.service.NotificationService;
import com.alimertkaya.notification.domain.entity.NotificationLog;
import com.alimertkaya.notification.infrastructure.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationLogRepository notificationRepository;

    @Override
    @Transactional
    public void sendShipmentEmail(UUID eventId, NotificationPayload payload) {
        if (notificationRepository.existsByEventId(eventId)) return;

        String emailBody = String.format("Sayın Müşterimiz, %s numaralı siparişiniz kargoya verilmiştir. Takip Numaranız: %s. Bizi tercih ettiğiniz için teşekkür ederiz!",
                payload.orderId(), payload.trackingNumber());

        log.info("\n================= E-POSTA GÖNDERİLDİ =================\n{}\n======================================================", emailBody);

        saveLog(eventId, payload.orderId(), "EMAIL", emailBody);
    }

    @Override
    @Transactional
    public void sendPaymentFailedEmail(UUID eventId, NotificationPayload payload) {
        if (notificationRepository.existsByEventId(eventId)) return;

        String smsBody = String.format("Dikkat: %s numaralı siparişinizin ödemesi alınamadığı (veya stok yetersizliği) için siparişiniz iptal edilmiştir. Ücret iadeniz başlatılacaktır.",
                payload.orderId());

        log.info("\n================= SMS GÖNDERİLDİ =====================\n{}\n======================================================", smsBody);

        saveLog(eventId, payload.orderId(), "SMS", smsBody);
    }

    private void saveLog(UUID eventId, UUID orderId, String type, String message) {
        NotificationLog notificationLog = NotificationLog.builder()
                .eventId(eventId)
                .orderId(orderId)
                .notificationType(type)
                .message(message)
                .build();
        notificationRepository.save(notificationLog);
    }
}
