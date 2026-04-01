package com.jb.jaiblog.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.jb.jaiblog.Entity.Blog;
import com.jb.jaiblog.Repository.BlogRepository;

@RestController
@RequestMapping("/api/blogs")
@CrossOrigin(origins="http://localhost:5173")
public class BlogController {

    @Autowired
    private BlogRepository blogRepository;

    @PostMapping
    public Blog createBlog(@RequestBody Blog blog){
        return blogRepository.save(blog);
    }

    @GetMapping
    public java.util.List<Blog> getAllBlogs(){
        return blogRepository.findAll();
    }
}