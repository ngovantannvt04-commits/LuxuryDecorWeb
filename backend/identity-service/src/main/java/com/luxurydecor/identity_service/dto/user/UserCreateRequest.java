package com.luxurydecor.identity_service.dto.user;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String username;
    private String password;
    private String email;
    private String role;
    private String phoneNumber;
    private String address;
    private String avatar;
}
