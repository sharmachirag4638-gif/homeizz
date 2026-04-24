import { createServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const meta = data.user?.user_metadata;
      if (meta?.role === 'professional') {
        return NextResponse.redirect(`${origin}/pro-dashboard`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth?error=oauth`);
}