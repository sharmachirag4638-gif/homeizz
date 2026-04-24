import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Homeizz <notifications@homeizz.in>',
      to,
      subject,
      html,
    });

    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    return Response.json({ success: true, data });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}