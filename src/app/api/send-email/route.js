import { Resend } from 'resend';
import { createServer, createAdmin } from '@/lib/supabase-server';
import { escapeHTML } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy-init so a missing RESEND_API_KEY doesn't crash the build.
let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  _resend = new Resend(key);
  return _resend;
}

/**
 * POST /api/send-email
 * Body: { type: 'enquiry', enquiryId: string }
 *
 * The endpoint never accepts client-supplied recipient or HTML — that would be
 * an open relay tied to our sending domain. Callers pass an ID; the server
 * looks up the row, verifies ownership, and builds the email from a fixed
 * template with every interpolation HTML-escaped.
 */
export async function POST(request) {
  try {
    const sb = createServer();
    const { data: userData } = await sb.auth.getUser();
    if (!userData?.user) {
      return Response.json({ error: 'unauthenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (body?.type !== 'enquiry' || !body?.enquiryId) {
      return Response.json({ error: 'invalid request' }, { status: 400 });
    }

    const admin = createAdmin();
    const { data: enq } = await admin
      .from('enquiries')
      .select('id, homeowner_id, professional_id, listing_id, homeowner_name, homeowner_phone, homeowner_email, project_type, budget, timeline, message')
      .eq('id', body.enquiryId)
      .single();
    if (!enq) {
      return Response.json({ error: 'enquiry not found' }, { status: 404 });
    }
    // Only the homeowner who created the enquiry can trigger its email.
    if (enq.homeowner_id !== userData.user.id) {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    const { data: listing } = await admin
      .from('listings').select('id, title, city').eq('id', enq.listing_id).single();
    const { data: professional } = await admin
      .from('profiles').select('email, full_name').eq('id', enq.professional_id).single();
    if (!professional?.email) {
      return Response.json({ error: 'professional has no email' }, { status: 400 });
    }

    const e = escapeHTML;
    const subject = `New Enquiry on Homeizz — ${enq.project_type || 'Project'}${listing?.city ? ' in ' + listing.city : ''}`;
    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#FAF6F0;border-radius:16px;">
  <h1 style="color:#C4622D;text-align:center;">Homeizz</h1>
  <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #E2CDB8;margin-bottom:16px;">
    <h2 style="color:#2C1508;margin:0 0 16px;">You have a new enquiry!</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#8C6444;width:140px;">From</td><td style="padding:8px 0;color:#2C1508;font-weight:600;">${e(enq.homeowner_name)}</td></tr>
      <tr><td style="padding:8px 0;color:#8C6444;">Phone</td><td style="padding:8px 0;color:#2C1508;font-weight:600;">${e(enq.homeowner_phone)}</td></tr>
      <tr><td style="padding:8px 0;color:#8C6444;">Project</td><td style="padding:8px 0;color:#2C1508;font-weight:600;">${e(enq.project_type) || 'Not specified'}</td></tr>
      <tr><td style="padding:8px 0;color:#8C6444;">Budget</td><td style="padding:8px 0;color:#2C1508;font-weight:600;">${e(enq.budget)}</td></tr>
      <tr><td style="padding:8px 0;color:#8C6444;">Timeline</td><td style="padding:8px 0;color:#2C1508;font-weight:600;">${e(enq.timeline) || 'Not specified'}</td></tr>
      <tr><td style="padding:8px 0;color:#8C6444;">Listing</td><td style="padding:8px 0;color:#2C1508;font-weight:600;">${e(listing?.title) || ''}</td></tr>
    </table>
    <div style="margin-top:16px;padding:16px;background:#FAF6F0;border-radius:8px;border-left:3px solid #C4622D;">
      <p style="color:#8C6444;margin:0 0 6px;font-weight:600;">Message:</p>
      <p style="color:#2C1508;margin:0;line-height:1.6;white-space:pre-wrap;">${e(enq.message)}</p>
    </div>
  </div>
  <div style="text-align:center;">
    <a href="https://www.homeizz.in/pro-dashboard" style="display:inline-block;padding:14px 28px;background:#C4622D;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">View in Dashboard</a>
  </div>
</div>`;

    const { data, error } = await getResend().emails.send({
      from: 'Homeizz <notifications@homeizz.in>',
      to: professional.email,
      subject,
      html,
    });
    if (error) {
      return Response.json({ error: error.message || 'send failed' }, { status: 502 });
    }
    return Response.json({ ok: true, id: data?.id });
  } catch (e) {
    console.error('[send-email]', e);
    return Response.json({ error: 'server error' }, { status: 500 });
  }
}
