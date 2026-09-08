package com.jaiblog.service;

import com.jaiblog.model.mongodb.BlogDocument;
import com.jaiblog.repository.mongodb.BlogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;

    public List<BlogDocument> getPublishedBlogs(String category, String search) {
        List<BlogDocument> blogs;
        if (category != null && !category.equalsIgnoreCase("all") && !category.isBlank()) {
            blogs = blogRepository.findByStatusAndCategoryIdOrderByCreatedAtDesc("PUBLISHED", category.toLowerCase());
        } else {
            blogs = blogRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED");
        }

        if (search != null && !search.isBlank()) {
            String searchLower = search.toLowerCase().trim();
            blogs = blogs.stream()
                    .filter(b -> (b.getTitle() != null && b.getTitle().toLowerCase().contains(searchLower)) ||
                                 (b.getCategoryName() != null && b.getCategoryName().toLowerCase().contains(searchLower)) ||
                                 (b.getShortDescription() != null && b.getShortDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        return blogs;
    }

    public BlogDocument getPublishedBlogById(String id) {
        return blogRepository.findById(id)
                .filter(b -> "PUBLISHED".equals(b.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("Blog post not found or not published."));
    }

    public List<BlogDocument> getAllBlogsForAdmin() {
        return blogRepository.findAllByOrderByCreatedAtDesc();
    }

    public BlogDocument createBlog(BlogDocument blog) {
        if (blog.getId() == null || blog.getId().isBlank()) {
            blog.setId(UUID.randomUUID().toString());
        }
        if (blog.getStatus() == null) {
            blog.setStatus("DRAFT");
        }
        blog.setCreatedAt(Instant.now());
        blog.setUpdatedAt(Instant.now());
        if ("PUBLISHED".equals(blog.getStatus())) {
            blog.setPublishedAt(Instant.now());
        }
        return blogRepository.save(blog);
    }

    public BlogDocument updateBlog(String id, BlogDocument update) {
        BlogDocument existing = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found: " + id));

        existing.setTitle(update.getTitle());
        existing.setAuthor(update.getAuthor());
        existing.setCategoryId(update.getCategoryId());
        existing.setCategoryName(update.getCategoryName());
        existing.setShortDescription(update.getShortDescription());
        existing.setThumbnail(update.getThumbnail());
        existing.setAllowDownload(update.isAllowDownload());
        existing.setAttachedFileId(update.getAttachedFileId());
        existing.setAttachedFileName(update.getAttachedFileName());
        existing.setAttachedFileSize(update.getAttachedFileSize());
        existing.setAttachedContentType(update.getAttachedContentType());
        existing.setElements(update.getElements());
        existing.setUpdatedAt(Instant.now());

        if ("PUBLISHED".equals(update.getStatus()) && !"PUBLISHED".equals(existing.getStatus())) {
            existing.setStatus("PUBLISHED");
            existing.setPublishedAt(Instant.now());
        } else if (update.getStatus() != null) {
            existing.setStatus(update.getStatus());
        }

        return blogRepository.save(existing);
    }

    public void deleteBlog(String id) {
        blogRepository.deleteById(id);
    }

    public BlogDocument publishBlog(String id) {
        BlogDocument blog = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found: " + id));
        blog.setStatus("PUBLISHED");
        blog.setPublishedAt(Instant.now());
        blog.setUpdatedAt(Instant.now());
        return blogRepository.save(blog);
    }

    public BlogDocument saveAsDraft(String id) {
        BlogDocument blog = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found: " + id));
        blog.setStatus("DRAFT");
        blog.setUpdatedAt(Instant.now());
        return blogRepository.save(blog);
    }
}
