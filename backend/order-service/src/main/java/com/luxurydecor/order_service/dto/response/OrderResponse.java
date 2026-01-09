package com.luxurydecor.order_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private String orderId;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String status;
    private Double totalMoney;
    private LocalDateTime orderDate;
    private List<OrderDetailResponse> orderDetails;
}
