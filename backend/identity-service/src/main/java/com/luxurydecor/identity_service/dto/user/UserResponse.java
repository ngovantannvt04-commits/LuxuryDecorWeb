package com.luxurydecor.identity_service.dto.user;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Integer userId;
    private String username;
    private String email;
    private String role;
    private String phoneNumber;
    private String avatar;
}
