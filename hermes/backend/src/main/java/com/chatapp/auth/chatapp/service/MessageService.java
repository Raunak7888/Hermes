package com.chatapp.auth.chatapp.service;

import com.chatapp.auth.chatapp.DTO.MessageDTO;
import com.chatapp.auth.model.UploadedFile;
import com.chatapp.auth.model.Group;
import com.chatapp.auth.model.GroupDetails;
import com.chatapp.auth.model.Message;
import com.chatapp.auth.repository.FilesRepository;
import com.chatapp.auth.repository.GroupDetailsRepository;
import com.chatapp.auth.repository.GroupRepository;
import com.chatapp.auth.repository.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    @Autowired
    private final MessageRepository messageRepository;
    @Autowired
    private final GroupRepository groupRepository;
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    @Autowired
    private final FilesRepository filesRepository;
    private final GroupDetailsRepository groupDetailsRepository;


    public MessageService(MessageRepository messageRepository, GroupRepository groupRepository, FilesRepository filesRepository,GroupDetailsRepository groupDetailsRepository) {
        this.messageRepository = messageRepository;
        this.groupRepository = groupRepository;
        this.filesRepository = filesRepository;
        this.groupDetailsRepository = groupDetailsRepository;

    }

    @Transactional
    public Message savePrivateMessage(MessageDTO messageDTO) {
        // Validate MessageDTO before processing
        validateMessageDTO(messageDTO);

        // Log message details for tracking
        logger.info("Received message from user {} to user {} with content: {}", messageDTO.getSenderId(), messageDTO.getReceiverId(), messageDTO.getContent());
        Message savedMessage = null;

        try {

            // Create a new Message and set necessary fields
            Message message = new Message();
            message.setContent(messageDTO.getContent());
            message.setTimestamp(LocalDateTime.now());
            message.setSenderId(messageDTO.getSenderId());
            message.setReceiverId(messageDTO.getReceiverId());


            // Save message to the repository
            savedMessage = messageRepository.save(message);

            // Log the successful message save
            logger.info("Message successfully saved with ID: {}", savedMessage.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to save message");
        }

        return savedMessage;
    }

    private void validateMessageDTO(MessageDTO messageDTO) {
        // Ensure that the messageDTO is not null and contains the necessary fields
        if (messageDTO == null || messageDTO.getContent() == null || messageDTO.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be null or empty.");
        }

        // Ensure that both sender and receiver IDs are present
        if (messageDTO.getSenderId() == null || messageDTO.getReceiverId() == null) {
            throw new IllegalArgumentException("Both sender and receiver IDs must be provided.");
        }
    }

    public List<Message> getMessagesBetweenUsers(Long senderId, Long receiverId, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        return messageRepository.findMessagesBetweenUsers(senderId, receiverId, startDateTime, endDateTime);
    }

    public List<Group> getGroupsMessages(Long groupId, LocalDateTime startDateTime, LocalDateTime endDateTime){
        return groupRepository.findByGroupIdIdAndTimestampBetween(groupId, startDateTime, endDateTime);
    }
    public List<UploadedFile> getFilesForGroup(Long groupId, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        // Query the database to fetch files linked to messages in the group
        return filesRepository.findByMessagesReceiverIdAndMessagesTimestampBetween(groupId, startDateTime, endDateTime);
    }

    // Fetch files for direct messages
    public List<UploadedFile> getFileBetweenUsers(Long senderId, Long receiverId, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        // Query the database to fetch files linked to messages between users
        return filesRepository.findByMessagesSenderIdAndMessagesReceiverIdAndMessagesTimestampBetween(senderId, receiverId, startDateTime, endDateTime);
    }

    public Message imageDetail(Long userId,Long receiverId,UploadedFile savedUploadedFile){
            Message message = new Message();
            message.setContent("---FILE---");
            message.setSenderId(userId);
            message.setReceiverId(receiverId);
            message.setUploadedFile(savedUploadedFile); // Associate the UploadedFile entity with the Message
            messageRepository.save(message);
            return message;
    }

    public Group groupImageDetail(Long userId, Long groupId, UploadedFile savedUploadedFile){
        GroupDetails groupDetails = groupDetailsRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        Group message = new Group();
        message.setContent("---FILE---");
        message.setSenderId(userId);
        message.setTimestamp(LocalDateTime.now());
        message.setGroupId(groupDetails);
        message.setUploadedFile(savedUploadedFile);
        return message;
    }
}
