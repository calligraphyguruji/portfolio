import pg from 'pg';

// Run against environment variables pulled from the target deployment. Print names/status only.
console.log('=== Portfolio Contact Form Configuration Check ===');

const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
const hasEmailJs = Boolean(
  (process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID)?.trim() &&
    (process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID)?.trim() &&
    (process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY)?.trim()
);

console.log(`RESEND_API_KEY: ${hasResend ? 'present' : 'MISSING'}`);
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM ? 'present (' + process.env.EMAIL_FROM + ')' : 'unset (defaults to Aman Mishra Portfolio <contact@calligraphyguruji.dev>)'}`);
console.log(`CONTACT_RECEIVER_EMAIL: ${process.env.CONTACT_RECEIVER_EMAIL ? 'present' : 'unset (defaults to amanmishra7774@gmail.com)'}`);
console.log(`EMAILJS_SERVICE: ${hasEmailJs ? 'configured (fallback available)' : 'not configured'}`);

const hasProvider = hasResend || hasEmailJs;
console.log(`Active Email Provider: ${hasResend ? 'Resend' : hasEmailJs ? 'EmailJS' : 'NONE'}`);

const hasTurnstileSecret = Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
const hasTurnstileSiteKey = Boolean(process.env.VITE_TURNSTILE_SITE_KEY?.trim());
console.log(`TURNSTILE_SECRET_KEY: ${hasTurnstileSecret ? 'present' : 'MISSING'}`);
console.log(`VITE_TURNSTILE_SITE_KEY: ${hasTurnstileSiteKey ? 'present' : 'MISSING'}`);

let valid = hasProvider && hasTurnstileSecret;

try {
  const site = new URL(process.env.CONTACT_SITE_URL || 'https://calligraphyguruji.dev');
  if (site.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(site.hostname)) throw new Error();
  console.log('CONTACT_SITE_URL: valid');
} catch {
  console.log('CONTACT_SITE_URL: INVALID');
  valid = false;
}

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL: present (optional persistence)');
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    statement_timeout: 10000,
  });
  try {
    await client.connect();
    const result = await client.query(`SELECT c.relname
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('contact_submissions','contact_rate_events') AND c.relkind='r'`);
    for (const table of ['contact_submissions', 'contact_rate_events']) {
      const row = result.rows.find(item => item.relname === table);
      console.log(`${table}: ${row ? 'ready' : 'not found in database'}`);
    }
  } catch {
    console.log('PostgreSQL: connection check failed (in-memory rate limiter active as fallback)');
  } finally {
    await client.end();
  }
} else {
  console.log('DATABASE_URL: unset (using robust in-memory sliding-window rate limiting & deduplication)');
}

console.log(`\nOverall Status: ${valid ? 'READY FOR PRODUCTION' : 'CONFIGURATION INCOMPLETE'}`);
process.exitCode = valid ? 0 : 1;
