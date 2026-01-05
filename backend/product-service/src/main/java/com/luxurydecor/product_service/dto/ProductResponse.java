package com.luxurydecor.product_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Integer productId;
    private String productName;
    private Long price;
    private String image;
    private String description;
    private Integer stockQuantity;
    private Integer quantitySold;
    private String categoryName;
    private LocalDateTime createdAt;
}
