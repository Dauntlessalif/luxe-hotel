/**
 * DEPRECATED: This file is kept for backwards compatibility only
 * All database operations have been migrated to Cloudflare D1
 * See src/lib/d1.ts for the new database abstraction layer
 * 
 * The Supabase client should no longer be used
 */

// This export is kept to prevent runtime errors in existing imports
// but should be removed once all components are updated
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => { throw new Error('Use AuthContext.signUp instead'); },
    signInWithPassword: async () => { throw new Error('Use AuthContext.signIn instead'); },
    signOut: async () => { throw new Error('Use AuthContext.signOut instead'); },
    resetPasswordForEmail: async () => { throw new Error('Use AuthContext.resetPassword instead'); },
    updateUser: async () => { throw new Error('Use AuthContext.updateProfile instead'); },
  },
  from: (table: string) => {
    throw new Error(`Database operations have been migrated to D1. Use the appropriate API from src/lib/api.ts instead.`);
  },
  rpc: (name: string) => {
    throw new Error(`RPC operations have been migrated to D1. Use the appropriate API from src/lib/api.ts instead.`);
  },
} as any;

