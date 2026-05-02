package com.alimertkaya.payment.api.controller;

import com.alimertkaya.payment.api.response.PaymentResponse;
import com.alimertkaya.payment.api.response.RefundResponse;
import com.alimertkaya.payment.application.service.PaymentQueryService;
import com.alimertkaya.payment.application.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentQueryService paymentQueryService;
    private final RefundService refundService;

    @GetMapping
    public List<PaymentResponse> getAllPayments() {
        return paymentQueryService.getAllPayments();
    }

    @GetMapping("/refunds")
    public List<RefundResponse> getAllRefunds() {
        return refundService.getAllRefunds();
    }
}
