import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdmin } from '@/lib/supabase-server';
import {
  planFromRazorpayPlanId,
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

function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return timingSafeHexEqual(expected, signature);
}

async function findProfile(admin, subscription) {
  const subscriptionId = subscription?.id;
  const noteUserId = subscription?.notes?.homeizz_user_id;

  if (subscriptionId) {
    const { data } = await admin
      .from('profiles')
      .select('id, plan, billing_interval, subscription_cancel_at_cycle_end, subscription_pending_plan, subscription_pending_interval')
      .eq('razorpay_subscription_id', subscriptionId)
      .single();
    if (data) return data;
  }

  if (noteUserId) {
    const { data } = await admin
      .from('profiles')
      .select('id, plan, billing_interval, subscription_cancel_at_cycle_end, subscription_pending_plan, subscription_pending_interval')
      .eq('id', noteUserId)
      .single();
    if (data) return data;
  }

  return null;
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const eventId = req.headers.get('x-razorpay-event-id');

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event || 'unknown';
    const subscription = event?.payload?.subscription?.entity;
    const payment = event?.payload?.payment?.entity;

    if (!subscription?.id) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const admin = createAdmin();
    const profile = await findProfile(admin, subscription);
    const mappedPlan = planFromRazorpayPlanId(subscription.plan_id);
    const pendingWasApplied =
      mappedPlan &&
      profile?.subscription_pending_plan === mappedPlan.planId &&
      profile?.subscription_pending_interval === mappedPlan.billingInterval;

    const patch = subscriptionPatchFromRazorpay(subscription, {
      subscription_cancel_at_cycle_end:
        subscription.status === 'cancelled' ? false : profile?.subscription_cancel_at_cycle_end || false,
      subscription_pending_plan: pendingWasApplied ? null : profile?.subscription_pending_plan || null,
      subscription_pending_interval: pendingWasApplied ? null : profile?.subscription_pending_interval || null,
      subscription_last_payment_id: payment?.id || null,
      subscription_last_event: eventType,
    });

    if (subscription.status !== 'cancelled' && subscription.ended_at == null) {
      delete patch.subscription_cancelled_at;
    }

    if (profile?.id) {
      await admin.from('profiles').update(patch).eq('id', profile.id);

      const { data: userData } = await admin.auth.admin.getUserById(profile.id);
      if (userData?.user) {
        await updateBillingMetadata(admin, userData.user, patch);
      }
    }

    await admin.from('subscription_events').upsert({
      event_id: eventId,
      profile_id: profile?.id || null,
      razorpay_subscription_id: subscription.id,
      event_type: eventType,
      payload: event,
    }, {
      onConflict: 'event_id',
      ignoreDuplicates: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[razorpay/webhook]', error);
    return NextResponse.json({ ok: false, error: error.message || 'server error' }, { status: 500 });
  }
}
