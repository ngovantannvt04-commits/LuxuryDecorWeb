package com.luxurydecor.order_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderStatsResponse {
    private Double totalRevenue;
    private Long totalOrders;
    private Long pendingOrders;
    private Long shippingOrders;
    private Long successOrders;
    private Long cancelledOrders;
}
