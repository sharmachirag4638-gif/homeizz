import { PLANS } from '@/lib/plans';

export const BILLING_INTERVALS = ['monthly', 'annual'];

export const TERMINAL_SUBSCRIPTION_STATUSES = ['cancelled', 'completed', 'expired'];
export const CHANGEABLE_SUBSCRIPTION_STATUSES = ['authenticated', 'active'];
export const BILLING_LIVE_STATUSES = ['authenticated', 'active'];

const SUBSCRIPTION_STATUS_ORDER = {
  created: 1,
  authenticated: 2,
  active: 3,
};

const RAZORPAY_PLAN_ENV = {
  starter: {
    monthly: 'RAZORPAY_PLAN_STARTER_MONTHLY',
    annual: 'RAZORPAY_PLAN_STARTER_ANNUAL',
  },
  growth: {
    monthly: 'RAZORPAY_PLAN_GROWTH_MONTHLY',
    annual: 'RAZORPAY_PLAN_GROWTH_ANNUAL',
  },
  pro: {
    monthly: 'RAZORPAY_PLAN_PRO_MONTHLY',
    annual: 'RAZORPAY_PLAN_PRO_ANNUAL',
  },
};

export function findPlan(planId) {
  return PLANS.find(plan => plan.id === planId) || null;
}

export function normalizeBillingInterval(interval) {
  return BILLING_INTERVALS.includes(interval) ? interval : 'monthly';
}

export function getPlanPrice(planId, interval = 'monthly') {
  const plan = findPlan(planId);
  if (!plan) return null;
  return normalizeBillingInterval(interval) === 'annual' ? plan.annual : plan.monthly;
}

export function getPlanMonthlyEquivalent(planId, interval = 'monthly') {
  const plan = findPlan(planId);
  if (!plan) return null;
  return normalizeBillingInterval(interval) === 'annual' ? plan.annualMonthly : plan.monthly;
}

export function getPlanEnvName(planId, interval = 'monthly') {
  return RAZORPAY_PLAN_ENV[planId]?.[normalizeBillingInterval(interval)] || null;
}

export function getRazorpayPlanId(planId, interval = 'monthly') {
  const envName = getPlanEnvName(planId, interval);
  const razorpayPlanId = envName ? process.env[envName]?.trim() : null;
  return { envName, razorpayPlanId };
}

export function planFromRazorpayPlanId(razorpayPlanId) {
  if (!razorpayPlanId) return null;
  for (const plan of PLANS) {
    for (const interval of BILLING_INTERVALS) {
      const { razorpayPlanId: configuredPlanId } = getRazorpayPlanId(plan.id, interval);
      if (configuredPlanId === razorpayPlanId) return { planId: plan.id, billingInterval: interval };
    }
  }
  return null;
}

export function hasLiveSubscription(status) {
  return BILLING_LIVE_STATUSES.includes(status);
}

export function isTerminalSubscription(status) {
  return TERMINAL_SUBSCRIPTION_STATUSES.includes(status);
}

export function shouldPreserveNewerSubscriptionStatus(currentStatus, incomingStatus) {
  const currentRank = SUBSCRIPTION_STATUS_ORDER[String(currentStatus || '').trim().toLowerCase()];
  const incomingRank = SUBSCRIPTION_STATUS_ORDER[String(incomingStatus || '').trim().toLowerCase()];
  return Number.isFinite(currentRank) && Number.isFinite(incomingRank) && incomingRank < currentRank;
}

export function unixToIso(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

export function subscriptionPatchFromRazorpay(subscription, overrides = {}) {
  const planMatch = planFromRazorpayPlanId(subscription?.plan_id);
  return {
    ...(planMatch ? { plan: planMatch.planId, billing_interval: planMatch.billingInterval } : {}),
    razorpay_subscription_id: subscription?.id || null,
    razorpay_plan_id: subscription?.plan_id || null,
    razorpay_customer_id: subscription?.customer_id || null,
    subscription_status: subscription?.status || null,
    subscription_current_start: unixToIso(subscription?.current_start),
    subscription_current_end: unixToIso(subscription?.current_end),
    subscription_cancelled_at: unixToIso(subscription?.ended_at),
    subscription_updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function ensureRazorpayKeys() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured');
  }
  if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
    throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID must start with rzp_test_ or rzp_live_');
  }
  return { keyId, keySecret };
}

export async function razorpayRequest(path, { method = 'GET', body } = {}) {
  const { keyId, keySecret } = ensureRazorpayKeys();
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const razorpayMessage = payload?.error?.description || payload?.error?.reason || payload?.error;
    const message = response.status === 401
      ? 'Razorpay authentication failed. In Vercel, check NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are copied from the same Razorpay account and same mode, then redeploy.'
      : (razorpayMessage || 'Razorpay request failed');
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function isProfessionalAccount(user, profile) {
  const role = user?.user_metadata?.role || profile?.user_type || profile?.role;
  return ['professional', 'architect', 'designer'].includes(role);
}

export async function updateBillingMetadata(admin, user, patch) {
  const nextMetadata = { ...(user?.user_metadata || {}) };

  [
    ['plan', patch.plan],
    ['billing', patch.billing_interval],
    ['billing_interval', patch.billing_interval],
    ['subscription_status', patch.subscription_status],
    ['razorpay_subscription_id', patch.razorpay_subscription_id],
    ['subscription_cancel_at_cycle_end', patch.subscription_cancel_at_cycle_end],
    ['subscription_pending_plan', patch.subscription_pending_plan],
    ['subscription_pending_interval', patch.subscription_pending_interval],
  ].forEach(([key, value]) => {
    if (value !== undefined) nextMetadata[key] = value;
  });

  await admin.auth.admin.updateUserById(user.id, { user_metadata: nextMetadata });
}
