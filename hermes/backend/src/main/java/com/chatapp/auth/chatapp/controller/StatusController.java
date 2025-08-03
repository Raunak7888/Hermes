package com.chatapp.auth.chatapp.controller;

import com.chatapp.auth.chatapp.DTO.StatusDTO;
import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Optional;

@Controller
public class StatusController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;


    @Autowired
    public StatusController(SimpMessagingTemplate messagingTemplate, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    @MessageMapping("/topic/status")
    @SendTo("/send/status")
    public void notifyStatusChange(StatusDTO status) {
        Long userId = status.getUserId();
        Optional<User> user = userRepository.findById(userId);
        String statusMessage = String.valueOf(user.get().isOnline());
        messagingTemplate.convertAndSend("/topic/status", statusMessage);
    }


}
