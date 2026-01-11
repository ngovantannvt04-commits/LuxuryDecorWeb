package com.luxurydecor.identity_service.dto.user;

import lombok.Data;

@Data
public class ContactRequest {
    private String name;
    private String email;
    private String message;
}
