package com.chatapp.auth.chatapp.service;

import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatappUserService {

    private final UserRepository userRepository;
    private final Map<String, String> sessionUsernameMap = new ConcurrentHashMap<>();

    public ChatappUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void setUserOnline(String sessionId, String username) {
        sessionUsernameMap.put(sessionId, username);
        System.out.println(sessionUsernameMap);
        User user = UsernameFinder(username);
        user.setOnline(true);
        userRepository.save(user);
        System.out.println("User with username " + username + " is set to online.");
    }

    @Transactional
    public void setUserOffline(String sessionId) {
        String username = sessionUsernameMap.remove(sessionId);
        if (username != null) {
            // Fetch the user by username and set offline status
            User user = UsernameFinder(username);
            user.setOnline(false);
            userRepository.save(user);
            System.out.println("User with username " + username + " is set to offline.");
        } else {
            System.err.println("Session ID " + sessionId + " not associated with any username.");
        }
    }

    public boolean isUserOnline(String username) {
        return UsernameFinder(username).isOnline();
    }

    public String getUsername(String sessionId) {
        return sessionUsernameMap.get(sessionId);
    }

    private User UsernameFinder(String username) {
        return userRepository.findByUsername(username)
               .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
}
