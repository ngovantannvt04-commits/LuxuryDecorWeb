package com.luxurydecor.identity_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "otps", schema = "auth_schema")
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "otp_id")
    private Integer otpId;

    private String email;
    @Column(name = "otp_code")
    private String otpCode;
    @Column(name = "expired_at")
    private LocalDateTime expirationTime;
    private String tempUsername;
    private String tempPassword;
}
