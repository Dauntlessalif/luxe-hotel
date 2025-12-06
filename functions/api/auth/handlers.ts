/**
 * Cloudflare Worker Authentication Handlers
 * Handles JWT-based authentication for D1 database
 */

import { sign, verify } from 'jsonwebtoken';
import * as d1 from '../d1';

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface AuthPayload {
  id: string;
  email: string;
  is_admin: boolean;
}

export async function handleSignup(request: Request, env: any): Promise<Response> {
  try {
    const { email, password, first_name, last_name, phone, address, city, country } = await request.json();

    // Validate input
    if (!email || !password || !first_name || !last_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Check if user already exists
    const existingUser = await d1.getGuestByEmail(email);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already registered' }), { status: 400 });
    }

    // Create auth user (in production, hash the password)
    const userId = crypto.randomUUID();
    const guestId = crypto.randomUUID();

    // Store user in D1
    await env.DB.prepare(
      `INSERT INTO auth_users (id, email, password_hash, first_name, last_name, is_admin, is_active)
       VALUES (?, ?, ?, ?, ?, 0, 1)`
    ).bind(userId, email, password, first_name, last_name).run();

    // Create guest profile
    await env.DB.prepare(
      `INSERT INTO guests (id, first_name, last_name, email, phone, address, city, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(guestId, first_name, last_name, email, phone, address || '', city || '', country || '').run();

    // Generate JWT
    const expiresAt = Date.now() + TOKEN_EXPIRES_IN;
    const token = sign(
      { id: userId, email, is_admin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: userId,
          email,
          first_name,
          last_name,
          is_admin: false,
        },
        expiresAt,
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Signup failed' }), { status: 500 });
  }
}

export async function handleSignin(request: Request, env: any): Promise<Response> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
    }

    // Find user in D1
    const result = await env.DB.prepare(
      `SELECT id, email, first_name, last_name, is_admin FROM auth_users WHERE email = ? AND password_hash = ?`
    ).bind(email, password).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
    }

    // Generate JWT
    const expiresAt = Date.now() + TOKEN_EXPIRES_IN;
    const token = sign(
      { id: result.id, email: result.email, is_admin: result.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: result.id,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          is_admin: result.is_admin,
        },
        expiresAt,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signin error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Signin failed' }), { status: 500 });
  }
}

export async function handleAdminSignin(request: Request, env: any): Promise<Response> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
    }

    // Find user in D1
    const result = await env.DB.prepare(
      `SELECT id, email, first_name, last_name, is_admin FROM auth_users WHERE email = ? AND password_hash = ? AND is_admin = 1`
    ).bind(email, password).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Invalid credentials or not an admin' }), { status: 401 });
    }

    // Generate JWT
    const expiresAt = Date.now() + TOKEN_EXPIRES_IN;
    const token = sign(
      { id: result.id, email: result.email, is_admin: result.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: result.id,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          is_admin: result.is_admin,
        },
        expiresAt,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin signin error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Admin signin failed' }), { status: 500 });
  }
}

export async function handleSignout(request: Request, env: any): Promise<Response> {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 400 });
    }

    // Token invalidation would be handled by client-side localStorage clearing
    // In production, you might store token blacklist in D1

    return new Response(JSON.stringify({ message: 'Signed out successfully' }), { status: 200 });
  } catch (error: any) {
    console.error('Signout error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Signout failed' }), { status: 500 });
  }
}

export async function handleResetPassword(request: Request, env: any): Promise<Response> {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
    }

    // Check if user exists
    const result = await env.DB.prepare(
      `SELECT id FROM auth_users WHERE email = ?`
    ).bind(email).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // In production, send email with reset link
    // For now, just acknowledge the request
    return new Response(
      JSON.stringify({ message: 'Password reset link sent to email' }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Reset failed' }), { status: 500 });
  }
}

export async function handleUpdateProfile(request: Request, env: any): Promise<Response> {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    const updates = await request.json();
    const userId = decoded.id;

    // Build update query
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.first_name !== undefined) {
      updateFields.push('first_name = ?');
      values.push(updates.first_name);
    }
    if (updates.last_name !== undefined) {
      updateFields.push('last_name = ?');
      values.push(updates.last_name);
    }

    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
    }

    updateFields.push('updated_at = datetime("now")');
    values.push(userId);

    // Update user
    await env.DB.prepare(
      `UPDATE auth_users SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    // Get updated user
    const result = await env.DB.prepare(
      `SELECT id, email, first_name, last_name, is_admin FROM auth_users WHERE id = ?`
    ).bind(userId).first();

    return new Response(
      JSON.stringify({
        user: result,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Update failed' }), { status: 500 });
  }
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}
