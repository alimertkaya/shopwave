package com.alimertkaya.notification.application.service;

import com.alimertkaya.notification.api.response.NotificationLogResponse;

import java.util.List;

public interface NotificationQueryService {

    /**
     * Tüm bildirim kayıtlarını döndürür (admin).
     *
     * @return Bildirim listesi
     */
    List<NotificationLogResponse> getAllNotifications();
}
