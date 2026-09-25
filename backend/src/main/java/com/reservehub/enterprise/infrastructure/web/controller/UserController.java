package com.reservehub.enterprise.infrastructure.web.controller;

import com.reservehub.enterprise.application.dto.request.UpdateProfileRequestDto;
import com.reservehub.enterprise.application.dto.response.UserProfileResponseDto;
import com.reservehub.enterprise.application.port.in.UserUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for managing users and profiles")
public class UserController {

    private final UserUseCase userUseCase;

    @GetMapping("/me/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserProfileResponseDto> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userUseCase.getProfile(email));
    }

    @PatchMapping("/me/profile")
    @Operation(summary = "Update current user profile and avatar")
    public ResponseEntity<UserProfileResponseDto> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequestDto request) {
        String email = authentication.getName();
        return ResponseEntity.ok(userUseCase.updateProfile(email, request));
    }
}
