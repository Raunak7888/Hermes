package com.chatapp.auth.Auth.service;

import com.chatapp.auth.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    private final long jwtExpiration = 86400000;

    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generateToken(User user) {
        return generateToken(new HashMap<>(), user);
    }

    public String generateToken(Map<String, Object> extraClaims, User user) {
        return buildToken(extraClaims, user, jwtExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, User user, long jwtExpiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public long getExpirationTime() {
        return jwtExpiration;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username != null &&
                username.equals(userDetails.getUsername()) &&
                !isTokenExpired(token);
    }


    public boolean isValid(String token, String user) {
        final String username = extractUsername(token);
        return username.equals(user) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public UsernamePasswordAuthenticationToken getAuthentication(String token) {
        if (token == null || isTokenExpired(token)) {
            return null;
        }

        String username = extractUsername(token);
        if (username == null) {
            return null;
        }

        Claims claims = extractAllClaims(token);
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) claims.get("roles");
        if (roles != null) {
            roles.forEach(role -> authorities.add(new SimpleGrantedAuthority(role)));
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return new UsernamePasswordAuthenticationToken(username, null, authorities);
    }


    public List<SimpleGrantedAuthority> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token);

        // Retrieve the roles claim and ensure it's a List<String>
        Object rolesClaim = claims.get("roles");

        if (rolesClaim instanceof List<?> rawRoles) {

            // Check if all elements in the list are Strings
            if (rawRoles.isEmpty() || rawRoles.get(0) instanceof String) {
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) rawRoles;

                return roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            } else {
                throw new IllegalArgumentException("Roles must be a list of strings.");
            }
        } else {
            throw new IllegalArgumentException("Roles claim is not a list.");
        }
    }

}
