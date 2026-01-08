package com.luxurydecor.order_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Entity
@Table(name = "carts", schema = "order_schema")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Cart {
    @Id
    @Column(name = "cart_id")
    private String cartId;

    @Column(name = "user_id", nullable = false)
    private Integer userId; // Tham chiếu logic

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> cartItems;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (this.cartId == null) {
            this.cartId = "NR" + (100000 + ThreadLocalRandom.current().nextInt(900000));
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
