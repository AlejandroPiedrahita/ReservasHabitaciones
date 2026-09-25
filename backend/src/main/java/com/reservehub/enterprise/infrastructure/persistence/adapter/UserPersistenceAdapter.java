package com.reservehub.enterprise.infrastructure.persistence.adapter;

import com.reservehub.enterprise.domain.model.User;
import com.reservehub.enterprise.domain.port.out.UserRepositoryPort;
import com.reservehub.enterprise.infrastructure.persistence.entity.UserEntity;
import com.reservehub.enterprise.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final UserJpaRepository jpaRepository;

    @Override
    public Optional<User> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public User save(User user) {
        UserEntity entity = UserEntity.builder()
                .id(user.getId())
                .email(user.getEmail())
                .passwordHash(user.getPasswordHash())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .role(user.getRole())
                .mfaEnabled(user.isMfaEnabled())
                .mfaSecret(user.getMfaSecret())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .avatarBase64(user.getAvatarBase64())
                .phone(user.getPhone())
                .jobTitle(user.getJobTitle())
                .biography(user.getBiography())
                .build();
        return toDomain(jpaRepository.save(entity));
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    private User toDomain(UserEntity entity) {
        return User.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .passwordHash(entity.getPasswordHash())
                .fullName(entity.getFullName())
                .department(entity.getDepartment())
                .role(entity.getRole())
                .mfaEnabled(entity.isMfaEnabled())
                .mfaSecret(entity.getMfaSecret())
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .avatarBase64(entity.getAvatarBase64())
                .phone(entity.getPhone())
                .jobTitle(entity.getJobTitle())
                .biography(entity.getBiography())
                .build();
    }
}
