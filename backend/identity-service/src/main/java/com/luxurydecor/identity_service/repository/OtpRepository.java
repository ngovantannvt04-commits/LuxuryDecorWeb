package com.luxurydecor.identity_service.repository;

import com.luxurydecor.identity_service.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Integer> {
    Optional<Otp> findByEmailAndOtpCode(String email, String otpCode);
    Optional<Otp> findByEmail(String email);
}
