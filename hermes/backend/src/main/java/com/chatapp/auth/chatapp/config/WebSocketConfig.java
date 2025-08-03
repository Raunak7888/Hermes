package com.chatapp.auth.chatapp.config;

import com.chatapp.auth.Auth.service.JwtService;
import com.chatapp.auth.chatapp.controller.JwtChannelInterceptor;
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

    public WebSocketConfig(JwtService jwtService, JwtChannelInterceptor jwtChannelInterceptor) {
        this.jwtChannelInterceptor = jwtChannelInterceptor;
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Enable simple broker for topics
        config.setApplicationDestinationPrefixes("/app"); // Prefix for messages sent to the server
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/chat")
                .setAllowedOrigins("https://orange-barnacle-g44w4pqgp79rfwr6g-5173.app.github.dev","https://frontend-production-83c3.up.railway.app")  // Set allowed origins for CORS
                .withSockJS();  // Enables SockJS as a fallback
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);  // Registers the JWT interceptor for inbound messages
    }

    @Override
    public void configureWebSocketTransport(@NonNull WebSocketTransportRegistration registry){
        registry.setMessageSizeLimit(256*1024);
        registry.setSendBufferSizeLimit(256 * 1024);
        registry.setSendTimeLimit(20*1000);
    }

}
