package com.jaiblog.controller;

import com.jaiblog.dto.ApiResponse;
import com.jaiblog.model.mysql.FileAttachment;
import com.jaiblog.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FileController {

    private final FileService fileService;

    @PostMapping("/admin/files")
    public ResponseEntity<ApiResponse<FileAttachment>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "blogId", required = false) String blogId,
            @RequestParam(value = "allowDownload", defaultValue = "false") boolean allowDownload) {
        
        FileAttachment attachment = fileService.storeFile(file, blogId, allowDownload);
        return ResponseEntity.ok(ApiResponse.success("File uploaded and encrypted successfully.", attachment));
    }

    @GetMapping("/files/{id}/download")
    public ResponseEntity<?> downloadFile(@PathVariable String id) {
        FileAttachment attachment = fileService.getFileMetadata(id);

        // Security check (TRD Section 12 & FILE-04):
        // The backend is the security boundary! Reject download if allowDownload is false!
        if (!attachment.isAllowDownload()) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Access Denied: The author has restricted downloads for this asset.", "DOWNLOAD_RESTRICTED"));
        }

        Resource resource = fileService.loadFileAsResource(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
                .body(resource);
    }
}
