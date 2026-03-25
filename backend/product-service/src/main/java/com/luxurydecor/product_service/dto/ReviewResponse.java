package com.luxurydecor.product_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Integer reviewId;
    private String accountName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
