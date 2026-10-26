import { ContactError } from './errors.ts';

export interface EmailPayload {
  from: string; to: string[]; subject: string; html: string; text: string; reply_to?: string;
}
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]!));

export async function sendTransactionalEmail(payload: EmailPayload, key: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ContactError(502, 'email_unavailable', 'We couldn’t send your verification email right now. Please try again shortly.', {
      stage: 'email', reason: 'request_failed',
    });
  }
  // Status codes identify configuration/availability failures without logging a provider body.
  if (!response.ok) throw new ContactError(502, 'email_unavailable', 'We couldn’t send your verification email right now. Please try again shortly.', {
    stage: 'email', reason: response.status === 401 ? 'authentication_failed' : response.status === 403 ? 'sender_or_permission_rejected' : response.status === 429 ? 'provider_rate_limited' : response.status >= 500 ? 'provider_unavailable' : 'payload_rejected',
    upstreamStatus: response.status,
  });
  const result = await response.json().catch(() => null) as { id?: string } | null;
  if (!result || typeof result.id !== 'string' || !result.id) throw new ContactError(502, 'email_unavailable', 'We couldn’t confirm email acceptance. Please try again shortly.', {
    stage: 'email', reason: 'invalid_acknowledgement', upstreamStatus: response.status,
  });
  return result.id;
}

export function verificationEmail(name: string, email: string, url: string): EmailPayload {
  const text = `Hello ${name},\n\nThank you for contacting me through my portfolio website.\n\nBefore your message can be delivered, please verify your email address by clicking the link below.\n\nVerify Email & Send Message: ${url}\n\nThis verification link will expire in 15 minutes.\n\nIf you did not submit this contact form, you can safely ignore this email.\n\nBest regards,\nAman Mishra\nhttps://calligraphyguruji.dev`;
  return {
    from: process.env.EMAIL_FROM!, to: [email], subject: 'Verify Your Email — Aman Mishra Portfolio', text,
    html: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f6f6f6;font-family:Arial,sans-serif;color:#171717"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px"><tr><td style="padding:32px;line-height:1.7"><h2 style="margin-top:0">Verify your email</h2><p>Hello ${escapeHtml(name)},</p><p>Thank you for contacting me through my portfolio website.</p><p>Before your message can be delivered, please verify your email address by clicking the button below.</p><p style="margin:28px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#171717;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Verify Email &amp; Send Message</a></p><p>This verification link will expire in <strong>15 minutes</strong>.</p><p>If you did not submit this contact form, you can safely ignore this email.</p><p>Best regards,<br>Aman Mishra<br><a href="https://calligraphyguruji.dev">calligraphyguruji.dev</a></p><hr style="border:0;border-top:1px solid #eee"><p style="font-size:12px">Button not working? Copy this URL into your browser:</p><p style="font-size:12px;word-break:break-all"><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p></td></tr></table></td></tr></table></body></html>`,
  };
}

export function contactEmail(row: { name: string; email: string; subject: string; message: string }): EmailPayload {
  return {
    from: process.env.EMAIL_FROM!,
    to: [process.env.CONTACT_RECEIVER_EMAIL || 'amanmishra7774@gmail.com'],
    reply_to: row.email,
    subject: row.subject || 'Portfolio Contact Message',
    text: `Verified portfolio inquiry\nFrom: ${row.name} <${row.email}>\n\n${row.message}`,
    html: `<h2>Verified portfolio inquiry</h2><p>From: ${escapeHtml(row.name)} &lt;${escapeHtml(row.email)}&gt;</p><div style="white-space:pre-wrap">${escapeHtml(row.message)}</div>`,
  };
}
