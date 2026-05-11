'use client';
import { createBrowserClient } from '@supabase/ssr';

function createMissingEnvClient() {
  const emptyResult = Promise.resolve({ data: null, error: null });
  const chain = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    ilike: () => chain,
    order: () => chain,
    limit: () => emptyResult,
    single: () => emptyResult,
    insert: () => emptyResult,
    update: () => emptyResult,
    delete: () => emptyResult,
    upsert: () => emptyResult,
  };

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOAuth: () => emptyResult,
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => chain,
    storage: { from: () => chain },
  };
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (typeof window !== 'undefined') {
      console.warn('Supabase environment variables are missing. Auth and dashboard actions are disabled.');
    }
    return createMissingEnvClient();
  }

  return createBrowserClient(url, anonKey);
}
