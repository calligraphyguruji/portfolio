# Mantri Security Specifications

## 1. Zero Secret Ingestion & Secret Redaction
- The persistent conversation memory automatically strips potential API keys and bearer tokens (`bearer ...`, `ghp_...`, `AIza...`) using automated redaction before writing to SQLite.
- `.env` files, `.agents/`, and credentials are strictly excluded from git tracking.

## 2. Anti-Jailbreak & Prompt Injection Guard
Incoming user queries are screened through regex filters before reaching any LLM or retrieval step:
- Intercepts directives attempting to override instructions ("ignore all previous instructions", "system prompt", "DAN mode", "bypass rules").
- Blocks shell execution strings (`sudo rm -rf`, `process.exit()`).
- Refuses to disclose backend internals or environment variables.

## 3. Sandboxed Tool Execution
- The `calculate` tool uses a strict whitelist of characters (`[0-9\s\+\-\*\/\(\)\.\^\%]`) and executes in an isolated Function scope without global `eval()`.
- Administrative tools (`system_diagnostics`) are explicitly gated behind administrative privileges.

## 4. Protected Administrative Endpoints
- `POST /api/knowledge/ingest` and `POST /api/knowledge/reindex` require an `Authorization: Bearer <ADMIN_API_KEY>` header.
- If `ADMIN_API_KEY` is unset or blank in environment variables, write access to the knowledge base is permanently blocked by default.

## 5. Rate Limiting & Denial-of-Service Defense
- Sliding-window rate limiter limits requests to 30 queries per IP per 5-minute interval.
- Max payload size enforced at 1 MB; excessive requests are terminated immediately with HTTP 413.
