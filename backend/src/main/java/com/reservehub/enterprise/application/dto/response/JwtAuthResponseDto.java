package com.reservehub.enterprise.application.dto.response;

import com.reservehub.enterprise.domain.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "JWT authentication token payload with zero-trust claims")
public class JwtAuthResponseDto {
    private String accessToken;
    private String refreshToken;
    private String tokenType; // "Bearer"
    private long expiresInMs;
    private Instant issuedAt;
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private String terminalId;
    private boolean mfaVerified;
    private String avatarBase64;
    private String phone;
    private String jobTitle;
    private String department;
    private String biography;
}
