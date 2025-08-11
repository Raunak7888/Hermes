package com.chatapp.auth.Auth.config;

import com.chatapp.auth.Auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final HandlerExceptionResolver handlerExceptionResolver;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtFilter(HandlerExceptionResolver handlerExceptionResolver, JwtService jwtService, UserDetailsService userDetailsService) {
        this.handlerExceptionResolver = handlerExceptionResolver;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        log.info("➡️ Starting JWT filter for request URI: {}", request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");
        log.debug("Authorization header: {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No valid Authorization header found or it's not a 'Bearer' token. Skipping JWT filter and continuing the filter chain.");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        log.info("JWT Token extracted: {}", jwt);

        try {
            String username = jwtService.extractUsername(jwt);
            log.info("Extracted username from JWT: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("Username found and no existing authentication in the SecurityContext. Loading user details.");
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                log.info("User details loaded successfully for username: {}", username);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    log.info("✅ JWT token is valid. Creating and setting new authentication token.");
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    log.debug("Authentication token details built from request.");

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("Security context updated with authentication for user: {}", username);
                } else {
                    log.warn("❌ JWT token for user '{}' is invalid. It might be expired or malformed.", username);
                }
            } else {
                log.debug("Username not found in token or SecurityContext already has an authentication. Skipping authentication update.");
            }
        } catch (Exception e) {
            log.error("❌ JWT authentication failed for request URI {}: {}", request.getRequestURI(), e.getMessage(), e);
            handlerExceptionResolver.resolveException(request, response, null, e);
            return;
        }

        log.info("✅ JWT filter finished. Continuing the filter chain for request: {}", request.getRequestURI());
        filterChain.doFilter(request, response);
    }
}