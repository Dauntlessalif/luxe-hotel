-- Create Admin Account for Luxe Hotel
-- Generated: December 6, 2025

-- Admin Account Credentials
-- Email: admin@swiftroomhaven.com
-- Password: Admin123!Secure
-- First Name: Admin
-- Last Name: User

-- 1. Insert admin user into auth_users table
INSERT INTO auth_users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    is_admin,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin-user-' || lower(hex(randomblob(8))),
    'admin@swiftroomhaven.com',
    'Admin123!Secure',  -- In production, this should be hashed
    'Admin',
    'User',
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 2. Insert admin guest profile (linked to auth_users)
-- Note: Get the ID from the previous insert
INSERT INTO guests (
    id,
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    country,
    created_at,
    updated_at
) SELECT
    id,
    first_name,
    last_name,
    email,
    '+1 (555) 987-6543',
    'Swift Room Haven HQ',
    'Dhaka',
    'Bangladesh',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM auth_users
WHERE email = 'admin@swiftroomhaven.com'
AND id NOT IN (SELECT DISTINCT id FROM guests WHERE email = 'admin@swiftroomhaven.com');

-- Verify the admin account was created
SELECT 
    au.id,
    au.email,
    au.first_name,
    au.last_name,
    au.is_admin,
    au.is_active,
    au.created_at
FROM auth_users au
WHERE au.email = 'admin@swiftroomhaven.com'
LIMIT 1;
