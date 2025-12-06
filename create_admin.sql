-- ============================================
-- CREATE ADMIN ACCOUNT - LUXE HOTEL
-- ============================================
-- Date: December 6, 2025
-- Purpose: Create admin user account for hotel management system

-- Admin Credentials (Save these securely!)
-- ============================================
-- Email: admin@swiftroomhaven.com
-- Password: Admin123!Secure
-- Name: Admin User
-- Role: Administrator
-- Status: Active

-- STEP 1: Create admin user in auth_users table
INSERT OR IGNORE INTO auth_users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    is_admin,
    is_active
) VALUES (
    'uuid-admin-' || datetime('now'),
    'admin@swiftroomhaven.com',
    'Admin123!Secure',
    'Admin',
    'User',
    1,
    1
);

-- STEP 2: Create corresponding guest profile
INSERT OR IGNORE INTO guests (
    id,
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    country
) SELECT
    au.id,
    'Admin',
    'User',
    'admin@swiftroomhaven.com',
    '+1 (555) 987-6543',
    'Swift Room Haven HQ',
    'Dhaka',
    'Bangladesh'
FROM auth_users au
WHERE au.email = 'admin@swiftroomhaven.com'
AND NOT EXISTS (
    SELECT 1 FROM guests g WHERE g.email = 'admin@swiftroomhaven.com'
);

-- VERIFICATION: Display the created admin account
SELECT 
    'ADMIN ACCOUNT CREATED' as status,
    au.email,
    au.first_name || ' ' || au.last_name as full_name,
    CASE WHEN au.is_admin = 1 THEN 'YES' ELSE 'NO' END as is_admin,
    CASE WHEN au.is_active = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END as status,
    au.created_at
FROM auth_users au
WHERE au.email = 'admin@swiftroomhaven.com';
