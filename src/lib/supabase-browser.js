'use client';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase instance. Uses only the public anon key — safe in the browser
 * as long as Row Level Security (RLS) is enabled on every table in Supabase.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
