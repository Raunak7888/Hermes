package com.chatapp.auth.chatapp.config;

import com.chatapp.auth.Auth.service.JwtService;
import com.chatapp.auth.chatapp.controller.JwtChannelInterceptor;
import com.chatapp.auth.chatapp.controller.JwtHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.lang.NonNull;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    public WebSocketConfig(JwtService jwtService, JwtChannelInterceptor jwtChannelInterceptor, JwtHandshakeInterceptor jwtHandshakeInterceptor) {
        this.jwtChannelInterceptor = jwtChannelInterceptor;
        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Enable simple broker for topics
        config.setApplicationDestinationPrefixes("/app"); // Prefix for messages sent to the server
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat")
                .setAllowedOrigins("http://localhost:5173", "http://127.0.0.1:5500")
                .withSockJS()
                .setSessionCookieNeeded(false);

    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Register the JWT interceptor for inbound messages
        registration.interceptors(jwtChannelInterceptor);
    }

    @Override
    public void configureWebSocketTransport(@NonNull WebSocketTransportRegistration registry){
        registry.setMessageSizeLimit(256*1024);
        registry.setSendBufferSizeLimit(256 * 1024);
        registry.setSendTimeLimit(20*1000);
    }
}