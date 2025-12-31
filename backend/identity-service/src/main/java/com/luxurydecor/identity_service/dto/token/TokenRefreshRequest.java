package com.luxurydecor.identity_service.dto.token;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}
