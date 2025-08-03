package com.chatapp.auth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Group_Chats") // Table for messages
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "sender_id", nullable = false)
    private Long senderId; // ID of the message sender

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false) // Foreign key to Groups table
    @JsonIgnore // Prevents serialization
    private GroupDetails groupId; // Reference to the group

    @ManyToOne
    @JoinColumn(name = "file_id") // Ensure the name matches the database schema
    private UploadedFile uploadedFile;

    public Group(String content, GroupDetails groupId, Long senderId) {
        this.content = content;
        this.groupId = groupId;
        this.senderId = senderId;
        this.timestamp = LocalDateTime.now();
    }
}
