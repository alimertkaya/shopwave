package com.alimertkaya.inventory.domain.enums;

public enum OutboxStatus {
    PENDING, // kafkaya gonderilmedi, bekliyor
    PUBLISHED, // gonderildi
    FAILED
}
