import { Resend } from 'resend';
import { CHOICES, esc, planEmailHtml } from './sevenDayPlan.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function sevenDaysHandler(req, res) {
  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const choice = typeof body.choice === 'string' ? body.choice : 'free_plan';
  const source = typeof body.source === 'string' ? body.source.trim().slice(0, 200) : '';

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!Object.prototype.hasOwnProperty.call(CHOICES, choice)) {
    return res.status(400).json({ error: 'Invalid choice.' });
  }

  const timestamp = new Date().toISOString();
  const wantsContact = choice !== 'free_plan';
  const apiKey = process.env.RESEND_API_KEY;

  // Action C: log the lead first so it is never lost, even if email fails.
  console.log('[7DAY_LEAD]', JSON.stringify({ timestamp, email, choice, source }));
  if (process.env.LEAD_WEBHOOK_URL) {
    try {
      await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp, email, choice, source }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.error('[7DAY_WEBHOOK_ERROR]', err.message);
    }
  }

  if (!apiKey) {
    console.error('[7DAY_ERROR] RESEND_API_KEY is not set; no emails sent.');
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const resend = new Resend(apiKey);
  try {
    // Action A: plan to subscriber.
    const planResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Dr. Ben C. Johnson III <coachben@slaygiant.com>',
      to: email,
      subject: 'Your Free 7-Day Giant-Slayer Plan',
      html: planEmailHtml(),
    });
    if (planResult?.error) throw new Error(planResult.error.message || 'Resend error');

    // Action B: alert Dr. Ben for coaching / workshop requests.
    if (wantsContact && process.env.DR_BEN_EMAIL) {
      const label = CHOICES[choice];
      const alertResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'SlayGiant Portal <alerts@slaygiant.com>',
        to: process.env.DR_BEN_EMAIL,
        replyTo: email,
        subject: `[New Lead] ${label} — ${email}`,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p><strong>Inquiry type:</strong> ${esc(label)}</p>
          <p><strong>Referring platform:</strong> ${esc(source || 'Direct')}</p>
          <p><strong>Time:</strong> ${esc(timestamp)}</p></div>`,
      });
      if (alertResult?.error) console.error('[7DAY_ALERT_ERROR]', alertResult.error.message);
    } else if (wantsContact) {
      console.error('[7DAY_ERROR] DR_BEN_EMAIL is not set; alert not sent.');
    }
  } catch (err) {
    console.error('[7DAY_ERROR]', err.message);
    return res.status(500).json({ error: 'Could not send your plan. Please try again.' });
  }

  return res.json({ ok: true });
}
