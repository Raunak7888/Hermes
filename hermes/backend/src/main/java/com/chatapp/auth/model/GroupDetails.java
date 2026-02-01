package com.chatapp.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "Group_Name")
public class GroupDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String groupName;

    @Column(nullable = false)
    private Long createdBy; // ID of the user who created the group

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "groupId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Group> groupChats; // Messages in the group

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "Group_Members",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>(); // Users in the group

    public GroupDetails(String groupName, Long createdBy) {
        this.groupName = groupName;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }
}
