# Component Migration Quick Reference

## Summary of Changes

This guide helps quickly migrate individual component files from Supabase to D1.

---

## Pattern 1: Removing Supabase Imports

### BEFORE (Supabase)
```typescript
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface ComponentProps {}

export const MyComponent: React.FC<ComponentProps> = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  return <div>{user?.email}</div>;
};
```

### AFTER (D1 + JWT)
```typescript
import { useAuth } from '@/contexts/AuthContext';

interface ComponentProps {}

export const MyComponent: React.FC<ComponentProps> = () => {
  const { user, loading } = useAuth();

  return <div>{user?.email}</div>;
};
```

**Key Changes:**
- Remove `supabase` and `User/Session` imports
- Add `useAuth` hook from context
- Replace manual auth state with context values
- Loading state is automatically managed

---

## Pattern 2: Database Query Calls

### BEFORE (Supabase with table queries)
```typescript
import { supabase } from '@/lib/supabase';

export const RoomsComponent = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) {
        console.error('Error:', error);
        return;
      }
      setRooms(data);
    };
    fetchRooms();
  }, []);

  return <div>{rooms.length} rooms</div>;
};
```

### AFTER (D1 via API wrapper)
```typescript
import { roomsApi } from '@/lib/api';

export const RoomsComponent = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomsApi.getAllRooms();
        setRooms(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchRooms();
  }, []);

  return <div>{rooms.length} rooms</div>;
};
```

**Key Changes:**
- Replace `supabase.from().select()` with API wrapper functions
- Destructure `data` directly (error handling moved to try-catch)
- Use named imports from `@/lib/api`

---

## Pattern 3: Bookings Operations

### BEFORE (Supabase insert)
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert({
    room_id: 1,
    guest_id: guestId,
    check_in_date: '2025-01-10',
    check_out_date: '2025-01-15',
    number_of_guests: 2,
    total_nights: 5,
    total_price: 2495,
    status: 'pending'
  })
  .select()
  .single();
```

### AFTER (D1 via API)
```typescript
const booking = await bookingsApi.createBooking({
  room_id: 1,
  guest_id: guestId,
  check_in_date: '2025-01-10',
  check_out_date: '2025-01-15',
  number_of_guests: 2,
  total_nights: 5,
  total_price: 2495,
  status: 'pending'
});
```

**Key Changes:**
- Call API function directly with object
- No need for `.select().single()`
- Returned data structure is same

---

## Pattern 4: Admin/Protected Operations

### BEFORE (Supabase)
```typescript
const updateBookingStatus = async (bookingId: string, newStatus: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
```

### AFTER (D1 via API)
```typescript
const updateBookingStatus = async (bookingId: string, newStatus: string) => {
  return bookingsApi.updateBookingStatus(bookingId, newStatus);
};
```

**Key Changes:**
- Use specific API methods for each operation
- Error handling is automatic
- Authentication token sent automatically via AuthContext

---

## Pattern 5: Complex Queries with Joins

### BEFORE (Supabase view query)
```typescript
const getBookingDetails = async () => {
  const { data, error } = await supabase
    .from('booking_details')
    .select('*')
    .eq('email', userEmail)
    .order('check_in_date', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

### AFTER (D1 via API)
```typescript
const getBookingDetails = async () => {
  const allBookings = await bookingsApi.getAllBookings();
  return allBookings.filter(b => b.email === userEmail);
};
```

**Key Changes:**
- Views are pre-defined in D1 schema
- Filter results in JavaScript if needed
- Same data structure returned

---

## Pattern 6: Admin Authentication Check

### BEFORE (Supabase metadata)
```typescript
const checkAdminAccess = (user: User | null) => {
  return user?.user_metadata?.is_admin || 
         user?.app_metadata?.is_admin || 
         user?.email?.endsWith('@swiftroomhaven.com');
};

// Usage
if (!checkAdminAccess(user)) {
  return <Unauthorized />;
}
```

### AFTER (JWT claims in context)
```typescript
const { user, isAdmin } = useAuth();

// Usage
if (!isAdmin) {
  return <Unauthorized />;
}
```

**Key Changes:**
- `isAdmin` comes directly from AuthContext
- Checked during login/signup
- No need for manual metadata inspection

---

## Common API Methods Cheat Sheet

### Rooms
```typescript
roomsApi.getAllRooms()
roomsApi.getRoomById(id)
roomsApi.checkAvailability(roomId, checkIn, checkOut)
roomsApi.getAvailableRooms(checkIn, checkOut)
```

### Bookings
```typescript
bookingsApi.getAllBookings()
bookingsApi.getBookingById(id)
bookingsApi.getBookingsByEmail(email)
bookingsApi.createBooking(data)
bookingsApi.updateBookingStatus(id, status)
bookingsApi.cancelBooking(id)
bookingsApi.getUpcomingBookings()
bookingsApi.getBookingsByDateRange(start, end)
```

### Guests
```typescript
guestsApi.getAll()
guestsApi.create(data)
guestsApi.update(id, data)
guestsApi.createOrGetGuest(data)
guestsApi.getGuestByEmail(email)
```

### Contact Messages
```typescript
contactMessagesApi.createMessage(data)
contactMessagesApi.getAllMessages()
contactMessagesApi.getMessagesByStatus(status)
```

### Pet Care
```typescript
petCareApi.createRequest(data)
petCareApi.getAllRequests()
petCareApi.getRequestsByEmail(email)
petCareApi.updateRequestStatus(id, status)
```

---

## Error Handling

### BEFORE (Supabase)
```typescript
const { data, error } = await supabase.from(...);
if (error) {
  console.error(error.message);
  toast.error(error.message);
}
```

### AFTER (D1)
```typescript
try {
  const data = await apiFunction(...);
} catch (error: any) {
  console.error(error.message);
  toast.error(error.message || 'An error occurred');
}
```

---

## Testing Your Migration

After updating a component:

1. **Check imports**: No `@supabase` imports remain
2. **Check auth**: Using `useAuth()` hook if needed
3. **Check API calls**: All using API wrapper functions
4. **Test functionality**: User can still perform actions
5. **Check types**: TypeScript compilation succeeds

---

## Files Modified So Far

✅ Already converted:
- `src/lib/api.ts` - All API calls now use D1
- `src/contexts/AuthContext.tsx` - JWT-based auth
- `src/lib/supabase.ts` - Deprecated with warnings

⏳ Still need migration:
- `src/components/admin/*.tsx` (7 files)
- `src/components/customer/*.tsx` (2 files)
- `src/pages/*.tsx` (varies)

---

## Support

Need help? Check:
- `D1_MIGRATION_GUIDE.md` for detailed docs
- Component patterns above for common examples
- `src/lib/api.ts` for all available functions
- `src/contexts/AuthContext.tsx` for auth patterns
