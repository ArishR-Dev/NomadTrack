-- ============================================
-- NomadTrack MySQL Database Schema (NO SEED)
-- Run this SQL in your MySQL server
-- ============================================

CREATE DATABASE IF NOT EXISTS nomadtrack;
USE nomadtrack;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  location VARCHAR(255) NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_token (token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cities table
CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  continent VARCHAR(50) NOT NULL,
  cost_index INT NOT NULL,
  internet_speed INT NOT NULL,
  safety_score FLOAT NOT NULL,
  climate VARCHAR(50) NOT NULL,
  nomad_score INT NOT NULL,
  rent INT NOT NULL,
  food_cost INT NOT NULL,
  transport_cost INT NOT NULL,
  coworking_cost INT NOT NULL,
  temperature_avg INT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  image VARCHAR(255) NULL,
  import_batch_id INT NULL
);

-- Import batches table (for CSV/JSON imports)
CREATE TABLE city_import_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  imported_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deleted cities archive (for restore)
CREATE TABLE deleted_cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_city_id INT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  continent VARCHAR(50) NOT NULL,
  cost_index INT NOT NULL,
  internet_speed INT NOT NULL,
  safety_score FLOAT NOT NULL,
  climate VARCHAR(50) NOT NULL,
  nomad_score INT NOT NULL,
  rent INT NOT NULL,
  food_cost INT NOT NULL,
  transport_cost INT NOT NULL,
  coworking_cost INT NOT NULL,
  temperature_avg INT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  image VARCHAR(255) NULL,
  import_batch_id INT NULL,
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by INT NULL
);

-- Favorites table
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  city_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, city_id)
);

-- ============================================
-- NomadTrack MySQL Database Schema (NO SEED)
-- Run this SQL in your MySQL server
-- ============================================

CREATE DATABASE IF NOT EXISTS nomadtrack;
USE nomadtrack;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  location VARCHAR(255) NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_token (token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cities table
CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  continent VARCHAR(50) NOT NULL,
  cost_index INT NOT NULL,
  internet_speed INT NOT NULL,
  safety_score FLOAT NOT NULL,
  climate VARCHAR(50) NOT NULL,
  nomad_score INT NOT NULL,
  rent INT NOT NULL,
  food_cost INT NOT NULL,
  transport_cost INT NOT NULL,
  coworking_cost INT NOT NULL,
  temperature_avg INT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  image VARCHAR(255) NULL,
  import_batch_id INT NULL
);

-- Import batches table (for CSV/JSON imports)
CREATE TABLE city_import_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  imported_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deleted cities archive (for restore)
CREATE TABLE deleted_cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_city_id INT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  continent VARCHAR(50) NOT NULL,
  cost_index INT NOT NULL,
  internet_speed INT NOT NULL,
  safety_score FLOAT NOT NULL,
  climate VARCHAR(50) NOT NULL,
  nomad_score INT NOT NULL,
  rent INT NOT NULL,
  food_cost INT NOT NULL,
  transport_cost INT NOT NULL,
  coworking_cost INT NOT NULL,
  temperature_avg INT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  image VARCHAR(255) NULL,
  import_batch_id INT NULL,
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by INT NULL
);

-- Favorites table
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  city_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, city_id)
);

