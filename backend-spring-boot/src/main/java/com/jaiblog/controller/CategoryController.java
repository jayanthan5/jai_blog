package com.jaiblog.controller;

import com.jaiblog.dto.ApiResponse;
import com.jaiblog.model.mongodb.BlogDocument;
import com.jaiblog.service.BlogService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {

    private final BlogService blogService;

    @Data
    @AllArgsConstructor
    public static class CategoryDto {
        private String id;
        private String name;
        private String description;
        private String icon;
        private int blogCount;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        List<CategoryDto> categories = List.of(
            new CategoryDto("tech", "Technology", "Cloud architecture, full-stack development, and modern engineering", "Cpu", 12),
            new CategoryDto("lifestyle", "Lifestyle", "Mindful work habits, workspace aesthetics, and deep focus routines", "Coffee", 8),
            new CategoryDto("health", "Health & Wellness", "Physical posture, cognitive health, nutrition, and ergonomic desk setups", "HeartPulse", 5),
            new CategoryDto("business", "Business & Growth", "Digital scaling, product-led strategies, and team leadership", "TrendingUp", 7),
            new CategoryDto("design", "Design & UX", "Visual hierarchy, Figma workflows, and high-converting typography", "Palette", 9)
        );
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully.", categories));
    }

    @GetMapping("/{id}/blogs")
    public ResponseEntity<ApiResponse<List<BlogDocument>>> getBlogsByCategory(@PathVariable String id) {
        List<BlogDocument> blogs = blogService.getPublishedBlogs(id, null);
        return ResponseEntity.ok(ApiResponse.success("Category blogs retrieved successfully.", blogs));
    }
}
