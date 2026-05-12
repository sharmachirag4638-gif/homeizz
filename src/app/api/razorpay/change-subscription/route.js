import { NextResponse } from 'next/server';
import { createServer, createAdmin } from '@/lib/supabase-server';
import {
  CHANGEABLE_SUBSCRIPTION_STATUSES,
  findPlan,
  getPlanMonthlyEquivalent,
  getPlanPrice,
  getRazorpayPlanId,
  isProfessionalAccount,
  normalizeBillingInterval,
  razorpayRequest,
  subscriptionPatchFromRazorpay,
  updateBillingMetadata,
} from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getProfile(admin, userId) {
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, phone, user_type, plan, billing_interval, subscription_status, razorpay_subscription_id, razorpay_plan_id, subscription_cancel_at_cycle_end')
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

    const body = await req.json();
    const targetPlanId = body?.planId;
    const targetInterval = normalizeBillingInterval(body?.billingInterval || body?.billing);
    if (!findPlan(targetPlanId)) return NextResponse.json({ error: 'invalid plan' }, { status: 400 });

    const { envName, razorpayPlanId } = getRazorpayPlanId(targetPlanId, targetInterval);
    if (!razorpayPlanId) {
      return NextResponse.json({ error: `${envName} is not configured` }, { status: 500 });
    }

    const admin = createAdmin();
    const profile = await getProfile(admin, user.id);
    if (!isProfessionalAccount(user, profile)) {
      return NextResponse.json({ error: 'professional account required' }, { status: 403 });
    }

    const subscriptionId = profile?.razorpay_subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found. Start a subscription first.' }, { status: 404 });
    }

    if (!CHANGEABLE_SUBSCRIPTION_STATUSES.includes(profile?.subscription_status)) {
      return NextResponse.json({
        error: 'Subscription must be active or authenticated before it can be changed',
      }, { status: 409 });
    }

    const currentPlanId = profile?.plan || user.user_metadata?.plan || 'growth';
    const currentInterval = normalizeBillingInterval(profile?.billing_interval || user.user_metadata?.billing_interval || user.user_metadata?.billing);
    if (currentPlanId === targetPlanId && currentInterval === targetInterval) {
      return NextResponse.json({
        ok: true,
        unchanged: true,
        planId: currentPlanId,
        billingInterval: currentInterval,
      });
    }

    const currentEquivalent = getPlanMonthlyEquivalent(currentPlanId, currentInterval) || 0;
    const targetEquivalent = getPlanMonthlyEquivalent(targetPlanId, targetInterval) || 0;
    const scheduleChangeAt = targetEquivalent > currentEquivalent ? 'now' : 'cycle_end';

    const subscription = await razorpayRequest(`/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: {
        plan_id: razorpayPlanId,
        quantity: 1,
        schedule_change_at: scheduleChangeAt,
        customer_notify: true,
      },
    });

    const appliesNow = scheduleChangeAt === 'now';
    const patch = subscriptionPatchFromRazorpay(subscription, {
      plan: appliesNow ? targetPlanId : currentPlanId,
      billing_interval: appliesNow ? targetInterval : currentInterval,
      razorpay_plan_id: appliesNow ? razorpayPlanId : (profile.razorpay_plan_id || subscription.plan_id),
      subscription_status: subscription.status || profile.subscription_status,
      subscription_cancel_at_cycle_end: false,
      subscription_cancelled_at: null,
      subscription_pending_plan: appliesNow ? null : targetPlanId,
      subscription_pending_interval: appliesNow ? null : targetInterval,
      subscription_last_event: appliesNow ? 'subscription.updated_now' : 'subscription.update_scheduled',
    });

    await admin.from('profiles').update(patch).eq('id', user.id);
    await updateBillingMetadata(admin, user, patch);

    return NextResponse.json({
      ok: true,
      planId: patch.plan,
      billingInterval: patch.billing_interval,
      pendingPlanId: patch.subscription_pending_plan,
      pendingBillingInterval: patch.subscription_pending_interval,
      amount: getPlanPrice(targetPlanId, targetInterval),
      scheduleChangeAt,
      subscriptionStatus: patch.subscription_status,
    });
  } catch (error) {
    console.error('[razorpay/change-subscription]', error);
    return NextResponse.json({ error: error.message || 'server error' }, { status: error.status || 500 });
  }
}
