-- Track CSV import batches and link cities to batches (idempotent)
-- Run: mysql -u root -p nomadtrack < migrations/003_add_city_import_batches.sql

-- 1) Create city_import_batches table if it does not exist
SET @tbl_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'city_import_batches'
);

SET @sql_tbl = IF(
  @tbl_exists = 0,
  'CREATE TABLE city_import_batches (
     id INT AUTO_INCREMENT PRIMARY KEY,
     filename VARCHAR(255) NOT NULL,
     imported_by INT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_imported_by (imported_by)
   )',
  'SELECT 1'
);

PREPARE stmt_tbl FROM @sql_tbl;
EXECUTE stmt_tbl;
DEALLOCATE PREPARE stmt_tbl;

-- 2) Add import_batch_id column to cities if it does not exist
SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cities'
    AND COLUMN_NAME = 'import_batch_id'
);

SET @sql_col = IF(
  @col_exists = 0,
  'ALTER TABLE cities ADD COLUMN import_batch_id INT NULL',
  'SELECT 1'
);

PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

