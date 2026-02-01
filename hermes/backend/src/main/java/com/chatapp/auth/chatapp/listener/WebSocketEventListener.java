package com.chatapp.auth.chatapp.listener;

import com.chatapp.auth.Auth.service.JwtService;
import com.chatapp.auth.chatapp.service.ChatappUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.messaging.support.GenericMessage;

import java.security.Principal;
import java.util.List;

@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatappUserService chatappUserService;
    private final JwtService jwtService;

    public WebSocketEventListener(SimpMessagingTemplate messagingTemplate,
                                  ChatappUserService chatappUserService,
                                  JwtService jwtService) {
        this.messagingTemplate = messagingTemplate;
        this.chatappUserService = chatappUserService;
        this.jwtService = jwtService;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("🔌 WebSocket connection event triggered. Session ID: {}", event.getMessage().getHeaders().get("simpSessionId"));

        // Wrap the CONNECT_ACK message
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        log.debug("SessionConnectedEvent for session ID: {}", sessionId);

        // Extract original CONNECT message (contains native headers)
        Message<?> connectMessage = (Message<?>) headerAccessor.getHeader("simpConnectMessage");

        if (connectMessage instanceof GenericMessage<?> genericMessage) {
            log.debug("Original CONNECT message is a GenericMessage. Proceeding to extract Authorization header.");
            StompHeaderAccessor connectAccessor = StompHeaderAccessor.wrap(genericMessage);

            List<String> tokenList = connectAccessor.getNativeHeader("Authorization");
            log.debug("Native 'Authorization' header values: {}", tokenList);

            if (tokenList != null && !tokenList.isEmpty()) {
                String rawToken = tokenList.get(0);
                String cleanedToken = rawToken.startsWith("Bearer ") ? rawToken.substring(7) : rawToken;
                log.debug("Extracted and cleaned token: {}", cleanedToken);

                try {
                    String username = jwtService.extractUsername(cleanedToken);
                    log.info("✅ User connected: {} | Session ID: {}", username, sessionId);

                    // Mark user online
                    chatappUserService.setUserOnline(sessionId, username);
                    log.info("User '{}' status updated to ONLINE in service.", username);

                    // Broadcast user online status
                    messagingTemplate.convertAndSend("/topic/status", username + " is online");
                    log.info("Broadcasting user status update to '/topic/status'.");
                } catch (Exception ex) {
                    log.warn("❌ JWT validation failed during connect event: {}", ex.getMessage());
                }

            } else {
                log.warn("❗ Authorization header not found in nativeHeaders for session ID: {}. Cannot determine user.", sessionId);
            }

        } else {
            log.warn("❗ simpConnectMessage was not a GenericMessage for session ID: {} — token could not be retrieved.", sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        log.info("🔌 WebSocket disconnection event triggered.");

        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        log.debug("SessionDisconnectEvent for session ID: {}", sessionId);

        if (sessionId != null) {
            String username = chatappUserService.getUsername(sessionId);
            if (username != null) {
                log.info("👋 User disconnected: {} | Session ID: {}", username, sessionId);

                chatappUserService.setUserOffline(sessionId);
                log.info("User '{}' status updated to OFFLINE in service.", username);

                // Broadcast user offline status
                messagingTemplate.convertAndSend("/topic/status", username + " is offline");
                log.info("Broadcasting user status update to '/topic/status'.");
            } else {
                log.warn("⚠️ No user found for disconnected session ID: {}", sessionId);
            }
        } else {
            log.warn("⚠️ Session ID is null in disconnect event. Cannot process event fully.");
        }
    }
}