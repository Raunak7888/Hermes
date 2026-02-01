package com.chatapp.auth.chatapp.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileDTO {
    @NotNull(message = "Name cannot be null")
    private String name;
    @NotNull(message = "Type cannot be null")
    private String type;
    @NotNull(message = "Content cannot be null")
    private String content;
    @NotNull(message = "Size cannot be null")
    private long size;

    public FileDTO(String name, String type, String content, long size) {
        this.name = name;
        this.type = type;
        this.content = content;
        this.size = size;
    }

    public FileDTO() {

    }
}
