-- ===================================================================
-- Jai-Blog MySQL Schema
-- ===================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    slug VARCHAR(100) NOT NULL UNIQUE
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
);

-- Seed predefined categories (CAT-01)
INSERT IGNORE INTO categories (id, name, description, slug) VALUES 
('tech', 'Technology', 'Modern software architecture, cloud platforms, and engineering best practices', 'tech'),
('lifestyle', 'Lifestyle', 'Work-life balance, creative productivity, and mindful living', 'lifestyle'),
('health', 'Health & Wellness', 'Physical health, ergonomics, nutrition, and mental fitness', 'health'),
('business', 'Business & Growth', 'Product management, venture scaling, and modern leadership', 'business'),
('design', 'Design & UX', 'Design systems, typography hierarchy, and visual craftsmanship', 'design');

-- Default administrator seed (Password: Admin@123 hashed via BCrypt)
INSERT IGNORE INTO admin_users (id, name, email, password_hash) VALUES
(1, 'Jai Administrator', 'admin@jaiblog.com', '$2a$12$e8p2UjLhL5uI.o6gY.bT3O7g7Zk0u7tS19uL2pYk0N5C7x1k2w4re');
