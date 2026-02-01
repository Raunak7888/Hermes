package com.chatapp.auth.Auth.service;

import com.chatapp.auth.model.Role;
import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.RoleRepository;
import com.chatapp.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public User createUser(User user) {
        Role userRole = roleRepository.findByName("USER").orElseThrow(() -> new RuntimeException("Role not found"));
        user.getRoles().add(userRole);
        return userRepository.save(user);
    }

    @Transactional
    public User assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Role role = roleRepository.findByName(roleName).orElseThrow(() -> new RuntimeException("Role not found"));
        user.getRoles().add(role);
        return userRepository.save(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public boolean checkIfUserExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // Implement password reset expiration check
    public boolean isPasswordResetCodeExpired(User user) {
        return user.isPasswordResetCodeExpired();
    }
}
