'use client';
import { useState } from 'react';
import Script from 'next/script';
import { inr } from '@/lib/utils';

/**
 * Drop-in "Pay milestone" button. Usage:
 *
 *   <RazorpayCheckoutButton
 *     quoteId={quote.id}
 *     milestoneIndex={0}
 *     amountPaise={5000000}       // optional — display only; server is source of truth
 *     userEmail={user.email}
 *     userPhone={user.phone}
 *     onSuccess={() => refresh()}
 *   />
 */
export default function RazorpayCheckoutButton({
  quoteId, milestoneIndex, amountPaise,
  userEmail, userPhone, userName,
  onSuccess, onError,
  label,
}) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      // 1. Create order on our server (keeps RAZORPAY_KEY_SECRET out of client).
      //    Note: amount is intentionally NOT sent — the server derives it from the
      //    quote's milestones so a tampered client can't pay ₹1 for a ₹1L milestone.
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, milestoneIndex }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || 'Could not start payment');

      // 2. Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Homeizz',
        description: `Milestone ${milestoneIndex + 1}`,
        image: '/logo.png',
        prefill: { name: userName, email: userEmail, contact: userPhone },
        theme: { color: '#C4622D' },
        // 3. On success, verify signature server-side
        handler: async function (response) {
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const data = await verify.json();
          if (data.ok) onSuccess?.(response);
          else onError?.(new Error(data.error || 'Verification failed'));
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on('payment.failed', (resp) => onError?.(new Error(resp.error?.description || 'Payment failed')));
      rzp.open();
    } catch (e) {
      onError?.(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button type="button" className="pay-btn" disabled={busy} onClick={handleClick}>
        {busy ? 'Opening…' : (label || `Pay ${inr(amountPaise)} via Razorpay`)}
      </button>
    </>
  );
}
