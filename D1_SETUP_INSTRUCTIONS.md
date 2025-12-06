# D1 Setup Instructions

## Quick Start

### 1. Initialize D1 Database

```bash
# Execute the schema in your D1 database
wrangler d1 execute luxe-hotel --file=./d1-schema.sql
```

### 2. Verify Tables Created

```bash
# Check tables exist
wrangler d1 execute luxe-hotel --command "SELECT name FROM sqlite_master WHERE type='table'"
```

Expected output should show these 8 tables:
- auth_users
- bookings
- contact_messages
- guests
- pet_care_requests
- reviews
- rooms
- sessions

### 3. Check Initial Data

```bash
# Should show 9 rooms pre-populated
wrangler d1 execute luxe-hotel --command "SELECT COUNT(*) as total_rooms FROM rooms"

# Should show 0 (no test data yet)
wrangler d1 execute luxe-hotel --command "SELECT COUNT(*) as total_guests FROM guests"
```

## Environment Setup

### Create .env File

```bash
cp .env.example .env
```

Edit `.env` and set:
```env
# Generate a strong random string (min 32 characters) for production
JWT_SECRET=dev-secret-key-min-32-chars-for-production-use-random-string

# Development
VITE_API_URL=http://localhost:8788
VITE_ENVIRONMENT=development

# Production (comment out for dev)
# VITE_API_URL=https://your-domain.com
# VITE_ENVIRONMENT=production
```

## Development Testing

### Start Local Development Server

```bash
# Install dependencies if not done
npm install

# Start development server (includes D1 binding)
wrangler dev
```

The app will be available at `http://localhost:8788`

### Test Authentication

```bash
# 1. Test signup
curl -X POST http://localhost:8788/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "phone": "1234567890",
    "address": "123 Main St"
  }'

# Expected response:
# {
#   "token": "eyJhbGc...",
#   "user": {
#     "id": "uuid...",
#     "email": "test@example.com",
#     "first_name": "Test",
#     "last_name": "User",
#     "is_admin": false
#   },
#   "expiresAt": 1702123456789
# }

# 2. Test signin
curl -X POST http://localhost:8788/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. Test protected endpoint with token
curl -X POST http://localhost:8788/api/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-from-signin>" \
  -d '{
    "first_name": "Updated",
    "last_name": "Name"
  }'
```

### Query D1 During Development

```bash
# Interactive D1 shell
wrangler d1 execute luxe-hotel --local --interactive

# Example queries:
SELECT * FROM rooms;
SELECT * FROM auth_users;
SELECT COUNT(*) FROM bookings;
```

## Production Deployment

### 1. Build Application

```bash
npm run build:prod
```

### 2. Set Production Secrets

```bash
# Generate strong JWT secret
# Use: $(openssl rand -base64 32)
# Or: $(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

JWT_SECRET="your-generated-strong-secret-here"
```

### 3. Deploy to Cloudflare

```bash
# Deploy Pages and Functions
wrangler deploy

# Or use Cloudflare Pages UI for continuous deployment
```

### 4. Verify Production D1

```bash
# Verify tables in production
wrangler d1 execute luxe-hotel --remote --command "SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'"
```

## Data Migration from Supabase

### If You Have Existing Data

```bash
# 1. Export from Supabase (via web interface or API)
# - Export each table as CSV
# - Keep CSV files for import

# 2. Transform data for SQLite compatibility:
# - Convert UUID columns to TEXT strings
# - Convert TEXT[] arrays to JSON strings
# - Ensure timestamps are ISO 8601

# 3. Create import script (import.sql or script)
# Example for guests table:

INSERT INTO guests (id, first_name, last_name, email, phone, address, city, country, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'John', 'Doe', 'john@example.com', '1234567890', '123 Main St', 'New York', 'USA', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Jane', 'Smith', 'jane@example.com', '0987654321', '456 Oak Ave', 'Los Angeles', 'USA', '2024-01-02T00:00:00Z', '2024-01-02T00:00:00Z');

# 4. Execute import
wrangler d1 execute luxe-hotel --file=./import.sql

# 5. Verify counts match
wrangler d1 execute luxe-hotel --command "SELECT COUNT(*) FROM guests WHERE id NOT IN (SELECT id FROM guests WHERE email LIKE '%@example.com')"
```

## Troubleshooting

### D1 Connection Issues

**Problem**: "D1 binding not found"
```
Solution:
1. Check wrangler.toml has [[d1_databases]] binding
2. Verify database_id is correct: 8322ba8b-4563-449a-8929-5b090ee6215f
3. Restart dev server: wrangler dev
```

**Problem**: "Tables don't exist"
```
Solution:
1. Run schema creation: wrangler d1 execute luxe-hotel --file=./d1-schema.sql
2. Verify with: wrangler d1 execute luxe-hotel --command "SELECT name FROM sqlite_master"
```

**Problem**: "Auth endpoints return 500"
```
Solution:
1. Check D1 binding in handlers.ts: env.DB
2. Verify error in server logs
3. Ensure JWT_SECRET is set in environment
4. Check token format in Authorization header: "Bearer <token>"
```

### Authentication Issues

**Problem**: "Invalid token" on protected routes
```
Solution:
1. Verify JWT_SECRET matches in handlers.ts and client
2. Check token hasn't expired (7 days)
3. Verify token format in localStorage
4. Check Authorization header format
```

**Problem**: "User already registered"
```
Solution:
1. Check if user exists: SELECT * FROM auth_users WHERE email = 'test@example.com'
2. Delete if needed: DELETE FROM auth_users WHERE email = 'test@example.com'
3. Retry signup
```

## Performance Optimization

### Enable Query Logging

```bash
# Set in wrangler.toml or environment
DEBUG=d1:*
```

### Monitor Query Performance

```sql
-- Check slow queries
EXPLAIN QUERY PLAN
SELECT * FROM booking_details WHERE email = 'test@example.com';

-- Add indexes if needed
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(...);
```

## Backup and Recovery

### Export Data

```bash
# Export entire D1 database
wrangler d1 execute luxe-hotel --command ".dump" > backup.sql

# Backup specific table
wrangler d1 execute luxe-hotel --command "SELECT * FROM rooms;" > rooms_backup.csv
```

### Restore Data

```bash
# Restore from backup
wrangler d1 execute luxe-hotel --file=backup.sql

# Or import specific table
wrangler d1 execute luxe-hotel --file=rooms_restore.sql
```

## Maintenance Tasks

### Regular Checks

```bash
# Monthly: Verify data integrity
wrangler d1 execute luxe-hotel --command "PRAGMA integrity_check"

# Monthly: Vacuum database (optimize)
wrangler d1 execute luxe-hotel --command "VACUUM"

# Weekly: Check for orphaned records
wrangler d1 execute luxe-hotel --command "
  SELECT COUNT(*) as orphaned_bookings 
  FROM bookings 
  WHERE guest_id NOT IN (SELECT id FROM guests)
"
```

## Getting Help

- Check CloudFlare D1 documentation: https://developers.cloudflare.com/d1/
- Review schema: See `d1-schema.sql`
- Check migrations: See `D1_MIGRATION_GUIDE.md`
- Deployment issues: See Cloudflare Pages docs
