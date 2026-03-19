-- Archive table for deleted cities (idempotent)
-- Run: mysql -u root -p nomadtrack < migrations/004_add_deleted_cities_archive.sql

SET @tbl_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'deleted_cities'
);

SET @sql_tbl = IF(
  @tbl_exists = 0,
  'CREATE TABLE deleted_cities (
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
   )',
  'SELECT 1'
);

PREPARE stmt_tbl FROM @sql_tbl;
EXECUTE stmt_tbl;
DEALLOCATE PREPARE stmt_tbl;

