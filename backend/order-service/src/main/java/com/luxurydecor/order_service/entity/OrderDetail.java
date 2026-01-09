package com.luxurydecor.order_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_details", schema = "order_schema")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @Column(name = "price_snapshot")
    private Double price; // Giá tại thời điểm mua
    private Integer quantity;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "thumbnail")
    private String thumbnail;

    private String color;
}
