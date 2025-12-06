# Reservation Logic Overhaul

## Overview
The reservation logic has been completely refactored to ensure reliability and prevent data consistency errors. The previous implementation relied on a fragile frontend-orchestrated "check-then-create" flow which was prone to race conditions and Primary Key violations.

## Changes Implemented

### 1. Unified Guest Management (Backend)
*   **Endpoint**: `POST /api/guests/upsert`
*   **Logic**:
    1.  **Check by ID**: First, checks if a guest exists with the provided ID (crucial for logged-in users).
    2.  **Check by Email**: If no ID match, checks if a guest exists with the provided email.
    3.  **Update vs Create**:
        *   If found (by ID or Email), updates the existing record with new details.
        *   If not found, creates a new guest record.
    4.  **Safety**: Explicitly prevents modification of the Primary Key (`id`) during updates.

### 2. Simplified Frontend Logic
*   **File**: `src/lib/api.ts`
*   **Function**: `createOrGetGuest`
*   **Change**: Removed the complex client-side logic (GET then POST). Now makes a single call to the `upsert` endpoint.
*   **Benefit**: Reduces network round-trips and eliminates the possibility of the client trying to create a duplicate user.

### 3. Robust Error Handling
*   **Backend**: Added detailed error logging and specific error responses.
*   **Frontend**: Improved error propagation to the UI.

## New Reservation Flow
1.  **User submits form** in `ReservationModal`.
2.  **Frontend** calls `guestsApi.createOrGetGuest(data)`.
3.  **Backend** (`/api/guests/upsert`) intelligently resolves the guest identity and returns the correct Guest object (guaranteed to exist).
4.  **Frontend** receives the valid `guest_id`.
5.  **Frontend** calls `bookingsApi.createBooking` with the `guest_id` and room details.
6.  **Backend** creates the booking record.
7.  **Success** message displayed.

## Verification
This new architecture solves the "Primary Key Constraint Violation" by ensuring that we never attempt to `INSERT` a guest record that already exists. Instead, we gracefully `UPDATE` it.
