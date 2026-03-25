package com.luxurydecor.product_service.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Integer accountId;
    private Integer rating;
    private String comment;
}
