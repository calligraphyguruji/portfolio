import pg from 'pg';
import type { PoolClient } from 'pg';

let pool: pg.Pool | undefined;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error('Contact database unavailable');
  if (pool) return pool;
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000,
    statement_timeout: 10000,
  });
  pool.on('error', () => { console.error('Contact database connection unavailable.'); });
  return pool;
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await database().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function cleanup() {
  // Preserve only hash tombstones for expired/used-link feedback. Remove message content promptly.
  await database().query(`UPDATE contact_submissions SET status='expired', name=NULL, email=NULL,
    subject=NULL, message=NULL WHERE status='unverified' AND expires_at <= now()`);
  await database().query(`UPDATE contact_submissions SET status='review', name=NULL, email=NULL,
    subject=NULL, message=NULL, delivery_payload=NULL
    WHERE status='pending' AND first_attempt_at < now() - interval '20 hours'`);
  await database().query(`DELETE FROM contact_submissions WHERE created_at < now() - interval '2 days'`);
  await database().query(`DELETE FROM contact_rate_events WHERE created_at < now() - interval '1 hour'`);
}
