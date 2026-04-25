import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  starter_monthly: { amount: 49900, period: 'monthly', interval: 1 },
  growth_monthly: { amount: 149900, period: 'monthly', interval: 1 },
  pro_monthly: { amount: 399900, period: 'monthly', interval: 1 },
  starter_annual: { amount: 499000, period: 'yearly', interval: 1 },
  growth_annual: { amount: 1499000, period: 'yearly', interval: 1 },
  pro_annual: { amount: 3999000, period: 'yearly', interval: 1 },
};

export async function POST(request) {
  try {
    const { plan, billing, name, email, phone } = await request.json();
    const planKey = `${plan}_${billing}`;
    const planDetails = PLANS[planKey];

    if (!planDetails) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const razorpayPlan = await razorpay.plans.create({
      period: planDetails.period,
      interval: planDetails.interval,
      item: {
        name: `Homeizz ${plan.charAt(0).toUpperCase()+plan.slice(1)} Plan`,
        amount: planDetails.amount,
        currency: 'INR',
      },
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlan.id,
      total_count: billing === 'annual' ? 12 : 36,
      start_at: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60),
      customer_notify: 1,
      notes: { name, email, phone, plan, billing },
    });

    return Response.json({ subscription_id: subscription.id, plan: razorpayPlan });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}