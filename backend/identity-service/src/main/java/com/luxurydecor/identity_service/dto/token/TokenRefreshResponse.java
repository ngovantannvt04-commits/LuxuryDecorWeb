package com.luxurydecor.identity_service.dto.token;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenRefreshResponse {
    private String accessToken;
    private String refreshToken;
}
