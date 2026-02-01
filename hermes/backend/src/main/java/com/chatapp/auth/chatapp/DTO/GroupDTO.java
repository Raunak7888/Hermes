package com.chatapp.auth.chatapp.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupDTO {
    @NotNull(message = "Content cannot be null")
    private String content;
    private String senderName;
    private LocalDateTime timestamp;

    @NotNull(message = "Sender ID cannot be null")
    private Long senderId;

    @NotNull(message = "Group ID cannot be null")
    private Long groupId;

    private Long tempId;

    public GroupDTO(Long id, String groupName) {
        this.groupId = id;
        this.content = groupName;
    }
}
