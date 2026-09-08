package com.jaiblog.model.mongodb;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "blogs")
public class BlogDocument {
    @Id
    private String id;
    private String title;
    private String author;
    private String categoryId;
    private String categoryName;
    private String shortDescription;
    private String status; // "DRAFT" or "PUBLISHED"
    private boolean allowDownload;
    private String attachedFileId;
    private String attachedFileName;
    private Long attachedFileSize;
    private String attachedContentType;
    private String thumbnail;
    private List<BuilderElement> elements;
    private Map<String, Object> metadata;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant publishedAt;
}
