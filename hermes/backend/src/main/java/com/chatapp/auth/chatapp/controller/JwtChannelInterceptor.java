package com.chatapp.auth.chatapp.controller;

import com.chatapp.auth.Auth.service.JwtService;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;


@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(JwtChannelInterceptor.class);
    private final JwtService jwtService;

    @Autowired
    public JwtChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @SuppressWarnings("null")
    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // Only intercept the CONNECT command
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            // Check for Authorization header with Bearer token
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer%")) {
                logger.info("Received WebSocket connection with Authorization header");

                String jwtToken = authHeader.substring(9); // Extract token after "Bearer "
                try {
                    // Extract username from the token
                    String username = jwtService.extractUsername(jwtToken);
                    if (jwtService.isValid(jwtToken, username)) {
                        // Set the user in the WebSocket context without roles
                        accessor.setUser(new UsernamePasswordAuthenticationToken(username, null));
                        logger.info("User '{}' authenticated successfully via WebSocket", username);
                    } else {
                        // Invalid token case
                        logger.warn("Invalid JWT token for user '{}'", username);
                        throw new IllegalArgumentException("Invalid JWT Token");
                    }
                } catch (Exception e) {
                    // Log and rethrow the error with proper message
                    logger.error("WebSocket connection failed: {}", e.getMessage());
                    throw new IllegalArgumentException("Invalid JWT Token", e);
                }
            } else {
                // Missing or improperly formatted Authorization header
                logger.warn("Authorization header missing or incorrectly formatted in WebSocket connection");
                throw new IllegalArgumentException("Authorization header missing or incorrectly formatted");
            }
        }
        return message; // Continue with the message if everything is valid
    }
}
