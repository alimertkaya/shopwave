package com.alimertkaya.order.api.request;

import com.alimertkaya.order.domain.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull OrderStatus status
) {}
