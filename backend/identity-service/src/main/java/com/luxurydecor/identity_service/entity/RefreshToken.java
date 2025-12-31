package com.luxurydecor.identity_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "refresh_token", schema = "auth_schema")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token; // Chuỗi token (thường là UUID)

    @Column(nullable = false)
    private LocalDateTime expiryDate; // Thời gian hết hạn

    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id")
    private Account account;
}
