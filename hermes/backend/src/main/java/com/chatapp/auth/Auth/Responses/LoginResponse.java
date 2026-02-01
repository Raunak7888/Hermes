package com.chatapp.auth.Auth.Responses;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private Long expiresIn;  // Changed to Long for better handling of time

    // Default constructor for Spring binding
    public LoginResponse() {

    }

    public LoginResponse(String token, Long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }
}
