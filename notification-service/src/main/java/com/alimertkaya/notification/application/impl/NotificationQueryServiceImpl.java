package com.alimertkaya.notification.application.impl;

import com.alimertkaya.notification.api.response.NotificationLogResponse;
import com.alimertkaya.notification.application.service.NotificationQueryService;
import com.alimertkaya.notification.infrastructure.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationQueryServiceImpl implements NotificationQueryService {

    private final NotificationLogRepository notificationLogRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationLogResponse> getAllNotifications() {
        return notificationLogRepository.findAll().stream()
                .sorted((a, b) -> b.getSentAt().compareTo(a.getSentAt()))
                .map(n -> new NotificationLogResponse(n.getId(), n.getOrderId(),
                        n.getNotificationType(), n.getMessage(), n.getSentAt()))
                .toList();
    }
}
