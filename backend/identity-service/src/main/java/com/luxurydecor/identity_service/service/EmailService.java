package com.luxurydecor.identity_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender javaMailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("hauigroupdnk@gmail.com"); // Email của bạn
        message.setTo(toEmail);
        message.setSubject("Mã xác thực đăng ký tài khoản");
        message.setText("Xin chào,\n\nMã OTP xác thực của bạn là: " + otp + "\n\nMã này sẽ hết hạn sau 2 phút.");

        javaMailSender.send(message);
    }
}
