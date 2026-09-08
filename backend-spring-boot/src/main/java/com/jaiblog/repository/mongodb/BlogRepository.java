package com.jaiblog.repository.mongodb;

import com.jaiblog.model.mongodb.BlogDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends MongoRepository<BlogDocument, String> {
    List<BlogDocument> findByStatusOrderByCreatedAtDesc(String status);
    List<BlogDocument> findByStatusAndCategoryIdOrderByCreatedAtDesc(String status, String categoryId);
    List<BlogDocument> findAllByOrderByCreatedAtDesc();
}
