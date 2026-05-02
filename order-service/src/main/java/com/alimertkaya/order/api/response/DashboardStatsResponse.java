package com.alimertkaya.order.api.response;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        BigDecimal totalRevenue,
        long totalOrders,
        long cancelledOrders,
        long shippedOrders
) {}
