package com.reservehub.enterprise.application.service;

import com.reservehub.enterprise.application.dto.request.UpdateProfileRequestDto;
import com.reservehub.enterprise.application.dto.response.UserProfileResponseDto;
import com.reservehub.enterprise.application.port.in.UserUseCase;
import com.reservehub.enterprise.domain.exception.ResourceNotFoundException;
import com.reservehub.enterprise.domain.model.User;
import com.reservehub.enterprise.domain.port.out.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService implements UserUseCase {

    private final UserRepositoryPort userRepositoryPort;

    @Override
    public UserProfileResponseDto getProfile(String email) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return toDto(user);
    }

    @Override
    public UserProfileResponseDto updateProfile(String email, UpdateProfileRequestDto request) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setJobTitle(request.getJobTitle());
        user.setDepartment(request.getDepartment());
        user.setBiography(request.getBiography());
        
        if (request.getAvatarBase64() != null) {
            user.setAvatarBase64(request.getAvatarBase64());
        }

        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepositoryPort.save(user);
        return toDto(savedUser);
    }

    private UserProfileResponseDto toDto(User user) {
        return UserProfileResponseDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .jobTitle(user.getJobTitle())
                .biography(user.getBiography())
                .avatarBase64(user.getAvatarBase64())
                .build();
    }
}
