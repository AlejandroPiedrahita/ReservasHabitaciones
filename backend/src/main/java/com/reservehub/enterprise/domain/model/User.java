package com.reservehub.enterprise.domain.model;

import com.reservehub.enterprise.domain.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Domain entity representing an authenticated enterprise user.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String email;
    private String passwordHash;
    private String fullName;
    private String department;
    private Role role;
    private boolean mfaEnabled;
    private String mfaSecret;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String avatarBase64;
    private String phone;
    private String jobTitle;
    private String biography;
}
