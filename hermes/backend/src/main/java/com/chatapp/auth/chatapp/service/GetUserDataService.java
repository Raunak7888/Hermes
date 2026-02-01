package com.chatapp.auth.chatapp.service;

import com.chatapp.auth.chatapp.DTO.UserDataDto;

import java.util.List;

public interface GetUserDataService {
        UserDataDto getUserData(Long userId);
        List<Object> searchUsersAndGroups(String query);
}
