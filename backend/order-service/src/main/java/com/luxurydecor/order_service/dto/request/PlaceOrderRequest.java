package com.luxurydecor.order_service.dto.request;

import lombok.Data;

@Data
public class PlaceOrderRequest {
    private String fullName;
    private String phoneNumber;
    private String address;
    private String note;
    private String paymentMethod;
}
