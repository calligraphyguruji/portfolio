import pg from 'pg';

// Run against environment variables pulled from the target deployment. Print names/status only.
const required = ['DATABASE_URL', 'RESEND_API_KEY', 'EMAIL_FROM', 'TURNSTILE_SECRET_KEY', 'CONTACT_RATE_LIMIT_SECRET', 'CRON_SECRET'];
let valid = true;
for (const name of required) {
  const present = Boolean(process.env[name]?.trim());
  console.log(`${name}: ${present ? 'present' : 'MISSING'}`);
  if (!present) valid = false;
}
if (process.env.CONTACT_RATE_LIMIT_SECRET && process.env.CONTACT_RATE_LIMIT_SECRET.length < 32) {
  console.log('CONTACT_RATE_LIMIT_SECRET: must contain at least 32 characters'); valid = false;
}
try {
  const site = new URL(process.env.CONTACT_SITE_URL || 'https://calligraphyguruji.dev');
  if (site.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(site.hostname)) throw new Error();
  console.log('CONTACT_SITE_URL: valid');
} catch { console.log('CONTACT_SITE_URL: INVALID'); valid = false; }
if (process.env.DATABASE_URL) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, statement_timeout: 10000 });
  try {
    await client.connect();
    const result = await client.query(`SELECT c.relname, c.relrowsecurity,
      pg_get_userbyid(c.relowner) = current_user AS backend_is_owner
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('contact_submissions','contact_rate_events') AND c.relkind='r'`);
    for (const table of ['contact_submissions', 'contact_rate_events']) {
      const row = result.rows.find(item => item.relname === table);
      const ready = row?.relrowsecurity && row?.backend_is_owner;
      console.log(`${table}: ${!row ? 'MISSING — apply migrations/001_contact_verification.sql' : ready ? 'ready (RLS enabled, backend owner)' : 'CHECK RLS / backend owner role'}`);
      if (!ready) valid = false;
    }
  } catch { console.log('PostgreSQL: connection or schema check failed (check connection, TLS and role)'); valid = false; }
  finally { await client.end(); }
}
console.log('Sender domain verification must also be confirmed in Resend; this command does not send email.');
process.exitCode = valid ? 0 : 1;
