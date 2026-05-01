import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/test-verify
 * Verifies the signature Razorpay sends after a successful test checkout.
 * No DB writes — pure crypto verification.
 */
export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ ok: false, error: 'Razorpay secret not configured' }, { status: 500 });

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, razorpay_order_id, razorpay_payment_id });
  } catch (e) {
    console.error('[razorpay/test-verify]', e);
    return NextResponse.json({ ok: false, error: e.message || 'server error' }, { status: 500 });
  }
}
