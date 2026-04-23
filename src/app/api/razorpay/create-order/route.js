import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createServer, createAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/create-order
 * Body: { quoteId: string, milestoneIndex: number, amountPaise: number }
 *
 * Creates a Razorpay order, records a pending payment row, and returns
 * the order_id + amount so the client can open Razorpay Checkout.
 */
export async function POST(req) {
  try {
    const sb = createServer();
    const { data: userData } = await sb.auth.getUser();
    if (!userData?.user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const { quoteId, milestoneIndex, amountPaise } = await req.json();
    if (!quoteId || !Number.isInteger(milestoneIndex) || !Number.isInteger(amountPaise) || amountPaise < 100) {
      return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }

    // Validate the quote is real and belongs to this user (via the quote_request)
    const admin = createAdmin();
    const { data: q } = await admin
      .from('quotes')
      .select('id, total_paise, milestones, quote_request_id, designer_id')
      .eq('id', quoteId)
      .single();
    if (!q) return NextResponse.json({ error: 'quote not found' }, { status: 404 });

    const { data: qr } = await admin
      .from('quote_requests')
      .select('homeowner_id')
      .eq('id', q.quote_request_id)
      .single();
    if (!qr || qr.homeowner_id !== userData.user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `hm_${quoteId.slice(0,8)}_${milestoneIndex}`,
      notes: { quoteId, milestoneIndex: String(milestoneIndex) },
    });

    await admin.from('payments').insert({
      quote_id: quoteId,
      homeowner_id: userData.user.id,
      amount_paise: amountPaise,
      milestone_index: milestoneIndex,
      razorpay_order_id: order.id,
      status: 'created',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error('[razorpay/create-order]', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
