import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/test-order
 * Creates a small test order so we can verify Razorpay integration
 * without depending on the quote/payment DB tables.
 * Body: { amountPaise?: number }  (default 10000 = ₹100)
 */
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const amountPaise = Number.isInteger(body.amountPaise) ? body.amountPaise : 10000; // ₹100

    if (amountPaise < 100 || amountPaise > 1000000) {
      return NextResponse.json({ error: 'Amount out of test range (₹1 to ₹10,000)' }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay env vars not configured on server' }, { status: 500 });
    }
    if (!keyId.startsWith('rzp_test_')) {
      return NextResponse.json({ error: 'Refusing to run test page in live mode. Use rzp_test_ keys.' }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `test_${Date.now().toString(36)}`,
      notes: { source: 'homeizz_test_page' },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (e) {
    console.error('[razorpay/test-order]', e);
    return NextResponse.json({ error: e?.error?.description || e.message || 'server error' }, { status: 500 });
  }
}
