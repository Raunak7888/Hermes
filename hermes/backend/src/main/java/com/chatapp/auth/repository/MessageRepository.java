package com.chatapp.auth.repository;

import com.chatapp.auth.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE " +
            "((m.senderId = :senderId AND m.receiverId = :receiverId) OR " +
            "(m.senderId = :receiverId AND m.receiverId = :senderId)) AND " +
            "m.timestamp BETWEEN :startDateTime AND :endDateTime " +
            "ORDER BY m.timestamp ASC")
    List<Message> findMessagesBetweenUsers(Long senderId, Long receiverId, LocalDateTime startDateTime, LocalDateTime endDateTime);

}
