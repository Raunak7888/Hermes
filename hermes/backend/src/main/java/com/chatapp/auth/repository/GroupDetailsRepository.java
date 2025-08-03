package com.chatapp.auth.repository;

import com.chatapp.auth.model.GroupDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupDetailsRepository extends JpaRepository<GroupDetails, Long> {
    boolean existsByGroupName(String groupName);
    List<GroupDetails> findByGroupNameContainingIgnoreCase(String query);
}
