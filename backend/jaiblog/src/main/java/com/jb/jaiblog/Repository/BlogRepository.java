package com.jb.jaiblog.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.jb.jaiblog.Entity.Blog;

public interface BlogRepository extends JpaRepository<Blog,Integer> {
}