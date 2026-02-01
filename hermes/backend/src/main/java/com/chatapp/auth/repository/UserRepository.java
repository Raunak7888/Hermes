package com.chatapp.auth.repository;

import com.chatapp.auth.model.User;

import org.springframework.lang.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationCode(String verificationCode);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
    @SuppressWarnings("null")
    Optional<User> findById(@NonNull Long userId); // Adjusted to use Optional if not already
    List<User> findByUsernameContainingIgnoreCase(String username);

    // This method is not necessary if `findById` from JpaRepository is used
    // User findUserById(Long userId);
}
