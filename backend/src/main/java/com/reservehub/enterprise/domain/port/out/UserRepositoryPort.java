package com.reservehub.enterprise.domain.port.out;

import com.reservehub.enterprise.domain.model.User;

import java.util.Optional;

/**
 * Outbound port for User authentication credentials and roles.
 */
public interface UserRepositoryPort {
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    User save(User user);
    boolean existsByEmail(String email);
}
