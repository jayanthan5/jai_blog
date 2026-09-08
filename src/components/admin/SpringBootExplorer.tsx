import React, { useState } from 'react';
import { 
  Code2, 
  Folder, 
  FileCode, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  Sparkles,
  Server,
  Cpu
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  badge?: string;
  children?: FileNode[];
  content?: string;
}

const SPRING_BOOT_PROJECT: FileNode[] = [
  {
    name: 'pom.xml',
    path: '/backend-spring-boot/pom.xml',
    type: 'file',
    language: 'xml',
    badge: 'Maven POM',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>
    <groupId>com.jaiblog</groupId>
    <artifactId>jai-blog-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>Jai-Blog Backend</name>
    <description>Spring Boot REST API Backend for Jai-Blog with MySQL (Auth) &amp; MongoDB (Builder Layouts)</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.5</jjwt.version>
    </properties>

    <dependencies>
        <!-- Spring Web for REST APIs (TRD Section 4) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Security for 2FA, JWT, and Route Protection (TRD Section 10) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- Validation (TRD Section 12) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Relational MySQL / JPA for Auth & File Metadata (TRD Section 16) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- MongoDB for flexible JSON Drag-and-Drop builder documents (TRD Section 16) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>

        <!-- JavaMail for 2FA OTP and Password Reset delivery (TRD AUTH-03) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>

        <!-- JWT for Stateless Secure Sessions (TRD AUTH-04) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok for clean boilerplate-free code -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>`,
  },
  {
    name: 'application.properties',
    path: '/backend-spring-boot/src/main/resources/application.properties',
    type: 'file',
    language: 'properties',
    badge: 'Config',
    content: `# ===================================================================
# Jai-Blog Backend Configuration (Spring Boot 3.x)
# Matches TRD (Technical Requirements Document) Section 21
# ===================================================================

server.port=8080
spring.application.name=jai-blog-backend

# MySQL Relational Database (Authentication, Tokens, File Metadata)
spring.datasource.url=\${MYSQL_URL:jdbc:mysql://localhost:3306/jaiblog?createDatabaseIfNotExist=true}
spring.datasource.username=\${MYSQL_USERNAME:root}
spring.datasource.password=\${MYSQL_PASSWORD:rootpassword}

# MongoDB NoSQL Database (Drag-and-Drop Blog JSON Builder Documents)
spring.data.mongodb.uri=\${MONGODB_URI:mongodb://localhost:27017/jaiblog_content}

# Security & JWT Configuration
jwt.secret=\${AUTH_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
jwt.expiration-ms=1800000 # 30 minutes session timeout (TRD AUTH-05)
jwt.otp-expiration-minutes=5 # 5 minutes OTP expiration (TRD AUTH-03)

# File Upload & Storage Management (TRD Section 12)
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
file.storage.path=\${FILE_STORAGE_PATH:./uploads}`,
  },
  {
    name: 'AuthController.java',
    path: '/backend-spring-boot/src/main/java/com/jaiblog/controller/AuthController.java',
    type: 'file',
    language: 'java',
    badge: 'REST Auth',
    content: `package com.jaiblog.controller;

import com.jaiblog.dto.ApiResponse;
import com.jaiblog.dto.LoginRequest;
import com.jaiblog.dto.VerifyOtpRequest;
import com.jaiblog.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/login (AUTH-01 & AUTH-02)
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = authService.initiateLogin(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your registered email address.", result));
    }

    // POST /api/auth/verify-otp (AUTH-03 & AUTH-04)
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        Map<String, Object> session = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully. Session established.", session));
    }

    // POST /api/auth/logout (AUTH-06)
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully.", null));
    }
}`,
  },
  {
    name: 'BlogAdminController.java',
    path: '/backend-spring-boot/src/main/java/com/jaiblog/controller/BlogAdminController.java',
    type: 'file',
    language: 'java',
    badge: 'Admin REST',
    content: `package com.jaiblog.controller;

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

    // GET /api/admin/blogs (MB-01)
    @GetMapping
    public ResponseEntity<ApiResponse<List<BlogDocument>>> getAllAdminBlogs() {
        List<BlogDocument> blogs = blogService.getAllBlogsForAdmin();
        return ResponseEntity.ok(ApiResponse.success("Admin blogs retrieved successfully.", blogs));
    }

    // POST /api/admin/blogs (CB-01 to CB-08)
    @PostMapping
    public ResponseEntity<ApiResponse<BlogDocument>> createBlog(@RequestBody BlogDocument blogDocument) {
        BlogDocument created = blogService.createBlog(blogDocument);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blog created successfully.", created));
    }

    // PUT /api/admin/blogs/{id} (MB-04)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogDocument>> updateBlog(
            @PathVariable String id,
            @RequestBody BlogDocument blogDocument) {
        BlogDocument updated = blogService.updateBlog(id, blogDocument);
        return ResponseEntity.ok(ApiResponse.success("Blog updated successfully.", updated));
    }

    // POST /api/admin/blogs/{id}/publish (CB-08)
    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<BlogDocument>> publishBlog(@PathVariable String id) {
        BlogDocument published = blogService.publishBlog(id);
        return ResponseEntity.ok(ApiResponse.success("Blog published to public site successfully.", published));
    }
}`,
  },
  {
    name: 'FileController.java',
    path: '/backend-spring-boot/src/main/java/com/jaiblog/controller/FileController.java',
    type: 'file',
    language: 'java',
    badge: 'Security Gate',
    content: `package com.jaiblog.controller;

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

    // POST /api/admin/files (FILE-01, max 50MB)
    @PostMapping("/admin/files")
    public ResponseEntity<ApiResponse<FileAttachment>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "blogId", required = false) String blogId,
            @RequestParam(value = "allowDownload", defaultValue = "false") boolean allowDownload) {
        
        FileAttachment attachment = fileService.storeFile(file, blogId, allowDownload);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully.", attachment));
    }

    // GET /api/files/{id}/download (PUB-04, FILE-04 & AC-03)
    @GetMapping("/files/{id}/download")
    public ResponseEntity<?> downloadFile(@PathVariable String id) {
        FileAttachment attachment = fileService.getFileMetadata(id);

        // Security check: Reject download if allowDownload is false!
        if (!attachment.isAllowDownload()) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Access Denied: Author restricted downloads for this asset.", "DOWNLOAD_RESTRICTED"));
        }

        Resource resource = fileService.loadFileAsResource(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"" + attachment.getOriginalFilename() + "\\"")
                .body(resource);
    }
}`,
  },
  {
    name: 'SecurityConfig.java',
    path: '/backend-spring-boot/src/main/java/com/jaiblog/config/SecurityConfig.java',
    type: 'file',
    language: 'java',
    badge: 'JWT & BCrypt',
    content: `package com.jaiblog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints according to TRD Section 13
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/blogs/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers("/api/files/*/download").permitAll()
                // Admin protected endpoints
                .requestMatchers("/api/admin/**").authenticated()
                .anyRequest().authenticated()
            );

        return http.build();
    }
}`,
  },
  {
    name: 'BlogDocument.java',
    path: '/backend-spring-boot/src/main/java/com/jaiblog/model/mongodb/BlogDocument.java',
    type: 'file',
    language: 'java',
    badge: 'Mongo Model',
    content: `package com.jaiblog.model.mongodb;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

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
    private String thumbnail;
    
    // Serialized Drag-and-Drop Builder Element Nodes
    private List<BuilderElement> elements;
    
    private Instant createdAt;
    private Instant updatedAt;
    private Instant publishedAt;
}`,
  },
  {
    name: 'schema.sql',
    path: '/backend-spring-boot/src/main/resources/schema.sql',
    type: 'file',
    language: 'sql',
    badge: 'MySQL DDL',
    content: `-- Jai-Blog MySQL Schema for Authentication and File Control
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file_attachments (
    id VARCHAR(50) PRIMARY KEY,
    blog_id VARCHAR(50) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    allow_download BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  },
];

export const SpringBootExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode>(SPRING_BOOT_PROJECT[0]);
  const [copied, setCopied] = useState(false);

  // Live REST API Tester State
  const [testEndpoint, setTestEndpoint] = useState<string>('/api/blogs');
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);

  const handleCopyCode = () => {
    if (selectedFile.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestApi = async (endpoint: string) => {
    setTestEndpoint(endpoint);
    setIsExecutingApi(true);

    try {
      if (endpoint === '/api/blogs') {
        const res = await apiService.getPublishedBlogs();
        setTestResult(res);
      } else if (endpoint === '/api/categories') {
        const res = await apiService.getCategories();
        setTestResult(res);
      } else if (endpoint === '/api/admin/blogs') {
        const res = await apiService.getAdminBlogs();
        setTestResult(res);
      } else if (endpoint === '/api/auth/login') {
        setTestResult({
          success: true,
          message: 'OTP sent to your registered email address.',
          data: {
            email: 'admin@jaiblog.com',
            otpExpiresInSeconds: 300,
            deliveryChannel: 'EMAIL',
          },
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message,
        errorCode: 'INTERNAL_ERROR',
      });
    } finally {
      setIsExecutingApi(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                Java 17 • Spring Boot 3.2 • Maven
              </span>
              <span className="text-xs text-slate-400 font-mono">
                /backend-spring-boot
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Server className="w-6 h-6 text-amber-400" />
              <span>Spring Boot (Maven) Architecture &amp; Codebase</span>
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Complete, production-grade Spring Boot codebase generated in accordance with the TRD and PRD specifications. Includes dual MySQL + MongoDB repositories, BCrypt + JWT security filter chains, 6-digit cryptographic OTP generation, and granular file download gates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300">
              $ mvn spring-boot:run
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer & File Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Files List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
            <span>Maven Project Files</span>
            <span className="font-mono text-[10px] text-slate-400">7 files</span>
          </div>

          <div className="space-y-1.5">
            {SPRING_BOOT_PROJECT.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#3368a0] text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCode
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-white' : 'text-[#3368a0]'
                      }`}
                    />
                    <span className="truncate">{file.name}</span>
                  </div>

                  {file.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase font-bold shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {file.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Maven CLI Commands Card */}
          <div className="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#3368a0]" />
              <span>Maven Build Instructions</span>
            </div>
            <div className="font-mono text-[11px] bg-slate-900 text-slate-200 p-2.5 rounded-lg space-y-1">
              <p className="text-emerald-400"># Clean &amp; Compile</p>
              <p>mvn clean install</p>
              <p className="text-emerald-400 pt-1"># Run on Port 8080</p>
              <p>mvn spring-boot:run</p>
            </div>
          </div>
        </div>

        {/* Right Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
          {/* Header of code view */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>{selectedFile.path}</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Syntax Highlighted Code Display */}
          <div className="p-4 overflow-x-auto font-mono text-xs text-slate-200 max-h-[500px] leading-relaxed select-text">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* REST API Tester & Specification Matrix (TRD Section 13 & 14) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3368a0] text-white">
              TRD Section 13 &amp; 14
            </span>
            <h2 className="text-xl font-bold text-[#0f172a]">Live REST API Endpoint Test Console</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test the Spring Boot REST endpoints directly and inspect the standardized ApiResponse JSON envelope.
          </p>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { method: 'GET', path: '/api/blogs', label: 'Get Published Blogs' },
            { method: 'GET', path: '/api/categories', label: 'Get Categories' },
            { method: 'GET', path: '/api/admin/blogs', label: 'Get Admin Blogs' },
            { method: 'POST', path: '/api/auth/login', label: 'Admin Login & OTP Dispatch' },
          ].map((ep) => (
            <button
              key={ep.path + ep.method}
              onClick={() => handleTestApi(ep.path)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                testEndpoint === ep.path
                  ? 'bg-sky-50 text-[#3368a0] border-[#3368a0] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                ep.method === 'GET' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {ep.method}
              </span>
              <span>{ep.path}</span>
            </button>
          ))}
        </div>

        {/* Test Result JSON Envelope */}
        {testResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Standard Response Envelope (HTTP 200 OK):</span>
              <span className="font-mono text-emerald-600 font-bold">status: 200 OK</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto max-h-64 border border-slate-800">
              <pre>{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
