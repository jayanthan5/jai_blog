package com.jaiblog.controller;

import com.jaiblog.dto.ApiResponse;
import com.jaiblog.model.mongodb.BlogDocument;
import com.jaiblog.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BlogPublicController {

    private final BlogService blogService;

    @GetMapping("/blogs")
    public ResponseEntity<ApiResponse<List<BlogDocument>>> getPublishedBlogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<BlogDocument> blogs = blogService.getPublishedBlogs(category, search);
        return ResponseEntity.ok(ApiResponse.success("Published blogs retrieved successfully.", blogs));
    }

    @GetMapping("/blogs/{id}")
    public ResponseEntity<ApiResponse<BlogDocument>> getBlogDetails(@PathVariable String id) {
        BlogDocument blog = blogService.getPublishedBlogById(id);
        return ResponseEntity.ok(ApiResponse.success("Blog details retrieved successfully.", blog));
    }
}
