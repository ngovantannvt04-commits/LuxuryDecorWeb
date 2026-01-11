package com.luxurydecor.identity_service.controller;

import com.luxurydecor.identity_service.dto.user.ContactRequest;
import com.luxurydecor.identity_service.dto.user.UserCreateRequest;
import com.luxurydecor.identity_service.dto.user.UserResponse;
import com.luxurydecor.identity_service.dto.user.UserUpdateRequest;
import com.luxurydecor.identity_service.service.EmailService;
import com.luxurydecor.identity_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateMyProfile(@RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(request));
    }

    @PostMapping("/contact")
    public ResponseEntity<String> submitContact(@RequestBody ContactRequest request) {
        try {
            emailService.sendContactEmail(request);
            return ResponseEntity.ok("Đã gửi tin nhắn thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi gửi mail: " + e.getMessage());
        }
    }

    // === 2. API QUẢN TRỊ (Chỉ ADMIN) ===
    // Lấy danh sách users (có phân trang & tìm kiếm)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(userService.getAllUsers(page, size, keyword));
    }

    // Tạo user mới
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    // Lấy chi tiết user bất kỳ theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Sửa user bất kỳ
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Integer id,
            @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // Xóa user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
