package com.luxurydecor.identity_service.dto.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String phoneNumber;
    private String address;
    private String avatar;
    private String role;
}