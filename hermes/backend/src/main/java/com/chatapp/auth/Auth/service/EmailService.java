package com.chatapp.auth.Auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    // Method to send a verification or any other email
    public void sendEmail(String to, String subject, String text) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        try {
            helper.setTo(to);  // recipient's email
            helper.setSubject(subject);  // subject of the email
            helper.setText(text, true);  // body text with HTML enabled

            emailSender.send(message);  // send the message
        } catch (MessagingException e) {
            // Log the error and throw a custom exception if needed
            throw new MessagingException("Failed to send email to: " + to, e);
        }
    }

    // Method to send verification email with HTML content
    public void sendVerificationEmail(String to, String subject, String text) throws MessagingException {
        sendEmail(to, subject, text);
    }

    // Method to send password reset email with HTML content
    public void sendPasswordResetEmail(String to, String subject, String text) throws MessagingException {
        sendEmail(to, subject, text);
    }
}
