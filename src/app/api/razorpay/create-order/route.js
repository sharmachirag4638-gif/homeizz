import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createServer, createAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/razorpay/create-order
 * Body: { quoteId: string, milestoneIndex: number }
 *
 * The amount is derived from the quote's milestones on the server — never
 * trust a client-supplied amount, or a malicious user can pay ₹1 for a ₹10L quote.
 */
export async function POST(req) {
  try {
    const sb = createServer();
    const { data: userData } = await sb.auth.getUser();
    if (!userData?.user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const { quoteId, milestoneIndex } = await req.json();
    if (!quoteId || !Number.isInteger(milestoneIndex) || milestoneIndex < 0) {
      return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }

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

    // Derive amount from the milestone — ignore anything the client claims.
    const milestones = Array.isArray(q.milestones) ? q.milestones : [];
    if (milestoneIndex >= milestones.length) {
      return NextResponse.json({ error: 'invalid milestone' }, { status: 400 });
    }
    const amountPaise = Number(milestones[milestoneIndex]?.paise);
    if (!Number.isInteger(amountPaise) || amountPaise < 100) {
      return NextResponse.json({ error: 'milestone amount unavailable' }, { status: 400 });
    }

    // Reject duplicate orders for the same milestone if one is already paid or pending.
    const { data: existing } = await admin
      .from('payments')
      .select('id, status')
      .eq('quote_id', quoteId)
      .eq('milestone_index', milestoneIndex)
      .in('status', ['paid', 'created']);
    if (existing && existing.some(p => p.status === 'paid')) {
      return NextResponse.json({ error: 'milestone already paid' }, { status: 409 });
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
