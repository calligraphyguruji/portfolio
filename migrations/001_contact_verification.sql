BEGIN;
CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY,
  name text, email text, subject text, message text,
  email_key text NOT NULL,
  receipt_hash text NOT NULL UNIQUE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_verification_at timestamptz NOT NULL DEFAULT now(),
  turnstile_verified boolean NOT NULL CHECK (turnstile_verified),
  verified_at timestamptz,
  status text NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified','expired','pending','accepted','review')),
  delivery_payload jsonb,
  first_attempt_at timestamptz,
  lease_until timestamptz,
  provider_id text,
  accepted_at timestamptz
);
CREATE INDEX contact_pending_email ON contact_submissions(email_key) WHERE status = 'unverified';
CREATE INDEX contact_outbox ON contact_submissions(status, lease_until);
CREATE TABLE contact_rate_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_rate_window ON contact_rate_events(key, created_at);
-- No public/browser access. Run migration as the dedicated backend owner role.
REVOKE ALL ON contact_submissions, contact_rate_events FROM PUBLIC;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_rate_events ENABLE ROW LEVEL SECURITY;
-- The table owner is the server-only role; no policies grant access to other roles.
COMMIT;
