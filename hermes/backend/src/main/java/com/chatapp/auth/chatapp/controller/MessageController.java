package com.chatapp.auth.chatapp.controller;

import com.chatapp.auth.chatapp.DTO.MessageDTO;
import com.chatapp.auth.chatapp.service.MessageService;
import com.chatapp.auth.model.Group;
import com.chatapp.auth.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/auth/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // Endpoint to get messages between two users
    @GetMapping("/user")
    public ResponseEntity<?> getMessagesAndFilesBetweenUsers(
            @RequestParam Long senderId,
            @RequestParam Long receiverId,
            @RequestParam boolean isGroup
    ) {
        try {
            LocalDateTime startDateTime = LocalDateTime.now().minusDays(1).toLocalDate().atStartOfDay();
            LocalDateTime endDateTime = LocalDateTime.now();

            if (isGroup) {
                List<Group> groupMessages = messageService.getGroupsMessages(receiverId, startDateTime, endDateTime);
                return ResponseEntity.ok(groupMessages);
            } else {
                List<Message> userMessages = messageService.getMessagesBetweenUsers(senderId, receiverId, startDateTime, endDateTime);

                // Convert to DTO
                List<MessageDTO> response = userMessages.stream()
                        .map(MessageDTO::new)
                        .toList();

                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching messages and files.");
        }
    }






}