import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSbClient } from '@supabase/supabase-js';

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
    then: (resolve, reject) => emptyResult.then(resolve, reject),
    catch: reject => emptyResult.catch(reject),
    finally: callback => emptyResult.finally(callback),
  };

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => chain,
    storage: { from: () => chain },
  };
}

export function createServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return createMissingEnvClient();

  const cookieStore = cookies();
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export function createAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
