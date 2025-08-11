package com.chatapp.auth.chatapp.DTO;

import com.chatapp.auth.model.Message;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Content cannot be null")
    private String content;

    private LocalDateTime timestamp;

    @NotNull(message = "Sender ID cannot be null")
    private Long senderId;


    private Long receiverId;  // For one-to-one messages

    @NotNull(message = "temp ID cannot be Null")
    private Long tempId;

    private String fileName;
    private String status = "sent";
    public MessageDTO(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
        this.senderId = message.getSenderId();
        this.receiverId = message.getReceiverId();

        if(message.getUploadedFile() != null && message.getUploadedFile().getFiles_id() != null){
            this.fileName = message.getUploadedFile().getName();
        }
    }

}
