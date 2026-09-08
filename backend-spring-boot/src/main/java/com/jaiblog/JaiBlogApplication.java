package com.jaiblog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.jaiblog.repository.mysql")
@EnableMongoRepositories(basePackages = "com.jaiblog.repository.mongodb")
public class JaiBlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(JaiBlogApplication.class, args);
        System.out.println("Jai-Blog Spring Boot API Server running on port 8080");
    }
}
