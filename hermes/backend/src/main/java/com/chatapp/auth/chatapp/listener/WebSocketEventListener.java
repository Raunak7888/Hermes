package com.chatapp.auth.chatapp.listener;

import com.chatapp.auth.Auth.service.JwtService;
import com.chatapp.auth.chatapp.service.ChatappUserService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.*;

@Component
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatappUserService chatappUserService;
    private final JwtService jwtService;

    public WebSocketEventListener(SimpMessagingTemplate messagingTemplate, ChatappUserService chatappUserService , JwtService jwtService) {
        this.messagingTemplate = messagingTemplate;
        this.chatappUserService = chatappUserService;
        this.jwtService = jwtService;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = getUsernameFromHeaders(headerAccessor);

        if (username != null) {
            String sessionId = headerAccessor.getSessionId();
            System.out.println("User connected: " + username);
            System.out.println(sessionId + " " + username);
            chatappUserService.setUserOnline(sessionId, username);
            messagingTemplate.convertAndSend("/topic/status", true);
        } else {
            System.err.println("Username is null for the connected session.");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        System.out.println(sessionId);
        String username = chatappUserService.getUsername(sessionId);
        if (username != null) {
            System.out.println("User disconnected: " + username);
            chatappUserService.setUserOffline(sessionId);
            messagingTemplate.convertAndSend("/topic/status", false);
        } else {
            System.err.println("Username is null for the disconnected session.");
        }
    }



    /**
     * Extracts the username from the WebSocket headers (Authorization header).
     */
    private String getUsernameFromHeaders(StompHeaderAccessor headerAccessor) {
        // Retrieve the "simpConnectMessage" from the message headers
        Object simpConnectMessageObj = headerAccessor.getMessageHeaders().get("simpConnectMessage");

        // Check if simpConnectMessageObj is an instance of GenericMessage
        if (simpConnectMessageObj instanceof GenericMessage<?> simpConnectMessage) {

            // Get nativeHeaders from simpConnectMessage and check its type
            Object nativeHeadersObj = simpConnectMessage.getHeaders().get("nativeHeaders");

            if (nativeHeadersObj instanceof Map<?, ?> nativeHeadersMap) {

                // Ensure keys and values are the correct types for casting
                if (nativeHeadersMap.keySet().stream().allMatch(key -> key instanceof String) &&
                        nativeHeadersMap.values().stream().allMatch(value -> value instanceof List)) {

                    // Perform the cast safely
                    @SuppressWarnings("unchecked")
                    Map<String, List<String>> nativeHeaders = (Map<String, List<String>>) nativeHeadersMap;

                    // Retrieve Authorization header
                    if (nativeHeaders.containsKey("Authorization")) {
                        List<String> authHeaders = nativeHeaders.get("Authorization");

                        // Retrieve the first value from the Authorization header list
                        if (authHeaders != null && !authHeaders.isEmpty()) {
                            String authHeader = authHeaders.get(0);
                            if (authHeader.startsWith("Bearer%")) {
                                String jwtToken = authHeader.substring(9);// Remove "Bearer " prefix
                                try {
                                    // Extract the username from the JWT token
                                    String username = jwtService.extractUsername(jwtToken);
                                    if (jwtService.isValid(jwtToken, username)) {
                                        return username;  // Return the username if the JWT is valid
                                    } else {
                                        System.err.println("Invalid JWT token.");
                                    }
                                } catch (Exception e) {
                                    System.err.println("Error extracting username from JWT token: " + e.getMessage());
                                }
                            } else {
                                System.err.println("Authorization header is missing or incorrectly formatted.");
                            }
                        }
                    } else {
                        System.err.println("No Authorization header found in nativeHeaders.");
                    }
                }
            }
        }
        return null;  // Return null if no valid token is found
    }



}
