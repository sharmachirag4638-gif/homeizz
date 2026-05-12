import { NextResponse } from 'next/server';
import { createServer, createAdmin } from '@/lib/supabase-server';
import {
  findPlan,
  getPlanPrice,
  getRazorpayPlanId,
  hasLiveSubscription,
  isProfessionalAccount,
  isTerminalSubscription,
  normalizeBillingInterval,
  razorpayRequest,
  subscriptionPatchFromRazorpay,
  updateBillingMetadata,
} from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function totalBillingCycles(interval) {
  return interval === 'annual' ? 10 : 120;
}

async function getProfile(admin, userId) {
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, phone, user_type, role, plan, billing_interval, subscription_status, razorpay_subscription_id, razorpay_plan_id')
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
    const billingInterval = normalizeBillingInterval(body?.billingInterval || body?.billing);
    const targetPlan = findPlan(targetPlanId);
    if (!targetPlan) return NextResponse.json({ error: 'invalid plan' }, { status: 400 });

    const { envName, razorpayPlanId } = getRazorpayPlanId(targetPlanId, billingInterval);
    if (!razorpayPlanId) {
      return NextResponse.json({ error: `${envName} is not configured` }, { status: 500 });
    }

    const admin = createAdmin();
    const profile = await getProfile(admin, user.id);
    if (!isProfessionalAccount(user, profile)) {
      return NextResponse.json({ error: 'professional account required' }, { status: 403 });
    }

    const existingStatus = profile?.subscription_status;
    const existingSubscriptionId = profile?.razorpay_subscription_id;
    const existingIsReusable =
      existingSubscriptionId &&
      existingStatus === 'created' &&
      profile?.razorpay_plan_id === razorpayPlanId;

    if (existingIsReusable) {
      return NextResponse.json({
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscriptionId: existingSubscriptionId,
        planId: targetPlanId,
        billingInterval,
        amount: getPlanPrice(targetPlanId, billingInterval),
        status: existingStatus,
      });
    }

    if (existingSubscriptionId && hasLiveSubscription(existingStatus)) {
      return NextResponse.json({ error: 'Use change plan for an existing subscription' }, { status: 409 });
    }

    if (existingSubscriptionId && existingStatus && !isTerminalSubscription(existingStatus)) {
      await razorpayRequest(`/subscriptions/${existingSubscriptionId}/cancel`, {
        method: 'POST',
        body: { cancel_at_cycle_end: false },
      }).catch(() => null);
    }

    const subscriptionBody = {
      plan_id: razorpayPlanId,
      total_count: totalBillingCycles(billingInterval),
      quantity: 1,
      customer_notify: true,
      notes: {
        homeizz_user_id: user.id,
        homeizz_email: user.email || '',
        homeizz_plan: targetPlanId,
        homeizz_billing_interval: billingInterval,
      },
    };

    const subscription = await razorpayRequest('/subscriptions', {
      method: 'POST',
      body: subscriptionBody,
    });

    const patch = subscriptionPatchFromRazorpay(subscription, {
      plan: targetPlanId,
      billing_interval: billingInterval,
      subscription_status: subscription.status || 'created',
      subscription_cancel_at_cycle_end: false,
      subscription_cancelled_at: null,
      subscription_pending_plan: null,
      subscription_pending_interval: null,
      subscription_last_event: 'subscription.created',
    });

    await admin.from('profiles').upsert({
      id: user.id,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      phone: profile?.phone || user.user_metadata?.phone || '',
      user_type: profile?.user_type || 'professional',
      ...patch,
    }, { onConflict: 'id' });

    await updateBillingMetadata(admin, user, patch);

    return NextResponse.json({
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
      planId: targetPlanId,
      billingInterval,
      amount: getPlanPrice(targetPlanId, billingInterval),
      status: subscription.status,
      startAt: subscription.start_at,
    });
  } catch (error) {
    console.error('[razorpay/create-subscription]', error);
    return NextResponse.json({ error: error.message || 'server error' }, { status: error.status || 500 });
  }
}
