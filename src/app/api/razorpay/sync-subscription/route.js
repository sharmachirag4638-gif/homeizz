import { NextResponse } from 'next/server';
import { createServer, createAdmin } from '@/lib/supabase-server';
import {
  razorpayRequest,
  subscriptionPatchFromRazorpay,
  updateBillingMetadata,
} from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROFILE_FIELDS = 'id, full_name, phone, user_type, plan, billing_interval, subscription_status, razorpay_subscription_id, razorpay_plan_id, subscription_current_start, subscription_current_end, subscription_cancel_at_cycle_end, subscription_cancelled_at, subscription_pending_plan, subscription_pending_interval';

export async function POST() {
  try {
    const sb = createServer();
    const { data: userData } = await sb.auth.getUser();
    const user = userData?.user;
    if (!user) return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });

    const admin = createAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select(PROFILE_FIELDS)
      .eq('id', user.id)
      .single();

    const subscriptionId = profile?.razorpay_subscription_id || user.user_metadata?.razorpay_subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({ ok: false, error: 'No Razorpay subscription is saved for this account' }, { status: 404 });
    }

    const subscription = await razorpayRequest(`/subscriptions/${subscriptionId}`);
    const patch = subscriptionPatchFromRazorpay(subscription, {
      subscription_last_event: 'subscription.manual_sync',
    });

    const { data: updatedProfile, error: updateError } = await admin
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select(PROFILE_FIELDS)
      .single();

    if (updateError) throw updateError;
    await updateBillingMetadata(admin, user, patch);

    return NextResponse.json({
      ok: true,
      profile: updatedProfile,
      subscriptionStatus: patch.subscription_status,
      razorpaySubscriptionId: patch.razorpay_subscription_id,
    });
  } catch (error) {
    console.error('[razorpay/sync-subscription]', error);
    return NextResponse.json({ ok: false, error: error.message || 'server error' }, { status: error.status || 500 });
  }
}
