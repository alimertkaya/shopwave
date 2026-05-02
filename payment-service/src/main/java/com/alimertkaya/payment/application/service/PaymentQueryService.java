package com.alimertkaya.payment.application.service;

import com.alimertkaya.payment.api.response.PaymentResponse;

import java.util.List;

public interface PaymentQueryService {

    /**
     * Tüm ödeme kayıtlarını döndürür (admin).
     *
     * @return Ödeme listesi
     */
    List<PaymentResponse> getAllPayments();
}
