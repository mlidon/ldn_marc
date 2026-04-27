CREATE DATABASE IF NOT EXISTS content_dashboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE content_dashboard;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS content_tags;
DROP TABLE IF EXISTS content_files;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS contents;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content_type ENUM('post', 'project') NOT NULL,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  short_description VARCHAR(320) NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL,
  content_html LONGTEXT NULL,
  status ENUM('draft', 'published', 'scheduled') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  scheduled_at DATETIME NULL,
  created_by INT UNSIGNED NOT NULL,
  updated_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_contents_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_contents_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_contents_type (content_type),
  INDEX idx_contents_status (status),
  INDEX idx_contents_created_at (created_at),
  INDEX idx_contents_updated_at (updated_at),
  INDEX idx_contents_published_at (published_at),
  INDEX idx_contents_scheduled_at (scheduled_at),
  INDEX idx_contents_title (title),
  INDEX idx_contents_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tags (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE content_tags (
  content_id INT UNSIGNED NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (content_id, tag_id),

  CONSTRAINT fk_content_tags_content
    FOREIGN KEY (content_id) REFERENCES contents(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_content_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  INDEX idx_content_tags_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE content_files (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content_id INT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(120) NULL,
  file_size INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_content_files_content
    FOREIGN KEY (content_id) REFERENCES contents(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  INDEX idx_content_files_content_id (content_id),
  INDEX idx_content_files_file_name (file_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (name, email, password_hash, role, is_active)
VALUES (
  'Admin',
  'admin@local.test',
  '$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrstuv',
  'admin',
  1
);

INSERT INTO tags (name, slug) VALUES
  ('Angular', 'angular'),
  ('Node.js', 'nodejs'),
  ('Express', 'express'),
  ('MySQL', 'mysql'),
  ('Investigación', 'investigacion'),
  ('Frontend', 'frontend'),
  ('Backend', 'backend'),
  ('API', 'api'),
  ('Dashboard', 'dashboard'),
  ('Proyecto personal', 'proyecto-personal');

INSERT INTO contents (
  content_type,
  title,
  slug,
  short_description,
  cover_image_url,
  content_html,
  status,
  published_at,
  scheduled_at,
  created_by,
  updated_by
) VALUES
(
  'post',
  'Mi primer post',
  'mi-primer-post',
  'Esto es una breve descripción de ejemplo para un post.',
  '/uploads/covers/post-demo.jpg',
  '<h2>Contenido de ejemplo</h2><p>Este es un contenido de prueba generado para validar la estructura.</p>',
  'draft',
  NULL,
  NULL,
  1,
  1
),
(
  'project',
  'Mi primer proyecto',
  'mi-primer-proyecto',
  'Esto es una breve descripción de ejemplo para un proyecto.',
  '/uploads/covers/project-demo.jpg',
  '<h2>Proyecto de ejemplo</h2><p>Este es un proyecto de prueba para validar la estructura.</p>',
  'published',
  NOW(),
  NULL,
  1,
  1
);

INSERT INTO content_tags (content_id, tag_id) VALUES
  (1, 1),
  (1, 9),
  (2, 1),
  (2, 2),
  (2, 4);

INSERT INTO content_files (content_id, file_name, file_path, file_type, file_size) VALUES
  (2, 'documentacion-proyecto.pdf', '/uploads/files/documentacion-proyecto.pdf', 'application/pdf', 245760);

SELECT 'Base de datos content_dashboard creada correctamente' AS message;