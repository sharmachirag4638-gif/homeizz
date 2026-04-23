import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/send-email
 * Body: { to, subject, html, replyTo? }
 * Requires RESEND_API_KEY in env. Call this from server components or other
 * API routes — do NOT call directly from browser JS (no auth check).
 */
export async function POST(req) {
  try {
    const { to, subject, html, replyTo } = await req.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    }
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ ok: false, error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL || 'Homeizz <hello@homeizz.com>';
    const { error } = await resend.emails.send({ from, to, subject, html, replyTo });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
