package com.alimertkaya.payment.application.impl;

import com.alimertkaya.payment.api.response.RefundResponse;
import com.alimertkaya.payment.application.service.RefundService;
import com.alimertkaya.payment.domain.entity.Refund;
import com.alimertkaya.payment.infrastructure.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;

    @Override
    @Transactional
    public void recordRefund(UUID orderId, BigDecimal amount, String reason) {
        if (refundRepository.existsByOrderId(orderId)) {
            log.warn("Bu sipariş için iade zaten kaydedilmiş, atlanıyor. Order ID: {}", orderId);
            return;
        }

        Refund refund = Refund.builder()
                .orderId(orderId)
                .amount(amount)
                .reason(reason)
                .status("COMPLETED")
                .completedAt(LocalDateTime.now())
                .build();

        refundRepository.save(refund);
        log.info("İade kaydedildi. Order ID: {}, Tutar: {}", orderId, amount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponse> getAllRefunds() {
        return refundRepository.findAll().stream()
                .sorted((a, b) -> b.getRequestedAt().compareTo(a.getRequestedAt()))
                .map(r -> new RefundResponse(
                        r.getId(),
                        r.getOrderId(),
                        r.getAmount(),
                        r.getReason(),
                        r.getStatus(),
                        r.getRequestedAt(),
                        r.getCompletedAt()
                ))
                .toList();
    }
}
