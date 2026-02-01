package com.chatapp.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "files")
@Getter
@Setter
public class UploadedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long files_id;

    @Column(nullable = false,unique = true)
    String name;

    @Column(nullable = false)
    String type;

    Long size;

    @Column(nullable = false)
    String url;

    LocalDateTime upload_time;

    @OneToMany(mappedBy = "uploadedFile")
    private List<Message> messages;

    @OneToMany(mappedBy = "uploadedFile")
    private List<Group> groupMessages;


    @PrePersist
    protected void onCreate() {
        this.upload_time = LocalDateTime.now();
    }

}
