export interface ContactDiagnostic {
  stage: 'configuration' | 'database' | 'turnstile' | 'email' | 'handler';
  reason: string;
  fields?: string[];
  upstreamStatus?: number;
}

export class ContactError extends Error {
  status: number;
  code: string;
  diagnostic?: ContactDiagnostic;
  constructor(status: number, code: string, message: string, diagnostic?: ContactDiagnostic) {
    super(message);
    this.status = status;
    this.code = code;
    this.diagnostic = diagnostic;
  }
}

export function diagnoseContactError(error: unknown): ContactDiagnostic {
  if (error instanceof ContactError && error.diagnostic) return error.diagnostic;
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  const databaseErrors: Record<string, string> = {
    '42P01': 'schema_missing', '42501': 'permission_denied', '28P01': 'authentication_failed',
    '3D000': 'database_missing', ENOTFOUND: 'dns_failed', ECONNREFUSED: 'connection_refused',
    ECONNRESET: 'connection_reset', ETIMEDOUT: 'connection_timeout',
    SELF_SIGNED_CERT_IN_CHAIN: 'tls_failed', DEPTH_ZERO_SELF_SIGNED_CERT: 'tls_failed',
  };
  if (typeof code === 'string' && databaseErrors[code]) return { stage: 'database', reason: databaseErrors[code] };
  return { stage: 'handler', reason: 'unexpected_failure' };
}

export function reportContactError(error: unknown, action: string, requestId: string) {
  const knownActions = ['submit', 'send', 'request-verification', 'resend-verification', 'verify', 'maintenance', 'delivery'];
  // Only our own diagnostic fields are logged. Never log raw exceptions, payloads or provider bodies.
  console.error('[contact]', JSON.stringify({
    requestId, action: knownActions.includes(action) ? action : 'unknown', ...diagnoseContactError(error),
  }));
}
