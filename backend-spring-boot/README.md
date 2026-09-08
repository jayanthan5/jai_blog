# Jai-Blog — Spring Boot (Maven) Backend

This is the production-ready Java Spring Boot backend for **Jai-Blog**, fully implemented in accordance with the **Product Requirements Document (PRD)** and **Technical Requirements Document (TRD)**.

---

## 🏛️ Architecture Overview

- **Framework**: Java 17 + Spring Boot 3.2.4 (Maven build tool)
- **Relational Storage (MySQL / JPA)**:
  - Administrator credentials & BCrypt password hashes
  - 5-Minute single-use OTP codes (`otp_verifications`)
  - Password reset tokens (`password_reset_tokens`)
  - Predefined categories (`categories`)
  - Granular file attachment metadata & `allow_download` permissions (`file_attachments`)
- **Document Storage (MongoDB)**:
  - Drag-and-Drop Blog JSON Builder structures (`BlogDocument` with serialized `BuilderElement` nodes)
- **Security**:
  - Spring Security stateless filter chain
  - Cryptographic 6-digit OTP generation (SecureRandom)
  - Time-limited JWT session tokens (30 minutes expiry)
  - Download endpoint security boundary (rejects unauthorized downloads with HTTP 403)

---

## 🚀 How to Build & Run with Maven

### Prerequisites
- JDK 17 or higher
- Apache Maven 3.8+
- MySQL Server & MongoDB running (or use defaults/docker)

### Step 1: Install & Build
```bash
mvn clean install
```

### Step 2: Run Application
```bash
mvn spring-boot:run
```

Or run the compiled JAR:
```bash
java -jar target/jai-blog-backend-1.0.0-SNAPSHOT.jar
```

The Spring Boot server will bind to `http://localhost:8080`.

---

## 📋 REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | Step 1: Validate email + password, generate & email 6-digit OTP | No |
| `POST` | `/api/auth/verify-otp` | Step 2: Validate 6-digit OTP code, issue JWT | No |
| `POST` | `/api/auth/logout` | Invalidate session | Optional |
| `POST` | `/api/auth/forgot-password` | Send 1-hour reset link | No |
| `POST` | `/api/auth/reset-password` | Set new password with token | No |
| `GET`  | `/api/blogs` | Get published blogs (supports `?category=` & `?search=`) | No |
| `GET`  | `/api/blogs/{id}` | Get published blog layout details | No |
| `GET`  | `/api/categories` | List categories | No |
| `GET`  | `/api/categories/{id}/blogs` | Filter blogs by category | No |
| `GET`  | `/api/admin/blogs` | List all blogs (drafts + published) | Yes (Bearer Token) |
| `POST` | `/api/admin/blogs` | Create new blog with builder JSON | Yes (Bearer Token) |
| `PUT`  | `/api/admin/blogs/{id}` | Update blog metadata or layout | Yes (Bearer Token) |
| `DELETE`| `/api/admin/blogs/{id}` | Delete blog | Yes (Bearer Token) |
| `POST` | `/api/admin/blogs/{id}/publish` | Transition status to PUBLISHED | Yes (Bearer Token) |
| `POST` | `/api/admin/blogs/{id}/draft` | Transition status to DRAFT | Yes (Bearer Token) |
| `POST` | `/api/admin/files` | Upload attachment (up to 50MB) | Yes (Bearer Token) |
| `GET`  | `/api/files/{id}/download` | Download permitted attachment (enforces `allow_download = true`) | No |
