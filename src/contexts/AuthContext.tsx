import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { token: string; expiresAt: string } | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ token: string; expiresAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const expiresAt = localStorage.getItem('auth_expires_at');

    if (storedToken && storedUser && expiresAt) {
      try {
        // Check if token is still valid
        const now = new Date().getTime();
        if (now < parseInt(expiresAt)) {
          const parsedUser: AuthUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setSession({ token: storedToken, expiresAt });
          setIsAdmin(parsedUser.is_admin);
          setLoading(false);
        } else {
          // Token expired, clear storage
          clearAuth();
          setLoading(false);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        clearAuth();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires_at');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting sign up process for:', email);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      // Store token and user
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_expires_at', data.expiresAt.toString());

      setUser(data.user);
      setSession({ token: data.token, expiresAt: data.expiresAt });
      setIsAdmin(data.user.is_admin);

      toast({
        title: 'Account Created!',
        description: 'Welcome to Luxe Hotel. Your account has been created successfully.',
      });
    } catch (error: any) {
      console.error('Sign up error:', error);

      let errorMessage = 'An error occurred during sign up.';

      if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Try signing in instead.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 8 characters long.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed');
      }

      // Store token and user
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_expires_at', data.expiresAt.toString());

      setUser(data.user);
      setSession({ token: data.token, expiresAt: data.expiresAt });
      setIsAdmin(data.user.is_admin);

      toast({
        title: 'Welcome Back!',
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Invalid email or password.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/admin-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Admin sign in failed');
      }

      if (!data.user.is_admin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Store token and user
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_expires_at', data.expiresAt.toString());

      setUser(data.user);
      setSession({ token: data.token, expiresAt: data.expiresAt });
      setIsAdmin(true);

      toast({
        title: 'Admin Access Granted',
        description: 'Welcome to the admin panel.',
      });
    } catch (error: any) {
      toast({
        title: 'Admin Login Failed',
        description: error.message || 'Admin authentication failed.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Call logout endpoint to invalidate token
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignore errors on logout
        });
      }

      clearAuth();

      toast({
        title: 'Signed Out',
        description: "You've been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: 'Sign Out Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for the password reset link.',
      });
    } catch (error: any) {
      toast({
        title: 'Password Reset Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) throw new Error('No user logged in');

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Profile update failed');
      }

      // Update user in state
      const updatedUser = { ...user, ...result.user };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signInAsAdmin,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
