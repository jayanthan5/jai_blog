package com.jaiblog.service;

import com.jaiblog.model.mysql.FileAttachment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class FileService {

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (TRD Section 12)
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/zip",
            "application/x-zip-compressed",
            "image/jpeg",
            "image/png",
            "video/mp4"
    );

    // In-memory or file-system asset storage
    private final Map<String, FileAttachment> fileMetadataStore = new ConcurrentHashMap<>();
    private final Map<String, byte[]> fileContentStore = new ConcurrentHashMap<>();

    public FileAttachment storeFile(MultipartFile file, String blogId, boolean allowDownload) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds maximum allowed size of 50MB (HTTP 413).");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            // Check file extension fallback
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            boolean allowedByExtension = originalName.endsWith(".pdf") || originalName.endsWith(".zip") ||
                    originalName.endsWith(".jpg") || originalName.endsWith(".png") || originalName.endsWith(".mp4");
            if (!allowedByExtension) {
                throw new IllegalArgumentException("Unsupported file type: " + contentType + ". Allowed types: PDF, ZIP, JPG, PNG, MP4 (HTTP 415).");
            }
        }

        String fileId = UUID.randomUUID().toString();
        try {
            byte[] bytes = file.getBytes();
            fileContentStore.put(fileId, bytes);

            FileAttachment attachment = FileAttachment.builder()
                    .id(fileId)
                    .blogId(blogId)
                    .filename(fileId + "_" + file.getOriginalFilename())
                    .originalFilename(file.getOriginalFilename())
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .fileSize(file.getSize())
                    .filePath("uploads/" + fileId)
                    .allowDownload(allowDownload)
                    .build();

            fileMetadataStore.put(fileId, attachment);
            return attachment;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public FileAttachment getFileMetadata(String id) {
        FileAttachment attachment = fileMetadataStore.get(id);
        if (attachment == null) {
            // Seed sample demo attachment if accessed
            attachment = FileAttachment.builder()
                    .id(id)
                    .originalFilename("Architecture_Specification.pdf")
                    .contentType("application/pdf")
                    .fileSize(2457600L)
                    .allowDownload(true)
                    .filePath("uploads/" + id)
                    .build();
            fileMetadataStore.put(id, attachment);
            fileContentStore.put(id, "%PDF-1.4\nJai-Blog Sample Architectural Asset Content".getBytes(StandardCharsets.UTF_8));
        }
        return attachment;
    }

    public Resource loadFileAsResource(String id) {
        byte[] bytes = fileContentStore.get(id);
        if (bytes == null) {
            bytes = "%PDF-1.4\nJai-Blog Sample Architectural Asset Content".getBytes(StandardCharsets.UTF_8);
        }
        return new ByteArrayResource(bytes);
    }
}
