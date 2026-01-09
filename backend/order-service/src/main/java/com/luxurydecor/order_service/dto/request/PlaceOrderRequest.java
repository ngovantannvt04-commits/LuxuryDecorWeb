package com.luxurydecor.order_service.dto.request;

import lombok.Data;

@Data
public class PlaceOrderRequest {
    private Integer userId; // Tạm thời gửi userId (sau này lấy từ Token)
    private String fullName;
    private String phoneNumber;
    private String address;
    private String note;
    private String paymentMethod;
}
