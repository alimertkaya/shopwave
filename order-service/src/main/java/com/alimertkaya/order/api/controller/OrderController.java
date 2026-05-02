package com.alimertkaya.order.api.controller;

import com.alimertkaya.order.api.request.CreateOrderRequest;
import com.alimertkaya.order.api.request.UpdateOrderStatusRequest;
import com.alimertkaya.order.api.response.DashboardStatsResponse;
import com.alimertkaya.order.api.response.OrderResponse;
import com.alimertkaya.order.api.response.OrderStatusCountResponse;
import com.alimertkaya.order.application.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/user/{userId}")
    public List<OrderResponse> getOrdersByUserId(@PathVariable String userId) {
        return orderService.getOrdersByUserId(userId);
    }

    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable UUID id) {
        return orderService.getOrderById(id);
    }

    @PutMapping("/{id}/status")
    public OrderResponse updateOrderStatus(@PathVariable UUID id,
                                           @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(id, request.status());
    }

    @GetMapping("/admin/stats")
    public DashboardStatsResponse getDashboardStats() {
        return orderService.getDashboardStats();
    }

    @GetMapping("/admin/status-counts")
    public List<OrderStatusCountResponse> getOrderStatusCounts() {
        return orderService.getOrderStatusCounts();
    }
}
