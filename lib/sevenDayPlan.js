// Shared copy for the "Slay Your Giant in 7 Days" funnel (email + reference for the page).
export const DAYS = [
  { n: 1, title: 'AIM', text: 'Finish this sentence: “By Sunday, I will ______.” Give it a day and time.' },
  { n: 2, title: 'Identity', text: 'Name one quality you want to live by. Show it through one choice today.' },
  { n: 3, title: 'Name Your Giant', text: 'Recall the moment you stopped last time. What got in your way?' },
  { n: 4, title: 'Make Your Move', text: 'Set a ten-minute timer. Take the first step toward your aim.' },
  { n: 5, title: 'Change One Condition', text: 'Change one thing that got in the way. Try your step again.' },
  { n: 6, title: 'Scoreboard', text: 'Write two lines: “I said I would ______ / I actually did ______.”' },
  { n: 7, title: 'Record Your Victory', text: 'Write one win on your Victory Wall. Choose your next aim.' },
];

export const CHOICES = {
  free_plan: 'Free Plan',
  personal_coaching: 'Personal Coaching',
  group_workshop: 'Group Workshop',
};

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function planEmailHtml() {
  const rows = DAYS.map(
    (d) => `
    <tr><td style="padding:14px 0;border-top:1px solid #27272A;">
      <div style="font:700 11px Arial,sans-serif;letter-spacing:.15em;color:#F59E0B;text-transform:uppercase;">Day ${d.n} · ${esc(d.title)}</div>
      <div style="font:400 16px/1.5 Arial,sans-serif;color:#D4D4D8;margin-top:6px;">${esc(d.text)}</div>
    </td></tr>`
  ).join('');
  return `<!DOCTYPE html><html><body style="margin:0;background:#09090B;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090B;"><tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" style="max-width:560px;">
<tr><td style="font:700 20px Arial,sans-serif;color:#FFFFFF;padding-bottom:8px;">Your Free 7-Day Giant-Slayer Plan</td></tr>
<tr><td style="font:400 16px/1.6 Arial,sans-serif;color:#D4D4D8;padding-bottom:16px;">Give it ten minutes a day. Name what's in your way, take one step, and record a victory by the end of the week. Start Day 1 today.</td></tr>
${rows}
<tr><td style="padding-top:24px;font:400 16px/1.6 Arial,sans-serif;color:#D4D4D8;">— Dr. Ben C. Johnson III</td></tr>
</table></td></tr></table></body></html>`;
}
