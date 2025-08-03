package com.chatapp.auth.chatapp.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class FileAcknowledgmentDTO {
    private Long id;
    private String content;
    private Long senderId;
    private Long receiverId;
    private Long tempId;
    private String fileName;
    private boolean isGroup;
    private String status;



}
