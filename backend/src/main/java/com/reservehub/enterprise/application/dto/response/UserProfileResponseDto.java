package com.reservehub.enterprise.application.dto.response;

import com.reservehub.enterprise.domain.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User profile response including base64 avatar")
public class UserProfileResponseDto {
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private String department;
    private String phone;
    private String jobTitle;
    private String biography;
    private String avatarBase64;
}
