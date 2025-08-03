package com.chatapp.auth.Auth.controller;

import com.chatapp.auth.Auth.Responses.LoginResponse;
import com.chatapp.auth.Auth.dto.LoginUserDto;
import com.chatapp.auth.Auth.dto.ResetDto;
import com.chatapp.auth.Auth.dto.SignupUserDto;
import com.chatapp.auth.Auth.dto.VerifyDto;
import com.chatapp.auth.chatapp.DTO.UserDataDto;
import com.chatapp.auth.chatapp.service.CurrentUserService;
import com.chatapp.auth.chatapp.service.GetUserDataService;
import com.chatapp.auth.model.User;
import com.chatapp.auth.Auth.service.AuthenticationService;
import com.chatapp.auth.Auth.service.JwtService;
import com.chatapp.auth.Auth.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final CurrentUserService currentUserService;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);
    private final GetUserDataService getUserDataService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService, UserService userService, CurrentUserService currentUserService, GetUserDataService getUserDataService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
        this.currentUserService = currentUserService;
        this.getUserDataService = getUserDataService;
    }


    @PostMapping("/token")
    public ResponseEntity<String> getToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token != null) {
            // Log the token for debugging (remove in production)
            logger.info("Extracted token: {}", token);
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.badRequest().body("Missing token in the request body");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<User> register(@Valid @RequestBody SignupUserDto dto) {
        User user = authenticationService.signup(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginUserDto dto) {
        System.out.println(dto.getEmail());
        User authenticatedUser = authenticationService.authenticate(dto);
        String token = jwtService.generateToken(authenticatedUser);
        System.out.println(token);
        LoginResponse loginResponse = new LoginResponse(token, jwtService.getExpirationTime());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@Valid @RequestBody VerifyDto verifyDto) {
        try {
            authenticationService.verifyUser(verifyDto);
            return ResponseEntity.ok("Account verified successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestBody String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/forget")
    public ResponseEntity<?> forgetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        boolean isUserExists = authenticationService.sendPasswordResetCode(email);
        if (isUserExists) {
            return ResponseEntity.ok("Verification code sent to your email.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetDto resetDto) {
        boolean isResetCodeValid = authenticationService.resetPassword(
                resetDto.getEmail(),
                resetDto.getPasswordResetCode(),
                resetDto.getNewPassword()
        );
        if (isResetCodeValid) {
            return ResponseEntity.ok("Password reset successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid verification code or email.");
        }
    }

    @GetMapping("/Data/UserData")
    public UserDataDto getUserData(@RequestParam Long userId) {
        return getUserDataService.getUserData(userId);
    }

    // src/main/java/com/example/controller/UserController.java
//    @GetMapping("/Data/Search")
//    public List<Object> searchUsers(@RequestParam String query) {
//        System.out.println(query);
//        return getUserDataService.searchUsers(query);
//    }

    @GetMapping("/Data/Search")
    public List<Object> searchUsersAndGroups(@RequestParam String query) {
        System.out.println("Search query: " + query);
        return getUserDataService.searchUsersAndGroups(query);
    }


    @GetMapping("/api/user")
    public String getCurrentUserId(@RequestParam(value = "authorizationHeader", required = false) String authorizationHeader) {
        logger.info("Authorization Token: {}", authorizationHeader); // Log the token
        System.out.println(authorizationHeader);

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer")) {
            logger.warn("Missing or malformed Authorization token");
            return "Missing or malformed Authorization token";
        }

        String token = authorizationHeader.substring(9); // Remove "Bearer " prefix
        logger.debug("Extracted token: {}", token); // Debug the token

        try {
            String currentUsername = jwtService.extractUsername(token); // Assuming this extracts user ID
            String currentUserId = String.valueOf(currentUserService.getCurrentUserIdWithUsername(currentUsername));
            System.out.println("Current User: "+currentUsername);
            System.out.println("Current User ID: "+currentUserId);
            logger.info("Extracted User ID: {}", currentUserId); // Log user ID
            return currentUserId;
        } catch (Exception e) {
            logger.error("Error extracting user ID: {}", e.getMessage());
            return "Invalid token";
        }
    }




}
