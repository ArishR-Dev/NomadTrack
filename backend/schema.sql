-- ============================================
-- NomadTrack MySQL Database Schema
-- Run this SQL in your MySQL server
-- ============================================

CREATE DATABASE IF NOT EXISTS nomadtrack;
USE nomadtrack;
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_token (token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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

-- Import batches table (for CSV imports)
CREATE TABLE city_import_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  imported_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deleted cities archive (for admin restore)
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
-- Seed Data - 16 cities
-- ============================================
INSERT IGNORE INTO cities (city, country, continent, cost_index, internet_speed, safety_score, climate, nomad_score, rent, food_cost, transport_cost, coworking_cost, temperature_avg, latitude, longitude, image)
VALUES
('Lisbon', 'Portugal', 'Europe', 42, 85, 82, 'Mediterranean', 88, 900, 250, 40, 150, 18, 38.7223, -9.1393, 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&q=80'),
('Bangkok', 'Thailand', 'Asia', 28, 72, 65, 'Tropical', 85, 450, 150, 30, 80, 30, 13.7563, 100.5018, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80'),
('Bali', 'Indonesia', 'Asia', 25, 45, 70, 'Tropical', 82, 400, 120, 25, 100, 28, -8.4095, 115.1889, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80'),
('Berlin', 'Germany', 'Europe', 55, 92, 85, 'Continental', 84, 1100, 300, 80, 200, 10, 52.52, 13.405, 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80'),
('Mexico City', 'Mexico', 'North America', 30, 55, 50, 'Subtropical', 80, 500, 180, 20, 90, 17, 19.4326, -99.1332, 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=600&q=80'),
('Tbilisi', 'Georgia', 'Europe', 22, 60, 78, 'Continental', 79, 350, 130, 15, 60, 13, 41.7151, 44.8271, 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600&q=80'),
('Medellín', 'Colombia', 'South America', 26, 50, 55, 'Subtropical', 81, 420, 140, 20, 75, 22, 6.2442, -75.5812, 'https://images.unsplash.com/photo-1599839619722-83ec7a0b1a45?w=600&q=80'),
('Chiang Mai', 'Thailand', 'Asia', 20, 65, 80, 'Tropical', 86, 300, 100, 15, 50, 26, 18.7883, 98.9853, 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=600&q=80'),
('Barcelona', 'Spain', 'Europe', 52, 88, 75, 'Mediterranean', 87, 1050, 280, 50, 180, 17, 41.3874, 2.1686, 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80'),
('Ho Chi Minh City', 'Vietnam', 'Asia', 22, 58, 72, 'Tropical', 78, 350, 100, 10, 55, 28, 10.8231, 106.6297, 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80'),
('Buenos Aires', 'Argentina', 'South America', 24, 48, 58, 'Subtropical', 76, 380, 150, 15, 70, 18, -34.6037, -58.3816, 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=80'),
('Prague', 'Czech Republic', 'Europe', 40, 80, 88, 'Continental', 83, 750, 220, 30, 130, 9, 50.0755, 14.4378, 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80'),
('Dubai', 'UAE', 'Asia', 70, 95, 92, 'Arid', 75, 1800, 400, 100, 300, 28, 25.2048, 55.2708, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80'),
('Cape Town', 'South Africa', 'Africa', 32, 42, 45, 'Mediterranean', 74, 550, 180, 30, 90, 17, -33.9249, 18.4241, 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80'),
('Tallinn', 'Estonia', 'Europe', 38, 90, 90, 'Continental', 82, 700, 200, 35, 120, 6, 59.437, 24.7536, 'https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=600&q=80'),
('Playa del Carmen', 'Mexico', 'North America', 35, 40, 55, 'Tropical', 77, 600, 200, 20, 100, 27, 20.6296, -87.0739, 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=600&q=80');
