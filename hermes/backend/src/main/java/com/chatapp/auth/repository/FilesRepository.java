package com.chatapp.auth.repository;

import com.chatapp.auth.model.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FilesRepository extends JpaRepository<UploadedFile,Long> {
    List<UploadedFile> findByMessagesReceiverIdAndMessagesTimestampBetween(Long groupId,
                                                                           LocalDateTime startDateTime,
                                                                           LocalDateTime endDateTime);

    List<UploadedFile> findByMessagesSenderIdAndMessagesReceiverIdAndMessagesTimestampBetween(Long senderId,
                                                                                              Long receiverId,
                                                                                              LocalDateTime startDateTime,
                                                                                              LocalDateTime endDateTime);


}
