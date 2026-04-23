import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSbClient } from '@supabase/supabase-js';

/** Server-side, respects the user's auth cookies (use in Server Components / Route Handlers). */
export function createServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* called from a Server Component — fine to ignore */ }
        },
      },
    }
  );
}

/** Privileged admin client for server-only work (cron, migrations, webhooks). Bypasses RLS. */
export function createAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
