package com.chatapp.auth.chatapp.service;

import com.chatapp.auth.model.UploadedFile;
import com.chatapp.auth.repository.FilesRepository;
import com.chatapp.auth.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FileService {

    @Value("${uploadedFile.upload-dir}")
    private String uploadDir;

    @Autowired
    private final FilesRepository filesRepository;

    public FileService(FilesRepository filesRepository, MessageRepository messageRepository) {
        this.filesRepository = filesRepository;
    }

    public UploadedFile storeFile(MultipartFile file) throws IOException {

        // Generate a random filename with the original file name
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        fileName = fileName.replaceAll("\\s", "_");


        // Define the target location with the file name appended
        Path targetLocation = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);

        try {
            // Copy the file to the target location
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            // Log the exception and throw a RuntimeException with a custom message
            System.err.println("Error copying file: " + e.getMessage());
            throw new RuntimeException("Failed to copy the file to target location", e);
        }
        


        // Save the file metadata to the database
        UploadedFile uploadedFileEntity = new UploadedFile();
        uploadedFileEntity.setName(fileName);
        uploadedFileEntity.setType(file.getContentType());
        uploadedFileEntity.setSize(file.getSize());
        uploadedFileEntity.setUrl("/uploads/" + fileName);
        uploadedFileEntity.setUpload_time(LocalDateTime.now());

        return filesRepository.save(uploadedFileEntity);
    }

}

