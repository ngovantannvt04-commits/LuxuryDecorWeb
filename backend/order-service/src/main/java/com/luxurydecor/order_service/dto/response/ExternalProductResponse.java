package com.luxurydecor.order_service.dto.response;

import lombok.Data;

@Data
public class ExternalProductResponse {
    private Integer productId;
    private String productName;
    private Double price;
    private String image;
    private Integer stockQuantity;
}
