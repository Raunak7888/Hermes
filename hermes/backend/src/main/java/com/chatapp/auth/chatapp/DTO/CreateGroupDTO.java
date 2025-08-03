package com.chatapp.auth.chatapp.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class CreateGroupDTO {
    private String groupName;
    private Long createdBy; // ID of the user creating the group
    private List<Long> memberIds; // IDs of users to add to the group

}
