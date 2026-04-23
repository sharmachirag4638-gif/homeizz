import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Verifies the signature Razorpay returns after checkout. If valid,
 * flips the payment row to "paid". This is the trust step — without
 * verification, a malicious client could fake a successful payment.
 */
export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 400 });
    }

    const admin = createAdmin();
    await admin.from('payments').update({
      status: 'paid',
      razorpay_payment_id,
      razorpay_signature,
      paid_at: new Date().toISOString(),
    }).eq('razorpay_order_id', razorpay_order_id);

    // TODO: trigger Resend email + WhatsApp notification to designer + homeowner
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[razorpay/verify]', e);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
