package com.luxurydecor.identity_service.config;

import com.luxurydecor.identity_service.entity.Account;
import com.luxurydecor.identity_service.repository.AccountRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initDatabase(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Kiểm tra xem đã có tài khoản admin chưa
            if (!accountRepository.existsByEmail("admin@luxurydecor.com")) {
                Account admin = new Account();
                admin.setUsername("NiRi Admin");
                admin.setEmail("admin@luxurydecor.com");

                // Mật khẩu là: 123456 (được mã hóa)
                admin.setPassword(passwordEncoder.encode("niriadmin123"));

                // Quan trọng: Set Role là ADMIN
                admin.setRole("ADMIN");

                accountRepository.save(admin);
                System.out.println("✅ Đã khởi tạo tài khoản ADMIN thành công: admin@luxurydecor.com / niriadmin123");
            }
        };
    }
}
