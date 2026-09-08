package com.jaiblog.controller;

import com.jaiblog.dto.ApiResponse;
import com.jaiblog.model.mongodb.BlogDocument;
import com.jaiblog.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/blogs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BlogAdminController {

    private final BlogService blogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BlogDocument>>> getAllAdminBlogs() {
        List<BlogDocument> blogs = blogService.getAllBlogsForAdmin();
        return ResponseEntity.ok(ApiResponse.success("Admin blogs retrieved successfully.", blogs));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BlogDocument>> createBlog(@RequestBody BlogDocument blogDocument) {
        BlogDocument created = blogService.createBlog(blogDocument);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blog created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogDocument>> updateBlog(
            @PathVariable String id,
            @RequestBody BlogDocument blogDocument) {
        BlogDocument updated = blogService.updateBlog(id, blogDocument);
        return ResponseEntity.ok(ApiResponse.success("Blog updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBlog(@PathVariable String id) {
        blogService.deleteBlog(id);
        return ResponseEntity.ok(ApiResponse.success("Blog deleted successfully.", null));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<BlogDocument>> publishBlog(@PathVariable String id) {
        BlogDocument published = blogService.publishBlog(id);
        return ResponseEntity.ok(ApiResponse.success("Blog published to public site successfully.", published));
    }

    @PostMapping("/{id}/draft")
    public ResponseEntity<ApiResponse<BlogDocument>> saveAsDraft(@PathVariable String id) {
        BlogDocument draft = blogService.saveAsDraft(id);
        return ResponseEntity.ok(ApiResponse.success("Blog saved as draft successfully.", draft));
    }
}
