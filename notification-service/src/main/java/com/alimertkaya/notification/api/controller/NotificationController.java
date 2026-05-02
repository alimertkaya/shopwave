package com.alimertkaya.notification.api.controller;

import com.alimertkaya.notification.api.response.NotificationLogResponse;
import com.alimertkaya.notification.application.service.NotificationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationQueryService notificationQueryService;

    @GetMapping
    public List<NotificationLogResponse> getAllNotifications() {
        return notificationQueryService.getAllNotifications();
    }
}
