export type ArchitectureViewMode = 'topology' | 'sequence' | 'lifecycle';

export interface ComponentNodeDetail {
  id: string;
  name: string;
  role: string;
  tech: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  dataOwned: string;
  securityControls: string[];
  sourceFiles: { file: string; lines?: string; desc: string }[];
  notes: string;
  status: 'IMPLEMENTED' | 'PARTIALLY IMPLEMENTED' | 'DOCUMENTED' | 'PROPOSED' | 'NOT VERIFIED';
}

export interface EdgeDetail {
  id: string;
  source: string;
  target: string;
  protocol: string;
  payload: string;
  direction: 'unidirectional' | 'bidirectional';
  errorHandling: string;
  status: 'IMPLEMENTED' | 'PARTIALLY IMPLEMENTED' | 'DOCUMENTED' | 'PROPOSED';
}

export interface EngineeringDecision {
  title: string;
  decision: string;
  implementation: string;
  reason: string;
  tradeoff: string;
  evidence: string;
  status: 'IMPLEMENTED' | 'PARTIALLY IMPLEMENTED' | 'DOCUMENTED' | 'PROPOSED' | 'NOT VERIFIED';
}

export interface StateMachineNode {
  status: string;
  actor: string;
  preconditions: string;
  auditEvent: string;
  failureBehavior: string;
  allowedTargets: string[];
}

export const ARCHITECTURE_COMPONENTS: Record<string, ComponentNodeDetail> = {
  users: {
    id: 'users',
    name: 'Borrowers & Underwriting Staff',
    role: 'Actors submitting applications, managing document discrepancies, and performing credit reviews',
    tech: 'Browser / Mobile Client (HTTPS REST)',
    inputs: ['User credentials', 'Loan parameters (amount, tenor, purpose)', 'KYC document files'],
    outputs: ['HTTPS Requests with Bearer JWT tokens', 'Multipart form uploads'],
    dependencies: ['web-app', 'api-gateway'],
    dataOwned: 'Local session tokens, form draft state',
    securityControls: ['HTTPS/TLS', 'OAuth2 Bearer Tokens', 'Password Hashing (bcrypt)'],
    sourceFiles: [
      { file: 'backend/app/models/user.py', lines: '24-34', desc: 'UserRole enum definition (APPLICANT, LOAN_OFFICER, RISK_ANALYST, OPERATIONS, ADMIN)' }
    ],
    notes: 'Roles are strictly partitioned: applicants cannot review loans; officers cannot disburse funds.',
    status: 'IMPLEMENTED'
  },
  'web-app': {
    id: 'web-app',
    name: 'CredVidhi Frontend Client',
    role: 'Borrower portal & loan officer verification workbench with real-time loan simulator',
    tech: 'React 19, TypeScript, Vite, Tailwind CSS, Framer Motion',
    inputs: ['User input', 'REST JSON responses from FastAPI Gateway'],
    outputs: ['JSON payloads', 'File streams (PDF, PNG, JPEG up to 10MB)'],
    dependencies: ['api-gateway'],
    dataOwned: 'Client memory, transient UI filters, document preview buffers',
    securityControls: ['Client-side MIME validation', '10MB file size ceiling', 'Bearer token injection via Axios interceptors'],
    sourceFiles: [
      { file: 'frontend/src/App.tsx', lines: '1-80', desc: 'React 19 root application and router' },
      { file: 'frontend/src/pages/ApplicationPortal.tsx', desc: 'Borrower intake and multi-step loan submission form' }
    ],
    notes: 'Client-side validation guards UI feedback but never supersedes backend Pydantic validation.',
    status: 'IMPLEMENTED'
  },
  'api-gateway': {
    id: 'api-gateway',
    name: 'FastAPI REST Gateway',
    role: 'Asynchronous API routing, request validation, CORS management, and response envelopes',
    tech: 'Python 3.11, FastAPI, Pydantic v2, Starlette',
    inputs: ['HTTP requests from React client'],
    outputs: ['Normalized JSON envelopes ({status: "success" | "error", data, error})'],
    dependencies: ['auth-guard', 'workflow-fsm', 'underwriter', 'cache-queue', 'doc-storage', 'audit-ledger'],
    dataOwned: 'API routing contracts, request schemas, error response schemas',
    securityControls: ['CORS regex whitelist (credvidhi.vercel.app)', 'Exception normalization preventing stack leaks', 'Pydantic v2 strict type coercion'],
    sourceFiles: [
      { file: 'backend/app/main.py', lines: '35-96', desc: 'FastAPI app factory, CORS regex middleware, exception normalization envelopes' },
      { file: 'backend/app/api/v1/applications.py', lines: '40-270', desc: 'Application draft, update, submit, and retrieval route handlers' }
    ],
    notes: 'Catches StarletteHTTPException and RequestValidationError into unified error responses.',
    status: 'IMPLEMENTED'
  },
  'auth-guard': {
    id: 'auth-guard',
    name: 'RBAC & Token Security Guard',
    role: 'Validates Bearer JWT signatures, checks token type, and inspects Redis revocation blacklist',
    tech: 'python-jose, FastAPI Depends(get_current_user)',
    inputs: ['Authorization: Bearer <token> header'],
    outputs: ['Authenticated User model or 401/403 HTTP exception'],
    dependencies: ['cache-queue', 'audit-ledger'],
    dataOwned: 'JWT secret signatures, RBAC role permissions',
    securityControls: ['HMAC-SHA256 signature verification', 'Token expiration (exp) check', 'JTI blacklist query against Redis', 'Subject UUID existence validation'],
    sourceFiles: [
      { file: 'backend/app/dependencies.py', lines: '16-80', desc: 'get_current_user dependency decoding JWT and inspecting revocation cache' },
      { file: 'backend/app/core/security.py', lines: '20-70', desc: 'Password hashing and JWT generation/decoding functions' }
    ],
    notes: 'If Redis is unavailable, token revocation automatically falls back to an in-memory dictionary.',
    status: 'IMPLEMENTED'
  },
  'workflow-fsm': {
    id: 'workflow-fsm',
    name: 'Deterministic FSM Lifecycle Engine',
    role: 'Governs loan application status changes across an authorized directed state graph',
    tech: 'Python, SQLAlchemy AsyncSession, ACID Transaction Envelopes',
    inputs: ['Current status', 'Target status', 'Actor role', 'Optional rejection reason string'],
    outputs: ['Mutated LoanApplication entity', 'Appended AuditLog record in same transaction'],
    dependencies: ['audit-ledger'],
    dataOwned: 'ALLOWED_TRANSITIONS graph, state invariants',
    securityControls: ['Role-based transition verification', 'Mandatory non-empty reason for REJECTED status', 'Zero backward transitions from terminal states'],
    sourceFiles: [
      { file: 'backend/app/services/fsm_service.py', lines: '35-156', desc: 'ALLOWED_TRANSITIONS matrix, validate_transition(), execute_transition()' },
      { file: 'backend/app/models/application.py', lines: '22-34', desc: 'ApplicationStatus enum (DRAFT, SUBMITTED, UNDER_REVIEW, DOCUMENTS_PENDING, DOCUMENTS_VERIFIED, RISK_ASSESSED, APPROVED, REJECTED, DISBURSED)' }
    ],
    notes: 'Raises IllegalStateTransitionError if an unauthorized role or forbidden edge is traversed.',
    status: 'IMPLEMENTED'
  },
  underwriter: {
    id: 'underwriter',
    name: 'Deterministic Risk Underwriter',
    role: 'Computes Debt-to-Income (DTI), debt obligations, and automated credit risk scores in ₹',
    tech: 'Python Decimal, Fixed-Point Arithmetic (quantize to 0.01)',
    inputs: ['Monthly income', 'Existing liabilities', 'Requested amount', 'Requested tenor'],
    outputs: ['DTI ratio', 'Credit score (300-900)', 'Risk grade (LOW, MEDIUM, HIGH)', 'Maximum approved limit'],
    dependencies: ['audit-ledger'],
    dataOwned: 'Risk scoring thresholds, loan product terms',
    securityControls: ['Zero floating-point IEEE 754 arithmetic (no float drift)', 'Deterministic rule evaluation'],
    sourceFiles: [
      { file: 'backend/app/services/financial_engine.py', lines: '10-90', desc: 'Fixed-point EMI and compound interest calculation engine' },
      { file: 'backend/app/services/risk_service.py', lines: '20-140', desc: 'DTI threshold evaluation and automated underwriting rubric' }
    ],
    notes: 'Financial calculations utilize Python Decimal exclusively to prevent floating-point rounding errors.',
    status: 'IMPLEMENTED'
  },
  'cache-queue': {
    id: 'cache-queue',
    name: 'Redis 7 Cache & Revocation Store',
    role: 'High-throughput token revocation blacklist, IP rate-limiting, and OTP recovery sessions',
    tech: 'Redis 7, redis-py async client, In-Memory fallback dictionaries',
    inputs: ['Token JTI strings', 'IP address keys', 'Registration recovery tokens'],
    outputs: ['Boolean existence checks', 'Rate-limit increment counters'],
    dependencies: [],
    dataOwned: 'revoked_token:{jti} with TTL, rate_limit:{ip} counters, reg_recovery:{token} data',
    securityControls: ['TTL-based automatic key eviction', 'Non-blocking in-memory degradation on connection drop'],
    sourceFiles: [
      { file: 'backend/app/core/redis.py', lines: '14-124', desc: 'revoke_token, is_token_revoked, check_rate_limit, store_recovery_session with in-memory fallbacks' },
      { file: 'backend/app/database.py', lines: '50-80', desc: 'get_redis_client() async singleton pool' }
    ],
    notes: 'Designed with dual resilience: if Redis encounters a network partition, in-memory structures prevent outage.',
    status: 'IMPLEMENTED'
  },
  'doc-storage': {
    id: 'doc-storage',
    name: 'KYC Document Store',
    role: 'Stores borrower identification documents (Aadhaar, PAN, Bank Statements, Salary Slips)',
    tech: 'Local filesystem / S3-compatible Blob Storage with UUID keys',
    inputs: ['Multipart file streams', 'Document metadata'],
    outputs: ['Obfuscated file paths / Presigned URIs'],
    dependencies: ['audit-ledger'],
    dataOwned: 'Encrypted document binaries, SHA-256 checksums',
    securityControls: ['MIME type enforcement (PDF, JPEG, PNG)', '10MB max file size check', 'UUID obfuscation preventing path traversal'],
    sourceFiles: [
      { file: 'backend/app/services/storage_service.py', lines: '1-120', desc: 'Document validation, SHA-256 hashing, storage abstraction' },
      { file: 'backend/app/models/document.py', lines: '1-60', desc: 'ApplicationDocument table mapping file keys and verification status' }
    ],
    notes: 'Document paths never expose borrower names; keys are generated as random UUID v4 strings.',
    status: 'IMPLEMENTED'
  },
  'audit-ledger': {
    id: 'audit-ledger',
    name: 'PostgreSQL 16 Core & Audit Ledger',
    role: 'Relational persistence for user accounts, loan applications, and append-only audit trail',
    tech: 'PostgreSQL 16, SQLAlchemy 2.0 Async, asyncpg',
    inputs: ['ACID transaction commits from FastAPI services'],
    outputs: ['Relational rows, JSON prior/subsequent status deltas'],
    dependencies: [],
    dataOwned: 'users, loan_products, loan_applications, audit_logs, risk_assessments, application_documents',
    securityControls: ['UUID primary keys', 'Foreign key constraints', 'Index coverage on reference numbers and statuses', 'ACID transaction envelopes'],
    sourceFiles: [
      { file: 'backend/app/models/audit_log.py', lines: '19-50', desc: 'AuditLog model with JSON prior_state, subsequent_state, metadata_snapshot' },
      { file: 'backend/app/services/audit_service.py', lines: '14-65', desc: 'record_audit_event() inserting append-only audit log in active session' },
      { file: 'backend/app/database.py', lines: '18-45', desc: 'AsyncEngine with NullPool / AsyncSession configuration' }
    ],
    notes: 'Audit log is append-only in application logic; cryptographic block-chaining or DB-level trigger immutability is planned.',
    status: 'PARTIALLY IMPLEMENTED'
  },
  'ai-advisor': {
    id: 'ai-advisor',
    name: 'Google Gemini Customer Advisor',
    role: 'Context-aware customer support answering loan eligibility questions and portal usage',
    tech: 'Google Gemini API (gemini-1.5-flash / OpenRouter / Groq fallback), httpx AsyncClient',
    inputs: ['User chat message', 'Recent 6 turns conversation history', 'Authenticated user role snippet'],
    outputs: ['Advisory text responses', 'Suggested follow-up questions'],
    dependencies: ['api-gateway'],
    dataOwned: 'CREDVIDHI_SYSTEM_PROMPT domain instructions',
    securityControls: ['Dual-layer domain firewall (is_clearly_off_topic)', 'Anti-abuse rejection for coding/homework/politics', 'Zero loan decision authority'],
    sourceFiles: [
      { file: 'backend/app/api/v1/chat.py', lines: '590-670', desc: 'chat_with_assistant endpoint with domain firewall pre-check' },
      { file: 'backend/app/services/llm_service.py', lines: '26-145', desc: 'LLMService wrapper supporting Gemini, Groq, OpenRouter with timeout' }
    ],
    notes: 'Strictly advisory: Gemini cannot approve, reject, modify loan amounts, or trigger FSM state transitions.',
    status: 'IMPLEMENTED'
  }
};

export const ENGINEERING_DECISIONS: EngineeringDecision[] = [
  {
    title: 'Dual-Layer Request Validation',
    decision: 'Validate request payloads on the React client for UX responsiveness and re-validate strictly in FastAPI using Pydantic v2 schemas.',
    implementation: 'Frontend checks MIME types, file size ceilings (<10MB), and positive integers; FastAPI routes validate via Pydantic schemas (ApplicationCreateRequest, ApplicationUpdateDraftRequest) and normalize 422 errors into standard JSON envelopes.',
    reason: 'Client-side checks eliminate wasted bandwidth and network roundtrips; backend Pydantic models guarantee zero invalid data enters the service layer or database.',
    tradeoff: 'Requires maintaining schema definitions in both TypeScript interfaces and Pydantic models.',
    evidence: 'backend/app/api/v1/applications.py (lines 60-95), backend/app/main.py (validation_exception_handler, lines 73-95).',
    status: 'IMPLEMENTED'
  },
  {
    title: 'Deterministic FSM & Role Barriers',
    decision: 'Enforce application lifecycle status transitions via a directed graph (ALLOWED_TRANSITIONS) guarded by caller RBAC roles.',
    implementation: 'fsm_service.py validates that current_status can transition to target_status and verifies actor_role is in the authorized role list before mutating the entity. If invalid, raises IllegalStateTransitionError and rolls back the database transaction.',
    reason: 'Prevents race conditions, malicious status tampering (e.g. an applicant approving their own loan), and invalid workflow sequences.',
    tradeoff: 'Every new workflow state or bypass requires explicit addition to the transition matrix and corresponding tests.',
    evidence: 'backend/app/services/fsm_service.py (lines 35-115), backend/tests/test_fsm_transitions.py.',
    status: 'IMPLEMENTED'
  },
  {
    title: 'Atomic Transaction Envelopes for Audit Trails',
    decision: 'Persist application status updates and append-only audit_logs records within the exact same database transaction envelope.',
    implementation: 'execute_transition() modifies application.status and calls record_audit_event() with prior_state and subsequent_state JSON deltas on the same SQLAlchemy AsyncSession before committing.',
    reason: 'Guarantees that a loan status change can never be committed without an accompanying audit record, and an audit record can never be written if the status update fails.',
    tradeoff: 'Slightly higher transaction write latency per state mutation due to dual table inserts.',
    evidence: 'backend/app/services/fsm_service.py (lines 118-156), backend/app/services/audit_service.py (lines 14-65).',
    status: 'IMPLEMENTED'
  },
  {
    title: 'Audit Ledger Immutability & Tamper Evident Proof',
    decision: 'Maintain an append-only audit trail in PostgreSQL storing comprehensive JSON deltas of all state transitions.',
    implementation: 'audit_logs table records event_type, entity_name, entity_id, actor_id, actor_role, ip_address, prior_state, and subsequent_state.',
    reason: 'Provides a complete regulatory audit trail for RBI / institutional NBFC compliance.',
    tradeoff: 'Append-only behavior is currently enforced at the application/ORM service layer. Hard database-level immutability (e.g. PostgreSQL REVOKE UPDATE/DELETE permissions or cryptographic hash-chaining) is not yet verified in the schema.',
    evidence: 'backend/app/models/audit_log.py (lines 19-50). Classification: PARTIALLY IMPLEMENTED (Application-level append-only, but not cryptographic hardware tamper-evident).',
    status: 'PARTIALLY IMPLEMENTED'
  },
  {
    title: 'Redis Token Revocation with In-Memory Fallback',
    decision: 'Store revoked JWT identifiers (JTI) in Redis with TTLs, but degrade to an in-memory dictionary if Redis is unreachable.',
    implementation: 'is_token_revoked() queries Redis key revoked_token:{jti}. If Redis connection throws an exception, logs a warning and checks _memory_revoked_tokens.',
    reason: 'Ensures immediate token revocation on logout while avoiding catastrophic API failure if the Redis cluster experiences a network glitch.',
    tradeoff: 'In-memory fallback is node-local; in a multi-instance autoscaled deployment, token revocation fallback would not synchronize across independent worker containers.',
    evidence: 'backend/app/core/redis.py (lines 14-48), backend/app/dependencies.py (lines 47-55).',
    status: 'IMPLEMENTED'
  },
  {
    title: 'Strict AI Advisory Isolation & Domain Firewall',
    decision: 'Isolate Google Gemini customer chat entirely from underwriting authority and enforce an anti-abuse domain firewall.',
    implementation: 'chat.py runs is_clearly_off_topic() heuristic check on inbound queries. If off-topic, returns OUT_OF_SCOPE_REPLY without calling Gemini. If valid, calls LLM with 800 token limit. The chat endpoint has zero access to loan mutation services.',
    reason: 'Prevents prompt injection attacks from manipulating loan credit decisions or wasting API quota on extraneous tasks.',
    tradeoff: 'AI cannot execute automated borrower actions (e.g. "submit my draft") directly from chat; borrower must use the structured UI.',
    evidence: 'backend/app/api/v1/chat.py (lines 590-670), backend/tests/test_chat_endpoint.py.',
    status: 'IMPLEMENTED'
  },
  {
    title: 'Fixed-Point Currency Arithmetic (INR ₹)',
    decision: 'Use Python Decimal exclusively for all financial computations (EMI, DTI, compound interest) quantized to 2 decimal places.',
    implementation: 'financial_engine.py and risk_service.py initialize all currency amounts and ratios using Decimal, explicitly avoiding float() type casting.',
    reason: 'IEEE 754 floating-point calculations cause precision drift (e.g. 0.1 + 0.2 = 0.30000000000000004), which is illegal in banking and audit compliance.',
    tradeoff: 'Slightly slower CPU operations compared to native hardware floating-point registers.',
    evidence: 'backend/app/services/financial_engine.py (lines 15-50), backend/tests/test_financial_math.py.',
    status: 'IMPLEMENTED'
  },
  {
    title: 'Submission Idempotency & Duplicate Protection',
    decision: 'Identify duplicate submission handling and idempotency guarantees.',
    implementation: 'When submit_application() is called, it verifies that the application is currently in DRAFT status. Once transitioned to SUBMITTED, any subsequent call is rejected with ILLEGAL_STATE_TRANSITION (400 Bad Request).',
    reason: 'Prevents double-submission of an existing loan application.',
    tradeoff: 'Does not currently implement an explicit HTTP Idempotency-Key header mechanism for atomic draft creation. A borrower rapidly double-clicking create could create two separate drafts with distinct UUIDs.',
    evidence: 'backend/app/api/v1/applications.py (lines 248-267). Classification: PARTIALLY IMPLEMENTED (Lifecycle state locks duplicate submits, but no HTTP Idempotency-Key header).',
    status: 'PARTIALLY IMPLEMENTED'
  }
];

export const STATE_MACHINE_DETAILS: Record<string, StateMachineNode> = {
  DRAFT: {
    status: 'DRAFT',
    actor: 'Applicant / Admin',
    preconditions: 'Borrower registers and initializes an intake form. Parameters must fit loan product constraints.',
    auditEvent: 'STATUS_TRANSITION_DRAFT',
    failureBehavior: '422 Unprocessable Entity if amount or tenor violates product range.',
    allowedTargets: ['SUBMITTED', 'REJECTED']
  },
  SUBMITTED: {
    status: 'SUBMITTED',
    actor: 'Applicant / Admin',
    preconditions: 'Application must be in DRAFT status and owned by caller. Formal reference number assigned.',
    auditEvent: 'STATUS_TRANSITION_SUBMITTED',
    failureBehavior: '400 Bad Request (ILLEGAL_STATE_TRANSITION) if already submitted.',
    allowedTargets: ['UNDER_REVIEW', 'REJECTED']
  },
  UNDER_REVIEW: {
    status: 'UNDER_REVIEW',
    actor: 'Loan Officer / Admin',
    preconditions: 'Application assigned to officer queue for initial verification.',
    auditEvent: 'STATUS_TRANSITION_UNDER_REVIEW',
    failureBehavior: '403 Forbidden if attempted by applicant.',
    allowedTargets: ['DOCUMENTS_PENDING', 'DOCUMENTS_VERIFIED', 'REJECTED']
  },
  DOCUMENTS_PENDING: {
    status: 'DOCUMENTS_PENDING',
    actor: 'Loan Officer / Admin',
    preconditions: 'Discrepancy identified in uploaded KYC documents; applicant notified to re-upload.',
    auditEvent: 'STATUS_TRANSITION_DOCUMENTS_PENDING',
    failureBehavior: 'Locks underwriting until documents are re-verified.',
    allowedTargets: ['UNDER_REVIEW', 'REJECTED']
  },
  DOCUMENTS_VERIFIED: {
    status: 'DOCUMENTS_VERIFIED',
    actor: 'Loan Officer / Admin',
    preconditions: 'All KYC identity proofs (Aadhaar, PAN, Bank Statements) validated.',
    auditEvent: 'STATUS_TRANSITION_DOCUMENTS_VERIFIED',
    failureBehavior: 'Cannot advance if mandatory document proofs are missing.',
    allowedTargets: ['RISK_ASSESSED', 'UNDER_REVIEW', 'REJECTED']
  },
  RISK_ASSESSED: {
    status: 'RISK_ASSESSED',
    actor: 'Risk Analyst / Admin',
    preconditions: 'Deterministic DTI and credit scoring algorithms executed.',
    auditEvent: 'STATUS_TRANSITION_RISK_ASSESSED',
    failureBehavior: 'Requires valid financial snapshot with non-zero income.',
    allowedTargets: ['APPROVED', 'REJECTED', 'DOCUMENTS_PENDING']
  },
  APPROVED: {
    status: 'APPROVED',
    actor: 'Risk Analyst / Admin',
    preconditions: 'DTI < 50%, credit grade acceptable, sanction letter generated.',
    auditEvent: 'STATUS_TRANSITION_APPROVED',
    failureBehavior: 'Cannot approve without completed risk assessment.',
    allowedTargets: ['DISBURSED', 'REJECTED']
  },
  REJECTED: {
    status: 'REJECTED',
    actor: 'Applicant / Loan Officer / Risk Analyst / Admin (role-dependent)',
    preconditions: 'A non-empty explanation reason string is mandatory.',
    auditEvent: 'STATUS_TRANSITION_REJECTED',
    failureBehavior: 'IllegalStateTransitionError if reason is empty or omitted. Terminal state: 0 outbound transitions.',
    allowedTargets: []
  },
  DISBURSED: {
    status: 'DISBURSED',
    actor: 'Operations / Admin',
    preconditions: 'Sanction letter signed, bank mandate registered, payment transfer dispatched.',
    auditEvent: 'STATUS_TRANSITION_DISBURSED',
    failureBehavior: 'Cannot disburse unless previously in APPROVED status. Terminal state: 0 outbound transitions.',
    allowedTargets: []
  }
};
