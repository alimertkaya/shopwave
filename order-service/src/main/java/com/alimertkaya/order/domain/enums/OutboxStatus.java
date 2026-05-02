package com.alimertkaya.order.domain.enums;

public enum OutboxStatus {
    PENDING, // kafkaya gonderilmedi, bekliyor
    PUBLISHED, // gonderildi
    FAILED
}
