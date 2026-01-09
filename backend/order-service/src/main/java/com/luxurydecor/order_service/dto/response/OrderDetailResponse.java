package com.luxurydecor.order_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderDetailResponse {
    private Integer productId;
    private String productName; // thuộc tinhs này gọi bên product-service
    private Integer quantity;
    private Double price;
    private Double totalPrice;
}
