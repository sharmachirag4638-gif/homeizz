import { NextResponse } from 'next/server';
import { createServer, createAdmin } from '@/lib/supabase-server';
import {
  isProfessionalAccount,
  isTerminalSubscription,
  razorpayRequest,
  subscriptionPatchFromRazorpay,
  updateBillingMetadata,
} from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getProfile(admin, userId) {
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, phone, user_type, plan, billing_interval, subscription_status, razorpay_subscription_id')
    .eq('id', userId)
    .single();
  return data || null;
}

export async function POST(req) {
  try {
    const sb = createServer();
    const { data: userData } = await sb.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const cancelAtCycleEnd = body?.cancelAtCycleEnd !== false;

    const admin = createAdmin();
    const profile = await getProfile(admin, user.id);
    if (!isProfessionalAccount(user, profile)) {
      return NextResponse.json({ error: 'professional account required' }, { status: 403 });
    }

    if (!profile?.razorpay_subscription_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    if (isTerminalSubscription(profile.subscription_status)) {
      return NextResponse.json({
        ok: true,
        alreadyCancelled: true,
        subscriptionStatus: profile.subscription_status,
      });
    }

    const subscription = await razorpayRequest(`/subscriptions/${profile.razorpay_subscription_id}/cancel`, {
      method: 'POST',
      body: { cancel_at_cycle_end: cancelAtCycleEnd },
    });

    const patch = subscriptionPatchFromRazorpay(subscription, {
      subscription_cancel_at_cycle_end: cancelAtCycleEnd && subscription.status !== 'cancelled',
      subscription_pending_plan: null,
      subscription_pending_interval: null,
      subscription_last_event: cancelAtCycleEnd ? 'subscription.cancel_scheduled' : 'subscription.cancelled',
    });

    await admin.from('profiles').update(patch).eq('id', user.id);
    await updateBillingMetadata(admin, user, patch);

    return NextResponse.json({
      ok: true,
      cancelAtCycleEnd: patch.subscription_cancel_at_cycle_end,
      subscriptionStatus: patch.subscription_status,
      currentEnd: patch.subscription_current_end,
    });
  } catch (error) {
    console.error('[razorpay/cancel-subscription]', error);
    return NextResponse.json({ error: error.message || 'server error' }, { status: error.status || 500 });
  }
}
