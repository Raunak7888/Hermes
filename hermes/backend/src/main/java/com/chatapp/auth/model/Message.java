package com.chatapp.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "sender_id", nullable = false)
    private Long senderId; // Stores the sender's ID

    @Column(name = "receiver_id")
    private Long receiverId; // Stores the receiver's ID for one-to-one messages

    @ManyToOne
    @JoinColumn(name = "file_id") // Ensure the name matches the database schema
    private UploadedFile uploadedFile;

//    public UploadedFile getUploadedFile() {
//        if(uploadedFile.getFiles_id() == null)) {
//            return
//        }
//        return uploadedFile;
//    }

    public Message() {
        this.timestamp = LocalDateTime.now(); // Default to current time if no timestamp is provided
    }



    // Constructor for group messages
    public Message(String content, Long senderId ,Long receiverId) {
        this.content = content;
        this.senderId = senderId;
        this.timestamp = LocalDateTime.now();
        this.receiverId = receiverId;
    }

}
