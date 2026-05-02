package com.alimertkaya.notification.application.impl;

import com.alimertkaya.notification.api.dto.NotificationPayload;
import com.alimertkaya.notification.domain.entity.NotificationLog;
import com.alimertkaya.notification.infrastructure.repository.NotificationLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationLogRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private UUID eventId;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        orderId = UUID.randomUUID();
    }

    // ─── sendShipmentEmail ────────────────────────────────────────────────────────

    @Test
    void sendShipmentEmail_whenNewEvent_thenEmailLogSaved() {
        // given
        NotificationPayload payload = new NotificationPayload(orderId, "SHP-ABC123");
        when(notificationRepository.existsByEventId(eventId)).thenReturn(false);

        // when
        notificationService.sendShipmentEmail(eventId, payload);

        // then
        ArgumentCaptor<NotificationLog> captor = ArgumentCaptor.forClass(NotificationLog.class);
        verify(notificationRepository).save(captor.capture());
        NotificationLog saved = captor.getValue();
        assertThat(saved.getNotificationType()).isEqualTo("EMAIL");
        assertThat(saved.getOrderId()).isEqualTo(orderId);
        assertThat(saved.getMessage()).contains("SHP-ABC123");
    }

    @Test
    void sendShipmentEmail_whenDuplicateEvent_thenIgnored() {
        // given
        NotificationPayload payload = new NotificationPayload(orderId, "SHP-XYZ");
        when(notificationRepository.existsByEventId(eventId)).thenReturn(true);

        // when
        notificationService.sendShipmentEmail(eventId, payload);

        // then — Idempotency garantisi
        verify(notificationRepository, never()).save(any());
    }

    // ─── sendPaymentFailedEmail ────────────────────────────────────────────────────

    @Test
    void sendPaymentFailedEmail_whenNewEvent_thenSmsNotificationLogSaved() {
        // given
        NotificationPayload payload = new NotificationPayload(orderId, null);
        when(notificationRepository.existsByEventId(eventId)).thenReturn(false);

        // when
        notificationService.sendPaymentFailedEmail(eventId, payload);

        // then
        ArgumentCaptor<NotificationLog> captor = ArgumentCaptor.forClass(NotificationLog.class);
        verify(notificationRepository).save(captor.capture());
        NotificationLog saved = captor.getValue();
        assertThat(saved.getNotificationType()).isEqualTo("SMS");
        assertThat(saved.getOrderId()).isEqualTo(orderId);
        assertThat(saved.getMessage()).contains("iptal edilmiştir");
    }

    @Test
    void sendPaymentFailedEmail_whenDuplicateEvent_thenIgnored() {
        // given
        NotificationPayload payload = new NotificationPayload(orderId, null);
        when(notificationRepository.existsByEventId(eventId)).thenReturn(true);

        // when
        notificationService.sendPaymentFailedEmail(eventId, payload);

        // then — Idempotency garantisi
        verify(notificationRepository, never()).save(any());
    }
}
