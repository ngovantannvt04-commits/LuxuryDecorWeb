package com.luxurydecor.order_service.entity;

import com.luxurydecor.order_service.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Entity
@Table(name = "orders", schema = "order_schema")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id
    @Column(name = "order_id")
    private String orderId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    // --- Thông tin người nhận ---
    @Column(name = "full_name")
    private String fullName;
    private String email;
    @Column(name = "phone_number")
    private String phoneNumber;
    private String address;
    private String note;

    // --- Order infor ---
    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(name = "total_money")
    private Double totalMoney;

    @Column(name = "shipping_method")
    private String shippingMethod;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "shipping_date")
    private LocalDateTime shippingDate;

    @Column(name = "tracking_number")
    private String trackingNumber;

    private Boolean active;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderDetail> orderDetails;

    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
        if (status == null) status = OrderStatus.PENDING;
        if (active == null) active = true;
        if (this.orderId == null) {
            // Random từ 100000 đến 999999
            int randomNum = 100000 + ThreadLocalRandom.current().nextInt(900000);
            this.orderId = "OD" + randomNum;
        }
    }
}
