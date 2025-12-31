package com.luxurydecor.identity_service.controller;

import com.luxurydecor.identity_service.dto.LoginRequest;
import com.luxurydecor.identity_service.dto.LoginResponse;
import com.luxurydecor.identity_service.dto.RegisterRequest;
import com.luxurydecor.identity_service.dto.VerifyOtpRequest;
import com.luxurydecor.identity_service.entity.Account;
import com.luxurydecor.identity_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // Bước 2: Người dùng nhập OTP để kích hoạt
    @PostMapping("/verify")
    public ResponseEntity<String> verify(@RequestBody @Valid VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyAccount(request));
    }

    // Bước 3: Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
