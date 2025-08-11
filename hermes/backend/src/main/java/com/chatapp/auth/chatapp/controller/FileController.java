package com.chatapp.auth.chatapp.controller;

import com.chatapp.auth.chatapp.DTO.FileDTO;
import com.chatapp.auth.chatapp.service.FileService;
import com.chatapp.auth.model.Message;
import com.chatapp.auth.model.UploadedFile;
import com.chatapp.auth.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;


@RestController
@RequestMapping("/auth")
public class FileController {

    @Value("${uploadedFile.upload-dir}")
    private String uploadDir;

//    @PostMapping("/files/upload")
//    public ResponseEntity<UploadedFile> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("userId") Long userId, @RequestParam("receiverId") Long receiverId) {
//        try {
//            UploadedFile savedUploadedFile = fileService.storeFile(file);
//            Message message = new Message();
//            message.setContent("---FILE---");
//            message.setSenderId(userId);
//            message.setReceiverId(receiverId);
//            message.setUploadedFile(savedUploadedFile); // Associate the UploadedFile entity with the Message
//            messageRepository.save(message);
//            return ResponseEntity.ok(savedUploadedFile);
//        } catch (IOException e) {
//            return ResponseEntity.internalServerError().build();
//        }
//    }

    @GetMapping("/files/show")
    public ResponseEntity<FileDTO> showFile(@RequestParam("filename") String filename) {
        String folderPath = uploadDir;
        try {
            Path filePath = Paths.get(folderPath, filename);
            if (Files.exists(filePath)) {
                FileDTO fileDTO = new FileDTO();
                fileDTO.setName(filename);
                fileDTO.setType(Files.probeContentType(filePath));
                fileDTO.setSize(Files.size(filePath));
                fileDTO.setContent(Base64.getEncoder().encodeToString(Files.readAllBytes(filePath)));
                return ResponseEntity.ok(fileDTO);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null); // Return 404 if the file is not found
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }




}



