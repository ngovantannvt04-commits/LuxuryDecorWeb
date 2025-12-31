package com.luxurydecor.identity_service.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();

            // Sử dụng Helper để cấu hình dễ hơn, hỗ trợ tiếng Việt (UTF-8)
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, "LuxuryDecor");

            helper.setTo(toEmail);
            helper.setSubject("Mã xác thực đăng ký tài khoản");

            // Nội dung email
            String htmlContent = "<h3>Xin chào,</h3>"
                    + "<p>Mã OTP xác thực của bạn là: <strong style='font-size: 18px; color: blue;'>" + otp + "</strong></p>"
                    + "<p>Mã này sẽ hết hạn sau 2 phút.</p>"
                    + "<br><p>Trân trọng,<br>Đội ngũ LuxuryDecor</p>";

            helper.setText(htmlContent, true);

            javaMailSender.send(message);

        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        }
    }
}
