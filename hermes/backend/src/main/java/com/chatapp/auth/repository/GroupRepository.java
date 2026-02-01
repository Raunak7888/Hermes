package com.chatapp.auth.repository;

import com.chatapp.auth.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    // Fix the query to reference the GroupDetails' ID
    List<Group> findByGroupId_Id(Long groupId);  // Use `groupId_Id` to refer to the ID of the GroupDetails
    List<Group> findByGroupIdIdAndTimestampBetween(Long groupId, LocalDateTime startDateTime, LocalDateTime endDateTime);

}
