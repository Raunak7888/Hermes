package com.chatapp.auth.chatapp.components;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Base64;

@Service
public class Base64ToMultipartFileConverter{
    public MultipartFile base64toMultipartFile(String base64file,String filename, String contentType ) throws Exception{
        byte[] file = Base64.getDecoder().decode(base64file);
        return new MockMultipartFile(
                filename,
                filename,
                contentType,
                file
        );
    }
}
