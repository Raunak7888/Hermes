package com.chatapp.auth.chatapp.service;

import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CurrentUserService{

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Long getCurrentUserIdWithUsername(String username) {
        Optional<User> user = Optional.ofNullable(userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username)));
        if (user.isPresent()) {
            return user.get().getId();
        }
        return 0L;
    }
}


















