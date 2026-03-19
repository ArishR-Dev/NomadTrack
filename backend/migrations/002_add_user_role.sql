-- Add role column to users (idempotent: safe to run multiple times)
-- Run: mysql -u root -p nomadtrack < migrations/002_add_user_role.sql

SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
);
SET @sql = IF(@col_exists = 0,
  "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill role from legacy is_admin if present
UPDATE users
SET role = CASE
  WHEN COALESCE(is_admin, 0) = 1 THEN 'admin'
  ELSE 'user'
END
WHERE role IS NULL OR role = '' OR role NOT IN ('user', 'admin');
