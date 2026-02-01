package com.chatapp.auth.chatapp.controller;

import com.chatapp.auth.Auth.service.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtHandshakeInterceptor.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtHandshakeInterceptor(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        log.info("🔄 Starting WebSocket handshake interception for request from remote address: {}", request.getRemoteAddress());

        if (request instanceof ServletServerHttpRequest servletRequest) {
            log.debug("Request is a ServletServerHttpRequest. Extracting token from request parameters.");
            String token = servletRequest.getServletRequest().getParameter("token");
            log.debug("Extracted token from URL parameter: {}", token);

            if (token != null) {
                try {
                    String username = jwtService.extractUsername(token);
                    log.debug("Extracted username '{}' from JWT token.", username);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    log.debug("User details loaded for user: {}", userDetails.getUsername());

                    if (jwtService.isTokenValid(token, userDetails)) {
                        log.info("✅ WebSocket handshake authenticated successfully for user: {}", username);
                        // You can optionally set user info in attributes if needed
                        attributes.put("username", username);
                        log.debug("Username '{}' added to WebSocket session attributes.", username);
                        return true;
                    } else {
                        log.warn("❌ Invalid JWT during handshake for token. Validation failed.");
                    }
                } catch (Exception e) {
                    log.error("❌ Error validating token during handshake: {}", e.getMessage(), e);
                }
            } else {
                log.warn("⚠️ No JWT token found in handshake request URL parameter. Rejecting handshake.");
            }
        } else {
            log.warn("⚠️ Request is not a ServletServerHttpRequest. Cannot extract token from URL parameters. Rejecting handshake.");
        }

        log.info("🚫 WebSocket handshake rejected.");
        // Reject handshake if invalid or missing token
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        log.debug("After handshake hook called. Exception: {}", exception != null ? exception.getMessage() : "None");
    }
}