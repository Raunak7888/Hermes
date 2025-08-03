package com.chatapp.auth.chatapp.DTO;

import lombok.Data;

@Data
public class UserDataDto {
    private Long id;
    private String name;
    private boolean isGroup;

    // Constructors
    public UserDataDto() {}

    public UserDataDto(Long id, String name, boolean isGroup) {
        this.id = id;
        this.name = name;
        this.isGroup = isGroup;
    }

}
