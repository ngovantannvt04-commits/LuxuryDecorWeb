package com.luxurydecor.identity_service.service;

import com.luxurydecor.identity_service.dto.user.UserCreateRequest;
import com.luxurydecor.identity_service.dto.user.UserResponse;
import com.luxurydecor.identity_service.dto.user.UserUpdateRequest;
import com.luxurydecor.identity_service.entity.Account;
import com.luxurydecor.identity_service.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // Lấy thông tin bản thân (dựa trên email từ Token)
    public UserResponse getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Account user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    // Cập nhật thông tin bản thân
    public UserResponse updateMyProfile(UserUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Account user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Chỉ update các trường thông tin cá nhân
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddressDefault(request.getAddress());
        if (request.getAvatar() != null) user.setAvatarUrl(request.getAvatar());

        return mapToUserResponse(userRepository.save(user));
    }

    // --- CÁC HÀM CHO ADMIN QUẢN LÝ ---

    // Lấy danh sách tất cả user
    public Page<UserResponse> getAllUsers(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Account> userPage;

        if (keyword != null && !keyword.isEmpty()) {
            userPage = userRepository.findByUsernameContainingOrEmailContaining(keyword, keyword, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return userPage.map(this::mapToUserResponse);
    }

    // Admin tạo tài khoản mới
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Account user = new Account();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Xét quyền: Nếu request ko có role thì mặc định USER
        user.setRole(request.getRole() != null ? request.getRole().toUpperCase() : "USER");

        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddressDefault(request.getAddress());
        user.setAvatarUrl(request.getAvatar());

        return mapToUserResponse(userRepository.save(user));
    }

    // Admin sửa tài khoản bất kỳ
    public UserResponse updateUser(Integer userId, UserUpdateRequest request) {
        Account user = userRepository.findByAccountId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddressDefault(request.getAddress());
        if (request.getAvatar() != null) user.setAvatarUrl(request.getAvatar());

        // Admin có quyền đổi Role của user khác
        if (request.getRole() != null) {
            user.setRole(request.getRole().toUpperCase());
        }

        return mapToUserResponse(userRepository.save(user));
    }

    // Admin xóa tài khoản
    public void deleteUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    // Admin lấy chi tiết 1 user
    public UserResponse getUserById(Integer userId) {
        Account user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    // Helper Mapping
    private UserResponse mapToUserResponse(Account user) {
        return UserResponse.builder()
                .userId(user.getAccountId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddressDefault())
                .avatar(user.getAvatarUrl())
                .build();
    }
}
