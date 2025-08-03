package com.chatapp.auth.chatapp.service;

import com.chatapp.auth.chatapp.DTO.UserDataDto;
import com.chatapp.auth.model.GroupDetails;
import com.chatapp.auth.model.User;
import com.chatapp.auth.repository.GroupDetailsRepository;
import com.chatapp.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GetUserDataServiceImpl implements GetUserDataService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupDetailsRepository groupDetailsRepository;

    @Override
    public UserDataDto getUserData(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            return new UserDataDto(user.getId(), user.getUsername(),false);
        }
        return null; // Or handle the user not found case accordingly
    }

    @Override
    public List<Object> searchUsersAndGroups(String query) {
        // Search users by username
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);

        // Convert user results to DTOs
        List<UserDataDto> userResults = users.stream()
                .map(user -> new UserDataDto(user.getId(), user.getUsername(),false))
                .collect(Collectors.toList());

        // Search groups by group name
        List<GroupDetails> groups = groupDetailsRepository.findByGroupNameContainingIgnoreCase(query);

        // Convert group results to DTOs
        List<UserDataDto> groupResults = groups.stream()
                .map(group -> new UserDataDto(group.getId(), group.getGroupName(),true))
                .collect(Collectors.toList());

        // Combine user and group results into a single list
        List<Object> combinedResults = new ArrayList<>();
        combinedResults.addAll(userResults);
        combinedResults.addAll(groupResults);

        return combinedResults;
    }

}
