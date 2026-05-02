package com.alimertkaya.payment.application.impl;

import com.alimertkaya.payment.api.dto.OrderEventPayload;
import com.alimertkaya.payment.application.service.PaymentService;
import com.alimertkaya.payment.domain.entity.OutboxEvent;
import com.alimertkaya.payment.domain.entity.Payment;
import com.alimertkaya.payment.domain.entity.ProcessedEvent;
import com.alimertkaya.payment.domain.enums.OutboxStatus;
import com.alimertkaya.payment.infrastructure.repository.OutboxRepository;
import com.alimertkaya.payment.infrastructure.repository.PaymentRepository;
import com.alimertkaya.payment.infrastructure.repository.ProcessedEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OutboxRepository outboxRepository;
    private final ProcessedEventRepository processedEventRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public void processPayment(UUID eventId, OrderEventPayload orderPayload) {

        // idempotency kontrol
        if (processedEventRepository.existsByEventId(eventId)) {
            log.warn("Bu Kafka mesajı daha önce işlenmiş, atlanıyor! Event ID: {}", eventId);
            return;
        }

        log.info("Sipariş ödemesi işleniyor... Order ID: {}, Tutar: {}", orderPayload.id(), orderPayload.totalPrice());
        boolean isPaymentSuccessful = orderPayload.totalPrice().compareTo(new java.math.BigDecimal("100000")) < 0;

        String nextTopic = isPaymentSuccessful ? "payment.success" : "payment.failed";

        paymentRepository.save(Payment.builder()
                .orderId(orderPayload.id())
                .amount(orderPayload.totalPrice())
                .status(isPaymentSuccessful ? "SUCCESS" : "FAILED")
                .build());

        UUID outboxEventId = UUID.randomUUID();
        OutboxEvent outboxEvent = OutboxEvent.builder()
                .eventId(outboxEventId)
                .eventType(nextTopic)
                .aggregateId(orderPayload.id().toString())
                .payload("{\"eventId\":\"" + outboxEventId + "\",\"orderId\":\"" + orderPayload.id() + "\"}")
                .status(OutboxStatus.PENDING)
                .build();

        outboxRepository.save(outboxEvent);

        // mesaj islendi olarak isaretlenir
        ProcessedEvent processedEvent = ProcessedEvent.builder()
                .eventId(eventId)
                .eventType("order.created")
                .processedAt(LocalDateTime.now())
                .build();
        processedEventRepository.save(processedEvent);

        log.info("Ödeme işlemi tamamlandı. Sonuç: {}", nextTopic);
    }
}
