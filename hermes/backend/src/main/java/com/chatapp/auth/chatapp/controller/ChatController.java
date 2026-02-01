package com.chatapp.auth.chatapp.controller;

import com.chatapp.auth.chatapp.DTO.ClientFileDTO;
import com.chatapp.auth.chatapp.DTO.FileAcknowledgmentDTO;
import com.chatapp.auth.chatapp.DTO.MessageAcknowledgmentDTO;
import com.chatapp.auth.chatapp.DTO.MessageDTO;
import com.chatapp.auth.chatapp.components.Base64ToMultipartFileConverter;
import com.chatapp.auth.chatapp.service.FileService;
import com.chatapp.auth.chatapp.service.GetUserDataService;
import com.chatapp.auth.chatapp.service.MessageService;
import com.chatapp.auth.model.Group;
import com.chatapp.auth.model.Message;
import com.chatapp.auth.model.UploadedFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;

@Controller
public class ChatController {

    @Autowired
    private FileService fileService;

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    @Autowired
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final Base64ToMultipartFileConverter converter;

    public ChatController(MessageService messageService, GetUserDataService getUserDataService, SimpMessagingTemplate messagingTemplate, Base64ToMultipartFileConverter converter) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.converter = converter;
    }

    /**
     * Handles sending of a private message.
     * @param messageDTO DTO containing message content and sender information.
     */
    @MessageMapping("/send/message")
    public void sendMessage(MessageDTO messageDTO) {
        // Log incoming message content and receiver ID for tracking
        logger.info("Received message: '{}' from sender ID: {} to receiver ID: {}",
                messageDTO.getContent(), messageDTO.getSenderId(), messageDTO.getReceiverId());

        try {
            // Save the message to the database
            Message savedMessage = messageService.savePrivateMessage(messageDTO);

            // Log the saved message content
            logger.info("Message successfully saved: {}", savedMessage.getContent());
            
            // Notify the receiver
            String destination = "/topic/user/" + messageDTO.getReceiverId() + "/queue/private";
            logger.info("Sending message to destination: {}", destination);
            messagingTemplate.convertAndSend(destination, convertToDTO(savedMessage,messageDTO.getTempId(),null));

            // Notify the sender about successful delivery
            String senderAcknowledgmentDestination = "/topic/user/" + messageDTO.getSenderId() + "/queue/ack";
            MessageAcknowledgmentDTO acknowledgment = new MessageAcknowledgmentDTO(
                    messageDTO.getTempId(), "sent");
            logger.info("Sending acknowledgment to sender: {}", senderAcknowledgmentDestination);
            messagingTemplate.convertAndSend(senderAcknowledgmentDestination, acknowledgment);

        } catch (Exception e) {
            logger.error("Error saving message: {}", e.getMessage());

            // Notify the sender about the failure
            String senderAcknowledgmentDestination = "/topic/user/" + messageDTO.getSenderId() + "/queue/ack";
            MessageAcknowledgmentDTO acknowledgment = new MessageAcknowledgmentDTO(
                    messageDTO.getTempId(), "failed");
            messagingTemplate.convertAndSend(senderAcknowledgmentDestination, acknowledgment);

            throw new RuntimeException("Message could not be saved due to an error.");
        }
    }




    @MessageMapping("/send/image")
    public void sendImage(ClientFileDTO fileDTO) {

        Boolean isGroup = Boolean.parseBoolean(fileDTO.getIsGroup());
        if (fileDTO.getFile() == null || fileDTO.getUserId() == null || fileDTO.getReceiverId() == null) {
            logger.error("Invalid input: fileDTO or required fields are null");
            throw new IllegalArgumentException("Invalid input: fileDTO or required fields are null");
        }
        
        try {
            MultipartFile file = converter.base64toMultipartFile(fileDTO.getFile(),fileDTO.getFileName(),fileDTO.getFileType());
            UploadedFile savedUploadedFile = fileService.storeFile(file);

            if(!isGroup){
        
            logger.info("Image saved successfully for Sender ID: {}, Receiver ID: {}", fileDTO.getUserId(), fileDTO.getReceiverId());
            
            Message message = messageService.imageDetail(fileDTO.getUserId(), fileDTO.getReceiverId(), savedUploadedFile);
            
            logger.info("Image details saved successfully for Sender ID: {}, Receiver ID: {}", fileDTO.getUserId(), fileDTO.getReceiverId());

            if(!fileDTO.getUserId().equals(fileDTO.getReceiverId())){
                String receiverDestination = "/topic/user/" + fileDTO.getReceiverId() + "/queue/private";

                messagingTemplate.convertAndSend(receiverDestination, convertToDTO(message,fileDTO.getTempId(), savedUploadedFile.getName()));

                logger.info("Image sent successfully to Receiver ID: {}", fileDTO.getReceiverId());
            }
            
            FileAcknowledgmentDTO acknowledgment = new FileAcknowledgmentDTO(
                    message.getId(),
                    "---FILE---",
                    fileDTO.getUserId(),
                    fileDTO.getReceiverId(),
                    fileDTO.getTempId(),
                    savedUploadedFile.getName(),
                    isGroup,
                    "sent"
            );
            String senderAckDestination = "/topic/user/" + fileDTO.getUserId() + "/queue/ack";
            messagingTemplate.convertAndSend(senderAckDestination, acknowledgment);
            logger.info("Image acknowledgment sent successfully. Sender ID: {}, Receiver ID: {}", fileDTO.getUserId(), fileDTO.getReceiverId());
            }else{
                UploadedFile groupImage = fileService.storeFile(file);

                Group message = messageService.groupImageDetail(fileDTO.getUserId(), fileDTO.getReceiverId(), groupImage);

                String receiverLocation = "/topic/group/" + fileDTO.getReceiverId();
                messagingTemplate.convertAndSend(receiverLocation,convertToDTO(message,fileDTO.getTempId(), groupImage.getName(), fileDTO.getReceiverId()));
                FileAcknowledgmentDTO acknowledgmentDTO = new FileAcknowledgmentDTO(
                    message.getId(),
                    "---FILE---",
                    fileDTO.getUserId(),
                    fileDTO.getReceiverId(),
                    fileDTO.getTempId(),
                    savedUploadedFile.getName(),
                    isGroup,
                    "sent"
                );
                String senderAckDestination = "/topic/group/" + fileDTO.getUserId() + "/ack";
                messagingTemplate.convertAndSend(senderAckDestination,acknowledgmentDTO);
            }
        } catch (IOException e) {
            logger.error("Failed to save image for Sender ID: {}, Receiver ID: {}. Error: {}",
                    fileDTO.getUserId(), fileDTO.getReceiverId(), e.getMessage(), e);
            throw new RuntimeException("Failed to save image", e);
        } catch (Exception e) {
            logger.error("Unexpected error occurred while sending image. Sender ID: {}, Receiver ID: {}. Error: {}, TempId: {}",
                    fileDTO.getUserId(), fileDTO.getReceiverId(), e.getMessage(), fileDTO.getTempId(), e);
            throw new RuntimeException("Unexpected error occurred", e);
        }
    }



    /**
     * Converts a Message entity to a MessageDTO.
     * @param message The message entity to convert.
     * @return MessageDTO representing the message.
     */
    private MessageDTO convertToDTO(Message message,Long tempID,String filename) {
        // Map entity fields to DTO fields
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setSenderId(message.getSenderId());
        dto.setReceiverId(message.getReceiverId());
        dto.setTempId(tempID); // Added tempId for tracking acknowledgments in the sender side
        if(message.getContent().equals("---FILE---")) {
            dto.setFileName(filename);
        }

        // Log the conversion for debugging
        logger.debug("Converted message ID {} to DTO", message.getId());

        return dto;
    }

    private MessageDTO convertToDTO (Group message,Long tempId,String filename,Long groupId){
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setSenderId(message.getSenderId());
        dto.setReceiverId(groupId);
        dto.setTempId(tempId);
        dto.setFileName(filename);
        return dto;
    } 

}
