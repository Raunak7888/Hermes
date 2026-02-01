package com.chatapp.auth.chatapp.controller;

import com.chatapp.auth.chatapp.DTO.CreateGroupDTO;
import com.chatapp.auth.chatapp.DTO.GroupDTO;
import com.chatapp.auth.chatapp.DTO.MessageAcknowledgmentDTO;
import com.chatapp.auth.model.GroupDetails;
import com.chatapp.auth.chatapp.service.GroupDetailsService;
import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.MessageRepository;
import com.chatapp.auth.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;


@RestController
public class GroupDetailsController {

    private static final Logger logger =
            LoggerFactory.getLogger(GroupDetailsController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final GroupDetailsService groupDetailsService;
    private final UserRepository userRepository;

    public GroupDetailsController(
            SimpMessagingTemplate messagingTemplate,
            GroupDetailsService groupDetailsService,
            UserRepository userRepository
    ) {
        this.messagingTemplate = messagingTemplate;
        this.groupDetailsService = groupDetailsService;
        this.userRepository = userRepository;
    }

    @PostMapping("/auth/create")
    public ResponseEntity<GroupDetails> createGroup(@RequestBody CreateGroupDTO request) {
        // Log for debugging

        // Call the service to create the group with members
        GroupDetails groupDetails = groupDetailsService.createGroup(
                request.getGroupName(),
                request.getCreatedBy(),
                request.getMemberIds()
        );

        // Log for debugging

        // Return the created group
        return ResponseEntity.ok(groupDetails);
    }

    @MessageMapping("/group/message") // Clients send messages to /app/group/message
    public void sendMessage(GroupDTO groupDTO) {
        logger.info("Received message: '{}' from sender ID: {} to group ID: {}",
                groupDTO.getContent(), groupDTO.getSenderId(), groupDTO.getGroupId());
        try {
            // Save the message to the database

            groupDetailsService.saveMessage(groupDTO);
            logger.info("Message successfully saved to group");

            User sender = userRepository.findById(groupDTO.getSenderId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + groupDTO.getSenderId()));


            logger.info("Message successfully sent to group: {}",sender.getUsername());

            groupDTO.setSenderName(sender.getUsername());

            messagingTemplate.convertAndSend("/topic/group/" + groupDTO.getGroupId(), groupDTO);
            logger.info("Message successfully sent to group: {}", groupDTO.getGroupId());

            String senderAcknowledgmentDestination = "/topic/group/" + groupDTO.getSenderId() + "/ack";
            MessageAcknowledgmentDTO acknowledgment = new MessageAcknowledgmentDTO(
                    groupDTO.getTempId(), "sent");
            logger.info("Sending acknowledgment to sender: {}", senderAcknowledgmentDestination);
            messagingTemplate.convertAndSend(senderAcknowledgmentDestination, acknowledgment);
        } catch (Exception e) {
            logger.error("Error sending message: {}", e.getMessage());
            throw new RuntimeException("Error processing the message.");
        }
    }
}
