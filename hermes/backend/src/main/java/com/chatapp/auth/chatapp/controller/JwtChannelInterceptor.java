package com.chatapp.auth.chatapp.controller;

import com.chatapp.auth.Auth.service.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtChannelInterceptor.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtChannelInterceptor(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        log.debug("Intercepting message with command: {}", StompHeaderAccessor.wrap(message).getCommand());
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // We only care about CONNECT commands for authentication
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("Received STOMP CONNECT command. Beginning WebSocket authentication process.");

            String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
            log.debug("Authorization header value: {}", authorizationHeader);

            // Check if the Authorization header is present and starts with "Bearer"
            if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
                log.debug("Authorization header found and is in 'Bearer' format.");
                try {
                    String token = authorizationHeader.substring(7); // Remove "Bearer " prefix
                    log.info("🔍 Extracted JWT token from Authorization header: {}", token);

                    String username = jwtService.extractUsername(token);
                    log.debug("Extracted username from token: {}", username);

                    if (username != null) {
                        log.debug("Attempting to load UserDetails for username: {}", username);
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        log.debug("Successfully loaded UserDetails for user: {}", userDetails.getUsername());

                        if (jwtService.isTokenValid(token, userDetails)) {
                            log.info("✅ JWT token is valid for user: {}", username);
                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                            // Set the user principal on the WebSocket session
                            accessor.setUser(authToken);
                            log.info("✅ Authenticated WebSocket user and set principal: {}", username);
                        } else {
                            log.error("❌ JWT validation failed for token: {}. Token is expired or invalid.", token);
                            throw new IllegalArgumentException("Invalid JWT token");
                        }
                    } else {
                        log.error("❌ Username could not be extracted from the JWT token.");
                        throw new IllegalArgumentException("Invalid JWT token: Username not found");
                    }
                } catch (Exception e) {
                    log.error("❌ WebSocket authentication failed due to an exception: {}", e.getMessage(), e);
                    // It's crucial to throw an exception to prevent the handshake from completing
                    throw new IllegalArgumentException("WebSocket authentication failed", e);
                }
            } else {
                log.warn("⚠️ Missing or incorrectly formatted Authorization header for STOMP CONNECT. Rejecting connection.");
                // Reject connections without a valid token
                throw new IllegalArgumentException("Missing or invalid Authorization header");
            }
        }
        log.debug("Message processing complete. Returning message.");
        return message;
    }
}