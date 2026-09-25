package com.reservehub.enterprise.application.port.in;

import com.reservehub.enterprise.application.dto.request.LoginRequestDto;
import com.reservehub.enterprise.application.dto.response.JwtAuthResponseDto;

/**
 * Inbound port for stateless JWT authentication and MFA validation.
 */
public interface AuthUseCase {
    JwtAuthResponseDto authenticate(LoginRequestDto loginRequest);
    JwtAuthResponseDto refreshToken(String refreshToken);
}
