package com.luxurydecor.order_service.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class PlaceOrderRequest {
    private String fullName;
    private String phoneNumber;
    private String address;
    private String note;
    private String paymentMethod;
    private List<Integer> selectedProductIds; // danh sách id sản phẩm trong giỏ
}
