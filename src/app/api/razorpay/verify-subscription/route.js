import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServer, createAdmin } from '@/lib/supabase-server';
import {
  ensureRazorpayKeys,
  razorpayRequest,
  subscriptionPatchFromRazorpay,
  updateBillingMetadata,
} from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function timingSafeHexEqual(expected, received) {
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(received || '', 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req) {
  try {
    const sb = createServer();
    const { data: userData } = await sb.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    }

    const { keySecret } = ensureRazorpayKeys();
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    if (!timingSafeHexEqual(expected, razorpay_signature)) {
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 400 });
    }

    const admin = createAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('id, plan, billing_interval, razorpay_subscription_id')
      .eq('razorpay_subscription_id', razorpay_subscription_id)
      .single();

    if (!profile) {
      return NextResponse.json({ ok: false, error: 'subscription not found' }, { status: 404 });
    }

    if (profile.id !== user.id) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }

    const subscription = await razorpayRequest(`/subscriptions/${razorpay_subscription_id}`);
    const patch = subscriptionPatchFromRazorpay(subscription, {
      subscription_cancel_at_cycle_end: false,
      subscription_cancelled_at: null,
      subscription_pending_plan: null,
      subscription_pending_interval: null,
      subscription_last_payment_id: razorpay_payment_id,
      subscription_last_event: 'subscription.checkout_verified',
    });

    await admin.from('profiles').update(patch).eq('id', user.id);
    await updateBillingMetadata(admin, user, patch);

    return NextResponse.json({
      ok: true,
      planId: patch.plan,
      billingInterval: patch.billing_interval,
      subscriptionStatus: patch.subscription_status,
      currentEnd: patch.subscription_current_end,
    });
  } catch (error) {
    console.error('[razorpay/verify-subscription]', error);
    return NextResponse.json({ ok: false, error: error.message || 'server error' }, { status: error.status || 500 });
  }
}
