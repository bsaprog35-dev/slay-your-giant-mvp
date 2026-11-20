import { CHOICES } from './sevenDayPlan.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeSource(raw) {
  if (typeof raw !== 'string') return 'Direct';
  const s = raw.trim().toLowerCase();
  if (!s || s === 'direct') return 'Direct';

  if (s === 'ig' || s === 'instagram' || s.includes('instagram.com') || s.includes('instagr.am')) {
    return 'Instagram';
  }
  if (s === 'yt' || s === 'youtube' || s.includes('youtube.com') || s.includes('youtu.be')) {
    return 'YouTube';
  }
  if (s === 'tt' || s === 'tiktok' || s.includes('tiktok.com')) {
    return 'TikTok';
  }
  if (s === 'li' || s === 'linkedin' || s.includes('linkedin.com') || s.includes('lnkd.in')) {
    return 'LinkedIn';
  }
  if (s === 'fb' || s === 'facebook' || s.includes('facebook.com') || s.includes('fb.com')) {
    return 'Facebook';
  }

  return 'Direct';
}

export default async function sevenDaysHandler(req, res) {
  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const choice = typeof body.choice === 'string' ? body.choice : 'free_plan';
  const source = normalizeSource(body.source);

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!Object.prototype.hasOwnProperty.call(CHOICES, choice)) {
    return res.status(400).json({ error: 'Invalid choice.' });
  }

  const timestamp = new Date().toISOString();
  const payload = { email, choice, source, timestamp };

  // Structured lead log for Vercel Runtime Logs.
  console.log('[7DAY_LEAD]', JSON.stringify(payload));

  // Optional webhook forwarding (e.g., Google Apps Script Web App URL).
  // Errors are safely caught so the visitor always unlocks their plan immediately.
  if (process.env.LEAD_WEBHOOK_URL) {
    try {
      const webhookRes = await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      if (!webhookRes.ok) {
        console.error('[7DAY_WEBHOOK_ERROR]', `HTTP ${webhookRes.status}`);
      }
    } catch (err) {
      console.error('[7DAY_WEBHOOK_ERROR]', err.message);
    }
  }

  return res.status(200).json({ ok: true, source });
}
