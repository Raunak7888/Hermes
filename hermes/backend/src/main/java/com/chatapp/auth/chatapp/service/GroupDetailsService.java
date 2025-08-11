package com.chatapp.auth.chatapp.service;

import com.chatapp.auth.chatapp.DTO.GroupDTO;
import com.chatapp.auth.model.Group;
import com.chatapp.auth.model.GroupDetails;
import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.GroupDetailsRepository;
import com.chatapp.auth.repository.GroupRepository;
import com.chatapp.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupDetailsService {

    private final GroupRepository groupRepository;
    private final GroupDetailsRepository groupDetailsRepository;
    private final UserRepository userRepository;

    public GroupDetailsService(GroupRepository groupRepository, GroupDetailsRepository groupDetailsRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.groupDetailsRepository = groupDetailsRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new group with specified members.
     * @param groupName the name of the group
     * @param createdBy the ID of the user creating the group
     * @param memberIds list of user IDs to be added as group members
     * @return the created GroupDetails entity
     */
    public GroupDetails createGroup(String groupName, Long createdBy, List<Long> memberIds) {
        // Check if a group with the same name already exists
        if (groupDetailsRepository.existsByGroupName(groupName)) {
            throw new IllegalArgumentException("A group with this name already exists.");
        }

        // Create a new GroupDetails entity
        GroupDetails groupDetails = new GroupDetails(groupName, createdBy);

        // Fetch users by IDs
        List<User> members = userRepository.findAllById(memberIds);

        // Add the creator to the member list
        User creator = userRepository.findById(createdBy)
                .orElseThrow(() -> new IllegalArgumentException("Creator user not found."));
        members.add(creator);

        // Add all members (including creator) to the group
        groupDetails.getMembers().addAll(members);

        // Save the group to the database
        return groupDetailsRepository.save(groupDetails);
    }

    public void saveMessage(GroupDTO groupDTO) {
        GroupDetails groupDetails = groupDetailsRepository.findById(groupDTO.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        Group message = new Group(
                groupDTO.getContent(),
                groupDetails,
                groupDTO.getSenderId()
        );
        message.setTimestamp(LocalDateTime.now());
        groupRepository.save(message);
    }
}
