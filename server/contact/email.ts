import { randomUUID } from 'node:crypto';
import { ContactError, reportContactError } from './errors.ts';

export interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
}

export interface DirectContactInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  origin?: string;
}

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    c =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[c]!)
  );

export function getActiveEmailProvider(): 'resend' | 'emailjs' | 'none' {
  if (process.env.RESEND_API_KEY?.trim()) return 'resend';
  const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY;
  if (serviceId?.trim() && templateId?.trim() && publicKey?.trim()) return 'emailjs';
  return 'none';
}

export async function sendTransactionalEmail(payload: EmailPayload, key: string): Promise<string> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    throw new ContactError(503, 'configuration_error', 'We couldn’t send your message right now. Please try again shortly.', {
      stage: 'configuration',
      reason: 'missing_environment',
      fields: ['RESEND_API_KEY'],
    });
  }

  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ContactError(502, 'email_unavailable', 'We couldn’t send your message right now. Please try again shortly.', {
      stage: 'email',
      reason: 'request_failed',
    });
  }

  if (!response.ok) {
    throw new ContactError(502, 'email_unavailable', 'We couldn’t send your message right now. Please try again shortly.', {
      stage: 'email',
      reason:
        response.status === 401
          ? 'authentication_failed'
          : response.status === 403
            ? 'sender_or_permission_rejected'
            : response.status === 429
              ? 'provider_rate_limited'
              : response.status >= 500
                ? 'provider_unavailable'
                : 'payload_rejected',
      upstreamStatus: response.status,
    });
  }

  const result = (await response.json().catch(() => null)) as { id?: string } | null;
  if (!result || typeof result.id !== 'string' || !result.id) {
    throw new ContactError(502, 'email_unavailable', 'We couldn’t confirm email acceptance. Please try again shortly.', {
      stage: 'email',
      reason: 'invalid_acknowledgement',
      upstreamStatus: response.status,
    });
  }
  return result.id;
}

export async function sendDirectContactEmail(
  input: DirectContactInput,
  idempotencyKey: string = randomUUID()
): Promise<{ success: boolean; provider: string; id?: string }> {
  const provider = getActiveEmailProvider();

  if (provider === 'none') {
    throw new ContactError(503, 'configuration_error', 'We couldn’t send your message right now. Please try again shortly.', {
      stage: 'configuration',
      reason: 'missing_email_provider',
      fields: ['RESEND_API_KEY'],
    });
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject?.trim() || '';
  const message = input.message.trim();

  // Try Primary Provider: Resend
  if (provider === 'resend' || process.env.RESEND_API_KEY?.trim()) {
    const from = process.env.EMAIL_FROM?.trim() || 'Aman Mishra Portfolio <contact@calligraphyguruji.dev>';
    const to = [process.env.CONTACT_RECEIVER_EMAIL?.trim() || 'amanmishra7774@gmail.com'];
    const emailSubject = subject ? `Portfolio Inquiry: ${subject}` : `Portfolio Contact from ${name}`;

    const textContent = [
      'New Portfolio Contact Message',
      '----------------------------------------',
      `From:    ${name}`,
      `Email:   ${email}`,
      `Subject: ${subject || 'General Inquiry'}`,
      '----------------------------------------',
      'Message:',
      message,
      '----------------------------------------',
      `Reply-To: ${email}`,
    ].join('\n');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(emailSubject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f6f6; margin: 0; padding: 24px 12px; color: #171717;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e5e5; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="border-bottom: 2px solid #171717; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #171717;">New Portfolio Inquiry</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #737373;">Received via calligraphyguruji.dev</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 8px 0; font-weight: 600; width: 80px; font-size: 13px; color: #525252;">Name:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #171717;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600; width: 80px; font-size: 13px; color: #525252;">Email:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #171717;"><a href="mailto:${escapeHtml(email)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(email)}</a></td>
      </tr>
      ${subject ? `<tr>
        <td style="padding: 8px 0; font-weight: 600; width: 80px; font-size: 13px; color: #525252;">Subject:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #171717;">${escapeHtml(subject)}</td>
      </tr>` : ''}
    </table>
    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Message</h3>
      <div style="font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${escapeHtml(message)}</div>
    </div>
    <div style="font-size: 12px; color: #a1a1aa; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
      You can reply directly to this email to reach ${escapeHtml(name)}.
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      const id = await sendTransactionalEmail({
        from, to, reply_to: email, subject: emailSubject, text: textContent, html: htmlContent,
      }, idempotencyKey);
      return { success: true, provider: 'resend', id };
    } catch (error) {
      // Fall back only on a definite rejection. A timeout or ambiguous response
      // may already have sent mail; retry through Resend with the same key.
      const rejected = error instanceof ContactError &&
        [400, 401, 403, 422].includes(error.diagnostic?.upstreamStatus || 0);
      const fallback = process.env.EMAILJS_SERVICE_ID?.trim() &&
        process.env.EMAILJS_TEMPLATE_ID?.trim() && process.env.EMAILJS_PUBLIC_KEY?.trim();
      if (!rejected || !fallback) throw error;
      reportContactError(error, 'delivery', 'resend-fallback');
    }
  }

  // Fallback / Secondary Provider: EmailJS
  const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (serviceId?.trim() && templateId?.trim() && publicKey?.trim()) {
    const originHeader = input.origin || 'https://calligraphyguruji.dev';
    const emailJsBody = {
      service_id: serviceId.trim(),
      template_id: templateId.trim(),
      user_id: publicKey.trim(),
      accessToken: privateKey?.trim() || undefined,
      template_params: {
        from_name: name,
        from_email: email,
        reply_to: email,
        subject: subject || 'Portfolio Inquiry',
        message,
        to_name: 'Aman Mishra',
      },
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AmanMishra-Portfolio/1.0',
          Origin: originHeader,
        },
        body: JSON.stringify(emailJsBody),
      });

      const responseText = await response.text();
      if (response.ok && responseText.trim() === 'OK') {
        return { success: true, provider: 'emailjs' };
      }

      throw new ContactError(502, 'email_unavailable', 'We couldn’t send your message right now. Please try again shortly.', {
        stage: 'email',
        reason: 'emailjs_dispatch_failed',
        upstreamStatus: response.status,
      });
    } catch (err) {
      if (err instanceof ContactError) throw err;
      throw new ContactError(502, 'email_unavailable', 'We couldn’t send your message right now. Please try again shortly.', {
        stage: 'email',
        reason: 'emailjs_network_failed',
      });
    }
  }

  throw new ContactError(503, 'configuration_error', 'We couldn’t send your message right now. Please try again shortly.', {
    stage: 'configuration',
    reason: 'missing_email_provider',
    fields: ['RESEND_API_KEY'],
  });
}

export function verificationEmail(name: string, email: string, url: string): EmailPayload {
  const text = `Hello ${name},\n\nThank you for contacting me through my portfolio website.\n\nBefore your message can be delivered, please verify your email address by clicking the link below.\n\nVerify Email & Send Message: ${url}\n\nThis verification link will expire in 15 minutes.\n\nIf you did not submit this contact form, you can safely ignore this email.\n\nBest regards,\nAman Mishra\nhttps://calligraphyguruji.dev`;
  return {
    from: process.env.EMAIL_FROM || 'Aman Mishra Portfolio <contact@calligraphyguruji.dev>',
    to: [email],
    subject: 'Verify Your Email — Aman Mishra Portfolio',
    text,
    html: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f6f6f6;font-family:Arial,sans-serif;color:#171717"><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px"><tr><td style="padding:32px;line-height:1.7"><h2 style="margin-top:0">Verify your email</h2><p>Hello ${escapeHtml(name)},</p><p>Thank you for contacting me through my portfolio website.</p><p>Before your message can be delivered, please verify your email address by clicking the button below.</p><p style="margin:28px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#171717;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Verify Email &amp; Send Message</a></p><p>This verification link will expire in <strong>15 minutes</strong>.</p><p>If you did not submit this contact form, you can safely ignore this email.</p><p>Best regards,<br>Aman Mishra<br><a href="https://calligraphyguruji.dev">calligraphyguruji.dev</a></p><hr style="border:0;border-top:1px solid #eee"><p style="font-size:12px">Button not working? Copy this URL into your browser:</p><p style="font-size:12px;word-break:break-all"><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p></td></tr></table></td></tr></table></body></html>`,
  };
}

export function contactEmail(row: { name: string; email: string; subject: string; message: string }): EmailPayload {
  return {
    from: process.env.EMAIL_FROM || 'Aman Mishra Portfolio <contact@calligraphyguruji.dev>',
    to: [process.env.CONTACT_RECEIVER_EMAIL || 'amanmishra7774@gmail.com'],
    reply_to: row.email,
    subject: row.subject || 'Portfolio Contact Message',
    text: `Verified portfolio inquiry\nFrom: ${row.name} <${row.email}>\n\n${row.message}`,
    html: `<h2>Verified portfolio inquiry</h2><p>From: ${escapeHtml(row.name)} &lt;${escapeHtml(row.email)}&gt;</p><div style="white-space:pre-wrap">${escapeHtml(row.message)}</div>`,
  };
}
