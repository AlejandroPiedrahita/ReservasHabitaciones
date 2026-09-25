package com.reservehub.enterprise.infrastructure.web.controller;

import com.reservehub.enterprise.application.dto.request.LoginRequestDto;
import com.reservehub.enterprise.application.dto.response.ErrorResponseDto;
import com.reservehub.enterprise.application.dto.response.JwtAuthResponseDto;
import com.reservehub.enterprise.application.port.in.AuthUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "1. Security & Authentication", description = "Stateless Zero-Trust JWT Token Issuance & MFA Handshake")
public class AuthController {

    private final AuthUseCase authUseCase;

    @PostMapping("/login")
    @Operation(summary = "Authenticate Corporate Operator", description = "Verifies BCrypt password and 6-digit TOTP token, issuing a cryptographically signed JWT token session.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "JWT Token session successfully issued",
                    content = @Content(schema = @Schema(implementation = JwtAuthResponseDto.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials or expired MFA TOTP code",
                    content = @Content(schema = @Schema(implementation = ErrorResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Malformed login payload",
                    content = @Content(schema = @Schema(implementation = ErrorResponseDto.class)))
    })
    public ResponseEntity<JwtAuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        JwtAuthResponseDto response = authUseCase.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT Session Token", description = "Provides a fresh short-lived JWT access token using a valid refresh token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Refreshed access token successfully issued"),
            @ApiResponse(responseCode = "401", description = "Expired or blacklisted refresh token")
    })
    public ResponseEntity<JwtAuthResponseDto> refresh(@RequestParam("refreshToken") String refreshToken) {
        JwtAuthResponseDto response = authUseCase.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
}
