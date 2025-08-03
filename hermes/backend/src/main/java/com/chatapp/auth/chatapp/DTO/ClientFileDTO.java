package com.chatapp.auth.chatapp.DTO;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientFileDTO {
    private String file;
    private String fileName;
    private String fileType;
    private String fileSize;
    private Long userId;
    private Long receiverId;
    private long tempId;
    private String isGroup;
}
