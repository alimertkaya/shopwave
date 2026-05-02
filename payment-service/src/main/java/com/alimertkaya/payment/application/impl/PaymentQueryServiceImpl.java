package com.alimertkaya.payment.application.impl;

import com.alimertkaya.payment.api.response.PaymentResponse;
import com.alimertkaya.payment.application.service.PaymentQueryService;
import com.alimertkaya.payment.infrastructure.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentQueryServiceImpl implements PaymentQueryService {

    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(p -> new PaymentResponse(p.getId(), p.getOrderId(), p.getAmount(), p.getStatus(), p.getCreatedAt()))
                .toList();
    }
}
