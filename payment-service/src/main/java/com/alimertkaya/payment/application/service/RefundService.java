package com.alimertkaya.payment.application.service;

import com.alimertkaya.payment.api.response.RefundResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface RefundService {
    /**
     * refund.payment Kafka event'inden tetiklenir; iadeyi kaydeder.
     */
    void recordRefund(UUID orderId, BigDecimal amount, String reason);

    /**
     * Admin paneli için tüm iade kayıtlarını döner.
     */
    List<RefundResponse> getAllRefunds();
}
