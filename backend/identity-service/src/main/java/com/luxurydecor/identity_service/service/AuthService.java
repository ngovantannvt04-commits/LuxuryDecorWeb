package com.luxurydecor.identity_service.service;

import com.luxurydecor.identity_service.dto.*;
import com.luxurydecor.identity_service.entity.Account;
import com.luxurydecor.identity_service.entity.Otp;
import com.luxurydecor.identity_service.repository.AccountRepository;
import com.luxurydecor.identity_service.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private AccountRepository repository;
    @Autowired
    private OtpRepository otpRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private EmailService emailService;

    public String register(RegisterRequest request) {

        if (!request.getPassword().equals(request.getRepassword())) {
            throw new RuntimeException("Mật khẩu nhập lại không khớp!");
        }

        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        String otpCode = generateAndSaveOtp(request.getEmail(), request.getUsername(), encodedPassword);

        // Gửi Email
        emailService.sendOtpEmail(request.getEmail(), otpCode);

        return "Mã OTP đã gửi đến email. Vui lòng nhập mã để hoàn tất đăng ký.";
    }

    private String generateAndSaveOtp(String email, String tempUsername, String tempPassword) {
        // Xóa OTP cũ nếu tồn tại để tránh rác
        otpRepository.findByEmail(email).ifPresent(otpRepository::delete);

        // Sinh mã OTP ngẫu nhiên
        String otpCode = String.valueOf(new Random().nextInt(900000) + 100000);

        // Tạo đối tượng OTP
        Otp otpEntry = new Otp();
        otpEntry.setEmail(email);
        otpEntry.setOtpCode(otpCode);
        otpEntry.setExpirationTime(LocalDateTime.now().plusMinutes(2)); // Hết hạn sau 2 phút

        // Nếu có thông tin đăng ký tạm thời thì lưu vào
        if (tempUsername != null) otpEntry.setTempUsername(tempUsername);
        if (tempPassword != null) otpEntry.setTempPassword(tempPassword);

        // Lưu xuống DB
        otpRepository.save(otpEntry);

        return otpCode;
    }

    public String verifyAccount(VerifyOtpRequest request) {
        // Tìm trong bảng Otp
        Otp otpEntity = otpRepository.findByEmailAndOtpCode(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new RuntimeException("Mã OTP không chính xác"));

        // Check hết hạn
        if (otpEntity.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn, vui lòng đăng ký lại");
        }

        // LẤY THÔNG TIN TỪ BẢNG OTP -> LƯU SANG BẢNG USER (ACCOUNT)
        Account newUser = new Account();
        newUser.setEmail(otpEntity.getEmail());
        newUser.setUsername(otpEntity.getTempUsername());
        newUser.setPassword(otpEntity.getTempPassword());
        repository.save(newUser);

        // Xóa OTP đã dùng để dọn dẹp
        otpRepository.delete(otpEntity);

        return "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.";
    }
    public LoginResponse login(LoginRequest request) {
        try {
            // 1. Dùng AuthenticationManager để xác thực
            // Hàm này mã hóa password người dùng nhập và so sánh với password hash trong DB
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            // Nếu sai pass hoặc username không tồn tại, Spring ném exception
            throw new RuntimeException("Tài khoản hoặc mật khẩu không chính xác");
        }

        Account user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Sinh JWT Token và trả về
        String jwtToken = jwtService.generateToken(String.valueOf(user));
        return LoginResponse.builder()
                .token(jwtToken)
                .message("Đăng nhập thành công")
                .id(user.getAccountId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role("CUSTOMER")
                .build();
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        // Kiểm tra email có tồn tại trong hệ thống không
        Account account = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email này chưa được đăng ký"));

        String otpCode = generateAndSaveOtp(request.getEmail(), null, null);
        emailService.sendOtpEmail(request.getEmail(), otpCode);

        return "Mã xác thực đã được gửi đến email. Vui lòng kiểm tra.";
    }

    public String resetPassword(ResetPasswordRequest request) {
        // Check mật khẩu nhập lại
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        // Tìm và check OTP trong DB
        Otp otpEntity = otpRepository.findByEmailAndOtpCode(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new RuntimeException("Mã OTP không chính xác"));

        if (otpEntity.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn");
        }

        // Lấy User ra để đổi pass
        Account user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(user);

        // 5. Xóa OTP sau khi dùng xong
        otpRepository.delete(otpEntity);

        return "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.";
    }
}
