package com.chatapp.auth.Auth.service;

import com.chatapp.auth.Auth.dto.LoginUserDto;
import com.chatapp.auth.Auth.dto.SignupUserDto;
import com.chatapp.auth.Auth.dto.VerifyDto;
import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // Method to handle user signup
    @Transactional
    public User signup(SignupUserDto input) {
        if (userRepo.existsByEmail(input.getEmail())) {
            throw new RuntimeException("The email address is already registered.");
        }

        User user = new User(input.getUsername(), input.getEmail(), passwordEncoder.encode(input.getPassword()));
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpired(LocalDateTime.now().plusMinutes(15));
        user.setEnabled(false);

        sendVerificationEmail(user);

        return userRepo.save(user);
    }

    // Method to handle email verification
    @Transactional
    public boolean verifyEmail(String verificationCode) {
        Optional<User> optionalUser = userRepo.findByVerificationCode(verificationCode);

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found for verification.");
        }

        User user = optionalUser.get();

        if (user.getVerificationCodeExpired().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired.");
        }

        user.setEnabled(true);
        user.setVerificationCode(null);  // Remove verification code after successful verification
        userRepo.save(user);

        return true;
    }

    // Method to send password reset code
    @Transactional
    public boolean sendPasswordResetCode(String email) {
        Optional<User> optionalUser = userRepo.findByEmail(email.toLowerCase());

        if (optionalUser.isEmpty()) {
            return false;  // User not found
        }

        User user = optionalUser.get();
        if (user.getPasswordResetCodeExpired() != null && user.getPasswordResetCodeExpired().isAfter(LocalDateTime.now())) {
            return false;  // Reset code has not expired yet
        }

        user.setPasswordResetCode(generateVerificationCode());
        user.setPasswordResetCodeExpired(LocalDateTime.now().plusMinutes(15)); // Set expiration to 15 minutes from now
        userRepo.save(user);
        sendPasswordResetEmail(user);

        return true;
    }

    // Method to handle password reset
    @Transactional
    public boolean resetPassword(String email, String resetCode, String newPassword) {
        Optional<User> optionalUser = userRepo.findByEmail(email.toLowerCase());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found for password reset.");
        }

        User user = optionalUser.get();

        if (!resetCode.equals(user.getPasswordResetCode())) {
            throw new RuntimeException("Invalid reset code.");
        }

        if (user.getPasswordResetCodeExpired().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset code expired.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));  // Update password
        user.setPasswordResetCode(null);  // Clear reset code after password is reset
        user.setPasswordResetCodeExpired(null);  // Clear expiration date
        userRepo.save(user);

        return true;
    }

    // Method to verify user during login
    public void verifyUser(VerifyDto verifyDto) {
        Optional<User> optionalUser = userRepo.findByEmail(verifyDto.getEmail());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found for verification.");
        }

        User user = optionalUser.get();

        if (!user.getVerificationCode().equals(verifyDto.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code.");
        }

        if (user.getVerificationCodeExpired().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired.");
        }

        user.setEnabled(true);
        user.setVerificationCode(null); // Clear verification code after successful verification
        userRepo.save(user);
    }

    // Method to resend verification code
    public void resendVerificationCode(String email) {
        Optional<User> optionalUser = userRepo.findByEmail(email.toLowerCase());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found to resend verification code.");
        }

        User user = optionalUser.get();
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpired(LocalDateTime.now().plusMinutes(15));
        userRepo.save(user);

        sendVerificationEmail(user);  // Send the new verification email
    }

    // Method to authenticate user during login
    public User authenticate(LoginUserDto dto) {
        Optional<User> optionalUser = userRepo.findByEmail(dto.getEmail());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found.");
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password.");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Please verify your email first.");
        }

        return user;
    }

    // Helper method to generate a random verification code
    private String generateVerificationCode() {
        return String.valueOf((int) (Math.random() * 9000) + 1000);  // Generates a 4-digit code
    }

    // Helper method to send the verification email
    private void sendVerificationEmail(User user) {
        String subject = "Account Verification";
        String htmlMessage = createVerificationEmailHtml(user.getVerificationCode());
        sendEmail(user.getEmail(), subject, htmlMessage);
    }

    // Helper method to send the password reset email
    private void sendPasswordResetEmail(User user) {
        String subject = "Password Reset Request";
        String htmlMessage = createPasswordResetEmailHtml(user.getPasswordResetCode());
        sendEmail(user.getEmail(), subject, htmlMessage);
    }

    // Helper method to send emails
    private void sendEmail(String to, String subject, String text) {
        try {
            emailService.sendVerificationEmail(to, subject, text);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email.", e);
        }
    }

    // Helper method to create HTML for the verification email
    private String createVerificationEmailHtml(String verificationCode) {
        return "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to our app!</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }

    // Helper method to create HTML for the password reset email
    private String createPasswordResetEmailHtml(String resetCode) {
        return "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Password Reset Request</h2>"
                + "<p style=\"font-size: 16px;\">Please use the code below to reset your password:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Reset Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + resetCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }
}
