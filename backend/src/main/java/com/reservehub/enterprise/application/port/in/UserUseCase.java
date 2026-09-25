package com.reservehub.enterprise.application.port.in;

import com.reservehub.enterprise.application.dto.request.UpdateProfileRequestDto;
import com.reservehub.enterprise.application.dto.response.UserProfileResponseDto;

public interface UserUseCase {
    UserProfileResponseDto getProfile(String email);
    UserProfileResponseDto updateProfile(String email, UpdateProfileRequestDto request);
}
