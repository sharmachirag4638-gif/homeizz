import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServer, createAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Verifies the HMAC signature Razorpay returns after checkout. The signature
 * is the trust step — without it a client could fake success. We additionally
 * bind the update to the authenticated user so a stolen triplet can't be
 * replayed against an unrelated payment row.
 */
export async function POST(req) {
  try {
    const sb = createServer();
    const { data: userData } = await sb.auth.getUser();
    if (!userData?.user) {
      return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // Constant-time comparison to avoid timing-channel signature guessing.
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(razorpay_signature, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 400 });
    }

    const admin = createAdmin();
    const { data: payment } = await admin
      .from('payments')
      .select('id, homeowner_id, status')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();
    if (!payment) {
      return NextResponse.json({ ok: false, error: 'payment not found' }, { status: 404 });
    }
    if (payment.homeowner_id !== userData.user.id) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }
    if (payment.status === 'paid') {
      // Idempotent: don't re-flip already-paid rows.
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    await admin.from('payments').update({
      status: 'paid',
      razorpay_payment_id,
      razorpay_signature,
      paid_at: new Date().toISOString(),
    }).eq('id', payment.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[razorpay/verify]', e);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
