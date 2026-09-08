package com.jaiblog.controller;

import com.jaiblog.dto.ApiResponse;
import com.jaiblog.dto.LoginRequest;
import com.jaiblog.dto.VerifyOtpRequest;
import com.jaiblog.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = authService.initiateLogin(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your registered email address.", result));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        Map<String, Object> session = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully. Session established.", session));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully.", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        authService.sendPasswordResetLink(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset link sent to your email (expires in 1 hour).", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");
        authService.resetPasswordWithToken(token, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. Please login with your new password.", null));
    }
}
