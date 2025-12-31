package com.luxurydecor.identity_service.service;

import com.luxurydecor.identity_service.dto.LoginRequest;
import com.luxurydecor.identity_service.dto.LoginResponse;
import com.luxurydecor.identity_service.dto.RegisterRequest;
import com.luxurydecor.identity_service.dto.VerifyOtpRequest;
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

        // 3. Xử lý OTP cũ (nếu có user đang đăng ký dở dang thì xóa cái cũ đi tạo cái mới)
        Optional<Otp> existingOtp = otpRepository.findByEmail(request.getEmail());
        existingOtp.ifPresent(otpRepository::delete);

        // 4. Tạo OTP mới & Lưu tạm thông tin user vào bảng OTP
        String otpCode = String.valueOf(new Random().nextInt(900000) + 100000);

        Otp otpEntry = new Otp();
        otpEntry.setEmail(request.getEmail());
        otpEntry.setOtpCode(otpCode);
        otpEntry.setExpirationTime(LocalDateTime.now().plusMinutes(2));

        // LƯU TẠM THÔNG TIN ĐĂNG KÝ VÀO ĐÂY
        otpEntry.setTempUsername(request.getUsername());
        otpEntry.setTempPassword(passwordEncoder.encode(request.getPassword())); // Nhớ mã hóa luôn

        otpRepository.save(otpEntry);

        // 5. Gửi Email
        emailService.sendOtpEmail(request.getEmail(), otpCode);

        return "Mã OTP đã gửi đến email. Vui lòng nhập mã để hoàn tất đăng ký.";
    }

    public String verifyAccount(VerifyOtpRequest request) {
        // 1. Tìm trong bảng Otp
        Otp otpEntity = otpRepository.findByEmailAndOtpCode(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new RuntimeException("Mã OTP không chính xác"));

        // 2. Check hết hạn
        if (otpEntity.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn, vui lòng đăng ký lại");
        }

        // 3. LẤY THÔNG TIN TỪ BẢNG OTP -> LƯU SANG BẢNG USER (ACCOUNT)
        // Lúc này mới thực sự tạo user
        Account newUser = new Account();
        newUser.setEmail(otpEntity.getEmail());
        newUser.setUsername(otpEntity.getTempUsername());
        newUser.setPassword(otpEntity.getTempPassword()); // Pass này đã encode ở bước 1 rồi
        // newUser.setEnabled(true); // Nếu bạn bỏ logic enabled thì chỗ này không cần, hoặc set true mặc định

        repository.save(newUser);

        // 4. Xóa OTP đã dùng để dọn dẹp
        otpRepository.delete(otpEntity);

        return "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.";
    }
    public LoginResponse login(LoginRequest request) {
        try {
            // 1. Dùng AuthenticationManager để xác thực
            // Hàm này sẽ tự động mã hóa password người dùng nhập và so sánh với password hash trong DB
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            // Nếu sai pass hoặc username không tồn tại, Spring sẽ ném exception
            throw new RuntimeException("Tài khoản hoặc mật khẩu không chính xác");
        }

        // 2. Nếu qua bước trên nghĩa là đăng nhập thành công -> Lấy user ra
        Account user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 3. Sinh JWT Token và trả về
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
}
