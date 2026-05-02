package com.alimertkaya.payment.infrastructure.kafka.consumer;

import com.alimertkaya.payment.application.service.RefundService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefundEventConsumer {

    private final RefundService refundService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "refund.payment", groupId = "payment-refund-group")
    public void consume(String message) {
        log.info("refund.payment event'i alındı: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);

            UUID orderId = UUID.fromString(root.path("orderId").asText());
            BigDecimal amount = root.has("amount")
                    ? new BigDecimal(root.path("amount").asText())
                    : BigDecimal.ZERO;
            String reason = root.has("reason")
                    ? root.path("reason").asText()
                    : "Stok rezervasyon hatası nedeniyle otomatik iade";

            refundService.recordRefund(orderId, amount, reason);
        } catch (Exception e) {
            log.error("refund.payment event'i işlenirken hata oluştu!", e);
        }
    }
}
