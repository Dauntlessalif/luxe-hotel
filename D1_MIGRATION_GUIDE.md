# Supabase to Cloudflare D1 Migration Guide

## ✅ Completed Tasks

### 1. Database Configuration
- ✅ Created D1-compatible SQLite schema (`d1-schema.sql`)
- ✅ Configured D1 binding in `wrangler.toml` (UUID: 8322ba8b-4563-449a-8929-5b090ee6215f)
- ✅ Added UUID, JSON array support, and triggers for SQLite compatibility

### 2. Database Abstraction Layer
- ✅ Created `src/lib/d1.ts` - Type-safe D1 query wrapper with full CRUD operations
- ✅ Implemented all database functions matching Supabase API:
  - Rooms API (getAllRooms, getRoomById, checkAvailability, etc.)
  - Guests API (create, update, upsert)
  - Bookings API (full lifecycle management)
  - Contact Messages API
  - Pet Care Requests API
  - Reviews API
  - Dashboard statistics

### 3. Authentication System
- ✅ Replaced Supabase Auth with JWT-based authentication
- ✅ Updated `src/contexts/AuthContext.tsx`:
  - LocalStorage-based session management
  - JWT token handling
  - Token expiration checking
  - Compatible API interface (same functions, new backend)

### 4. API Integration Layer
- ✅ Refactored `src/lib/api.ts` to use D1 wrapper instead of Supabase
- ✅ Maintained backward-compatible API structure
- ✅ All CRUD operations now route through D1

### 5. Authentication Endpoints
- ✅ Created Cloudflare Pages Functions for authentication:
  - `functions/api/auth/signup.ts` - Register new users
  - `functions/api/auth/signin.ts` - User login
  - `functions/api/auth/admin-signin.ts` - Admin authentication
  - `functions/api/auth/signout.ts` - Logout
  - `functions/api/auth/reset-password.ts` - Password reset request
  - `functions/api/auth/update-profile.ts` - Profile updates

### 6. Package Updates
- ✅ Replaced `@supabase/supabase-js` with `jsonwebtoken` and `uuid`
- ✅ Updated `package.json` with new dependencies

---

## 🔄 Next Steps: Component Migration

The following components still need to be updated to remove Supabase imports and use the new D1 API:

### Admin Components (7 files)
1. `src/components/admin/BookingsManagement.tsx`
2. `src/components/admin/ContactMessagesManagement.tsx`
3. `src/components/admin/DashboardOverview.tsx`
4. `src/components/admin/GuestsManagement.tsx`
5. `src/components/admin/PetCareManagement.tsx`
6. `src/components/admin/ReviewsManagement.tsx`
7. `src/components/admin/RoomsManagement.tsx`

### Customer Components (2 files)
1. `src/components/customer/MyReviews.tsx`
2. `src/pages/CustomerDashboard.tsx` (if it uses supabase)

### Other Pages
1. `src/pages/Booking.tsx` (if it uses supabase)
2. `src/pages/PetCare.tsx` (if it uses supabase)

---

## 📋 Steps to Complete Component Migration

For each component file, follow these steps:

### 1. Remove Supabase Import
**OLD:**
```typescript
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
```

**NEW:**
```typescript
import { useAuth } from '@/contexts/AuthContext';
// Use the appropriate API from src/lib/api.ts
import { roomsApi, bookingsApi, etc } from '@/lib/api';
```

### 2. Replace useEffect Auth Checks
**OLD:**
```typescript
const [user, setUser] = useState<User | null>(null);
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });
}, []);
```

**NEW:**
```typescript
const { user } = useAuth();
// User is automatically available from context
```

### 3. Replace Database Calls
**OLD:**
```typescript
const { data, error } = await supabase
  .from('rooms')
  .select('*');
```

**NEW:**
```typescript
const rooms = await roomsApi.getAllRooms();
```

---

## 🗄️ Database Schema Mapping

### Tables (Compatible with existing data)
- `rooms` - Room inventory
- `guests` - Guest profiles  
- `bookings` - Reservations
- `reviews` - Guest reviews
- `contact_messages` - Contact form submissions
- `pet_care_requests` - Pet care service requests
- `auth_users` - User authentication (NEW)
- `sessions` - JWT session management (NEW)

### Key Differences from Supabase
1. **UUIDs**: Stored as TEXT instead of UUID type
2. **Arrays**: JSON arrays stored as TEXT (amenities field)
3. **Timestamps**: ISO 8601 format in TEXT fields
4. **Authentication**: No built-in auth; using custom JWT system

---

## 🚀 Deployment Checklist

Before deploying to production:

### 1. Initialize D1 Database
```bash
# Create tables in D1
wrangler d1 execute luxe-hotel --file=./d1-schema.sql
```

### 2. Set JWT Secret in Production
- Change `JWT_SECRET` in `functions/api/auth/handlers.ts`
- Use strong random secret (min 32 characters)
- Store securely in Cloudflare environment

### 3. Data Migration (If migrating from existing Supabase)
- Export Supabase data to CSV
- Convert UUIDs and arrays as needed
- Import into D1 using `wrangler d1`

### 4. Test All Authentication Flows
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Admin login
- [ ] Profile update
- [ ] Logout
- [ ] Token expiration

### 5. Test All CRUD Operations
- [ ] Create/read/update bookings
- [ ] Manage rooms
- [ ] View guest profiles
- [ ] Contact form submissions
- [ ] Pet care requests
- [ ] Reviews

### 6. Environment Configuration
```bash
# Create .env file from template
cp .env.example .env

# Update with your values
VITE_API_URL=https://your-domain.com
JWT_SECRET=your-production-secret
```

### 7. Deploy to Cloudflare
```bash
# Build and deploy
npm run build
wrangler deploy
```

---

## 📝 API Endpoints

All endpoints are under `/api/auth/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | User login |
| POST | `/api/auth/admin-signin` | Admin login |
| POST | `/api/auth/signout` | Logout (client-side) |
| POST | `/api/auth/reset-password` | Request password reset |
| POST | `/api/auth/update-profile` | Update user profile |

### Authentication Header
All protected endpoints require:
```
Authorization: Bearer <jwt-token>
```

---

## 🔐 Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **Password Hashing**: Implement bcrypt in `functions/api/auth/handlers.ts`
3. **Rate Limiting**: Add rate limiting to auth endpoints
4. **HTTPS Only**: Ensure all endpoints use HTTPS in production
5. **CORS**: Configure CORS headers if frontend is on different domain

---

## 🐛 Troubleshooting

### D1 Connection Issues
- Verify D1 binding in `wrangler.toml`
- Check D1 database ID is correct
- Ensure Cloudflare Pages is connected to D1

### Authentication Fails
- Check JWT secret matches between frontend and backend
- Verify token format in localStorage
- Check browser console for errors

### Database Queries Return Empty
- Verify `d1.ts` D1 instance is properly initialized
- Check SQL syntax for D1/SQLite compatibility
- Ensure indexes are created

---

## 📚 Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
