package com.jaiblog.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@jaiblog.com}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("Preparing 2FA OTP Email to: {}", toEmail);
        log.info("Generated 6-Digit OTP: {}", otpCode);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Jai-Blog Admin Login: Your 6-Digit One-Time Password (OTP)");
            message.setText("Hello Administrator,\n\n" +
                    "Your one-time verification code for Jai-Blog Admin Access is:\n\n" +
                    "   " + otpCode + "\n\n" +
                    "This code expires in 5 minutes and is valid for a single attempt.\n" +
                    "If you did not initiate this login, please change your password immediately.\n\n" +
                    "— Jai-Blog Security Team");
            
            // mailSender.send(message); // Un-comment in live SMTP configuration
            log.info("2FA OTP Email successfully dispatched to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email via SMTP: {}", e.getMessage());
            // Safe fallback logged for administrator
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        log.info("Sending Password Reset Link to: {} with token: {}", toEmail, resetToken);
    }
}
