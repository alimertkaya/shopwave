package com.alimertkaya.payment.application.impl;

import com.alimertkaya.payment.api.dto.OrderEventPayload;
import com.alimertkaya.payment.domain.entity.OutboxEvent;
import com.alimertkaya.payment.domain.entity.ProcessedEvent;
import com.alimertkaya.payment.infrastructure.repository.OutboxRepository;
import com.alimertkaya.payment.infrastructure.repository.PaymentRepository;
import com.alimertkaya.payment.infrastructure.repository.ProcessedEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock private OutboxRepository outboxRepository;
    @Mock private ProcessedEventRepository processedEventRepository;
    @Mock private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private UUID eventId;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        orderId = UUID.randomUUID();
    }

    // ─── processPayment ───────────────────────────────────────────────────────────

    @Test
    void processPayment_whenAmountUnderThreshold_thenPaymentSuccessEventPublished() {
        // given — 99.999 TL, eşiğin altında → başarılı
        OrderEventPayload payload = new OrderEventPayload(orderId, UUID.randomUUID(), new BigDecimal("99999.00"));
        when(processedEventRepository.existsByEventId(eventId)).thenReturn(false);

        // when
        paymentService.processPayment(eventId, payload);

        // then
        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(captor.capture());
        assertThat(captor.getValue().getEventType()).isEqualTo("payment.success");
        verify(processedEventRepository).save(any(ProcessedEvent.class));
    }

    @Test
    void processPayment_whenAmountOverThreshold_thenPaymentFailedEventPublished() {
        // given — 100.001 TL, eşiğin üstünde → başarısız
        OrderEventPayload payload = new OrderEventPayload(orderId, UUID.randomUUID(), new BigDecimal("100001.00"));
        when(processedEventRepository.existsByEventId(eventId)).thenReturn(false);

        // when
        paymentService.processPayment(eventId, payload);

        // then — Saga compensation başlatılmalı
        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(captor.capture());
        assertThat(captor.getValue().getEventType()).isEqualTo("payment.failed");
    }

    @Test
    void processPayment_whenDuplicateEvent_thenIgnored() {
        // given
        OrderEventPayload payload = new OrderEventPayload(orderId, UUID.randomUUID(), new BigDecimal("500.00"));
        when(processedEventRepository.existsByEventId(eventId)).thenReturn(true);

        // when
        paymentService.processPayment(eventId, payload);

        // then — Idempotency garantisi
        verifyNoInteractions(outboxRepository);
        verify(processedEventRepository, never()).save(any());
    }
}
