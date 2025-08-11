package com.chatapp.auth.chatapp.service;

import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatappUserService {

    private static final Logger log = LoggerFactory.getLogger(ChatappUserService.class);

    private final UserRepository userRepository;
    private final Map<String, String> sessionUsernameMap = new ConcurrentHashMap<>();

    public ChatappUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void setUserOnline(String sessionId, String username) {
        log.info("Attempting to set user '{}' online for session ID: {}", username, sessionId);
        sessionUsernameMap.put(sessionId, username);
        log.debug("Added session mapping: {} -> {}. Current map state: {}", sessionId, username, sessionUsernameMap);

        User user = UsernameFinder(username);
        user.setOnline(true);
        userRepository.save(user);
        log.info("✅ User with username '{}' successfully updated to online status in the database.", username);
    }

    @Transactional
    public void setUserOffline(String sessionId) {
        log.info("Attempting to set user offline for session ID: {}", sessionId);
        String username = sessionUsernameMap.remove(sessionId);
        log.debug("Removed session mapping for session ID '{}'. Extracted username: {}", sessionId, username);

        if (username != null) {
            try {
                // Fetch the user by username and set offline status
                User user = UsernameFinder(username);
                user.setOnline(false);
                userRepository.save(user);
                log.info("✅ User with username '{}' successfully updated to offline status in the database.", username);
            } catch (RuntimeException e) {
                log.error("❌ Failed to set user offline: {}. User '{}' not found in database.", e.getMessage(), username);
            }
        } else {
            log.warn("⚠️ Session ID '{}' was not associated with any username. No user status to update.", sessionId);
        }
    }

    public boolean isUserOnline(String username) {
        log.debug("Checking online status for user: {}", username);
        boolean isOnline = UsernameFinder(username).isOnline();
        log.debug("User '{}' is currently online: {}", username, isOnline);
        return isOnline;
    }

    public String getUsername(String sessionId) {
        String username = sessionUsernameMap.get(sessionId);
        log.debug("Retrieving username for session ID '{}'. Found: {}", sessionId, username);
        return username;
    }

    private User UsernameFinder(String username) {
        log.debug("Fetching user entity for username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("❌ User not found with username: {}", username);
                    return new RuntimeException("User not found with username: " + username);
                });
    }
}