package com.chatapp.auth.chatapp.DTO;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MessageAcknowledgmentDTO {

    // Getters and setters
    private long tempId;
    private String status;

    public MessageAcknowledgmentDTO(long tempId, String status) {
        this.tempId = tempId;
        this.status = status;
    }

}
