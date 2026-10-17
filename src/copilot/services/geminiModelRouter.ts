import type { RetrievalResult, NLPAnalysis } from '../types.ts';
import { GeminiProvider, type AIProvider } from './llmProvider.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';

export interface ModelStats {
  modelId: string;
  successCount: number;
  failureCount: number;
  lastSuccessTimestamp?: number;
  lastFailureTimestamp?: number;
  lastLatencyMs?: number;
  cooldownUntil?: number;
  lastErrorType?: string;
}

export type ErrorClassification =
  | 'AUTH_ERROR'         // 401, invalid key -> Non-retryable
  | 'QUOTA_ERROR'        // 429 quota exhausted -> Failover to next model
  | 'RATE_LIMIT'         // 429 transient rate limit -> Failover
  | 'SERVER_ERROR'       // 500, 502, 503, 504 -> Transient, retry with backoff / failover
  | 'TIMEOUT'            // AbortError, timeout -> Failover
  | 'MODEL_NOT_FOUND'    // 404, invalid model -> Skip model, mark cooldown
  | 'SAFETY_BLOCKED'     // Safety block -> Non-retryable (do not bypass)
  | 'MALFORMED_OUTPUT'   // Empty / unparseable -> Failover
  | 'UNKNOWN_ERROR';

export interface FailoverEvent {
  event: 'gemini_model_failover' | 'gemini_model_success' | 'gemini_all_models_failed';
  requestedModel: string;
  failedModel?: string;
  nextModel?: string;
  activeModel?: string;
  reason?: string;
  attempt: number;
  latencyMs?: number;
  timestamp: string;
}

/**
 * Classifies an incoming Gemini error into a standardized routing category.
 */
export function classifyGeminiError(err: any): ErrorClassification {
  const msg = String(err?.message || err);

  if (
    msg.includes('GEMINI_AUTH_ERROR') ||
    msg.includes('401') ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('PERMISSION_DENIED')
  ) {
    return 'AUTH_ERROR';
  }

  if (msg.includes('SAFETY') || msg.includes('SAFETY_BLOCKED') || msg.includes('BLOCKED')) {
    return 'SAFETY_BLOCKED';
  }

  if (
    msg.includes('404') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('is not found') ||
    msg.includes('GEMINI_MODEL_ERROR')
  ) {
    return 'MODEL_NOT_FOUND';
  }

  if (
    msg.includes('GEMINI_QUOTA_ERROR') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('429') ||
    msg.includes('quota')
  ) {
    return 'QUOTA_ERROR';
  }

  if (msg.includes('GEMINI_TIMEOUT') || msg.includes('AbortError') || msg.includes('timeout')) {
    return 'TIMEOUT';
  }

  if (
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('Service Unavailable') ||
    msg.includes('Bad Gateway') ||
    msg.includes('Internal Server Error')
  ) {
    return 'SERVER_ERROR';
  }

  if (msg.includes('MALFORMED') || msg.includes('empty response')) {
    return 'MALFORMED_OUTPUT';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * GeminiModelRouter
 * Manages model list selection, per-model health tracking, error classification,
 * cooldown timers, and automated failover across Google Gemini models.
 */
export class GeminiModelRouter implements AIProvider {
  public readonly name = 'gemini-router';
  private apiKey: string;
  private primaryModel: string;
  private fallbackModels: string[];
  private maxAttempts: number;
  private cooldownSeconds: number;
  private requestTimeoutMs: number;

  // In-memory model stats & circuit breaker state
  private stats: Map<string, ModelStats> = new Map();

  // Reusable GeminiProvider instances per model
  private providers: Map<string, GeminiProvider> = new Map();

  constructor(options?: {
    apiKey?: string;
    primaryModel?: string;
    fallbackModels?: string[];
    maxAttempts?: number;
    cooldownSeconds?: number;
    requestTimeoutMs?: number;
  }) {
    this.apiKey = options?.apiKey || AI_CONFIG.geminiApiKey;
    this.primaryModel = options?.primaryModel || AI_CONFIG.geminiPrimaryModel;
    this.fallbackModels = options?.fallbackModels || AI_CONFIG.geminiFallbackModels;
    this.maxAttempts = options?.maxAttempts || AI_CONFIG.geminiMaxAttempts;
    this.cooldownSeconds = options?.cooldownSeconds || AI_CONFIG.geminiCooldownSeconds;
    this.requestTimeoutMs = options?.requestTimeoutMs || AI_CONFIG.requestTimeoutMs;

    this.initProviders();
  }

  private initProviders(): void {
    const allModels = [this.primaryModel, ...this.fallbackModels];
    for (const model of allModels) {
      if (!this.stats.has(model)) {
        this.stats.set(model, {
          modelId: model,
          successCount: 0,
          failureCount: 0,
        });
      }
      if (!this.providers.has(model)) {
        this.providers.set(
          model,
          new GeminiProvider(this.apiKey, model, this.requestTimeoutMs)
        );
      }
    }
  }

  public isConfigured(): boolean {
    const primary = this.providers.get(this.primaryModel);
    return primary ? primary.isConfigured() : false;
  }

  public getPrimaryModel(): string {
    return this.primaryModel;
  }

  public getPrimaryProvider(): GeminiProvider | undefined {
    return this.providers.get(this.primaryModel);
  }

  public setProvider(modelId: string, provider: GeminiProvider): void {
    this.providers.set(modelId, provider);
    if (!this.stats.has(modelId)) {
      this.stats.set(modelId, {
        modelId,
        successCount: 0,
        failureCount: 0,
      });
    }
  }

  public getAllConfiguredModels(): string[] {
    return [this.primaryModel, ...this.fallbackModels];
  }

  public getModelStats(modelId: string): ModelStats | undefined {
    return this.stats.get(modelId);
  }

  public getAllStats(): Record<string, ModelStats> {
    const res: Record<string, ModelStats> = {};
    for (const [key, val] of this.stats.entries()) {
      res[key] = { ...val };
    }
    return res;
  }

  /**
   * Resets all circuit-breaker cooldowns (useful for tests or admin diagnostics).
   */
  public resetHealth(): void {
    for (const stats of this.stats.values()) {
      stats.cooldownUntil = undefined;
      stats.failureCount = 0;
    }
  }

  /**
   * Helper to inspect model eligibility under the circuit breaker.
   */
  public isModelEligible(modelId: string, now: number = Date.now()): boolean {
    const s = this.stats.get(modelId);
    if (!s) return true;
    if (s.cooldownUntil && s.cooldownUntil > now) {
      return false; // Still in cooldown window
    }
    return true;
  }

  /**
   * Returns ordered list of models: eligible primary first, then eligible fallbacks,
   * then cooldown-expired fallbacks.
   */
  public getCandidateModels(): string[] {
    const now = Date.now();
    const all = [this.primaryModel, ...this.fallbackModels];
    const eligible: string[] = [];
    const inCooldown: string[] = [];

    for (const m of all) {
      if (this.isModelEligible(m, now)) {
        eligible.push(m);
      } else {
        inCooldown.push(m);
      }
    }

    // If all models are currently in cooldown, release cooldown to avoid hard deadlock
    if (eligible.length === 0) {
      return all;
    }

    return [...eligible, ...inCooldown];
  }

  private recordSuccess(modelId: string, latencyMs: number): void {
    const s = this.stats.get(modelId) || {
      modelId,
      successCount: 0,
      failureCount: 0,
    };
    s.successCount += 1;
    s.lastSuccessTimestamp = Date.now();
    s.lastLatencyMs = latencyMs;
    s.cooldownUntil = undefined; // clear cooldown upon success
    this.stats.set(modelId, s);
  }

  private recordFailure(modelId: string, errorType: ErrorClassification): void {
    const s = this.stats.get(modelId) || {
      modelId,
      successCount: 0,
      failureCount: 0,
    };
    s.failureCount += 1;
    s.lastFailureTimestamp = Date.now();
    s.lastErrorType = errorType;

    // Apply temporary cooldown for recoverable model errors
    if (
      errorType === 'QUOTA_ERROR' ||
      errorType === 'SERVER_ERROR' ||
      errorType === 'TIMEOUT' ||
      errorType === 'MODEL_NOT_FOUND'
    ) {
      s.cooldownUntil = Date.now() + this.cooldownSeconds * 1000;
    }

    this.stats.set(modelId, s);
  }

  private logEvent(event: FailoverEvent): void {
    // Structured, safe server-side logging without secrets or private prompts
    console.warn(`[GeminiModelRouter] ${JSON.stringify(event)}`);
  }

  /**
   * Generates response with automatic multi-model failover.
   */
  public async generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    const result = await this.generateResponseWithTelemetry(
      query,
      retrievedResults,
      analysis,
      history
    );
    return result.answer;
  }

  /**
   * Generates response and returns rich routing telemetry (usedModel, attempts, failoverOccurred, etc.).
   */
  public async generateResponseWithTelemetry(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): Promise<{
    answer: string;
    modelUsed: string;
    attempts: number;
    failoverOccurred: boolean;
    failoverReason?: string;
  }> {
    const candidateModels = this.getCandidateModels();
    const maxAttempts = Math.min(this.maxAttempts, candidateModels.length);

    let lastError: any = null;
    let failoverReason: string | undefined = undefined;
    let failoverOccurred = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const modelId = candidateModels[attempt - 1];
      let provider = this.providers.get(modelId);
      if (!provider) {
        provider = new GeminiProvider(this.apiKey, modelId, this.requestTimeoutMs);
        this.providers.set(modelId, provider);
      }

      const startTs = Date.now();
      try {
        const text = await provider.generateResponse(
          query,
          retrievedResults,
          analysis,
          history
        );

        const latencyMs = Date.now() - startTs;
        this.recordSuccess(modelId, latencyMs);

        if (attempt > 1) {
          failoverOccurred = true;
          this.logEvent({
            event: 'gemini_model_success',
            requestedModel: this.primaryModel,
            activeModel: modelId,
            attempt,
            latencyMs,
            reason: failoverReason,
            timestamp: new Date().toISOString(),
          });
        }

        return {
          answer: text,
          modelUsed: modelId,
          attempts: attempt,
          failoverOccurred,
          failoverReason,
        };
      } catch (err: any) {
        const latencyMs = Date.now() - startTs;
        lastError = err;
        const errorClass = classifyGeminiError(err);
        this.recordFailure(modelId, errorClass);

        // A. AUTH_ERROR: Shared credentials failure. Do not retry other models.
        if (errorClass === 'AUTH_ERROR') {
          this.logEvent({
            event: 'gemini_model_failover',
            requestedModel: this.primaryModel,
            failedModel: modelId,
            reason: 'AUTH_ERROR_NON_RETRYABLE',
            attempt,
            latencyMs,
            timestamp: new Date().toISOString(),
          });
          throw err;
        }

        // B. SAFETY_BLOCKED: Safety block must not be bypassed by cycling models.
        if (errorClass === 'SAFETY_BLOCKED') {
          this.logEvent({
            event: 'gemini_model_failover',
            requestedModel: this.primaryModel,
            failedModel: modelId,
            reason: 'SAFETY_BLOCKED_NON_RETRYABLE',
            attempt,
            latencyMs,
            timestamp: new Date().toISOString(),
          });
          throw err;
        }

        // C. Recoverable failures: QUOTA_ERROR, SERVER_ERROR, TIMEOUT, MODEL_NOT_FOUND, MALFORMED_OUTPUT
        failoverReason = `${errorClass}: ${err?.message || 'Failure'}`;
        const nextModel = attempt < maxAttempts ? candidateModels[attempt] : undefined;

        this.logEvent({
          event: 'gemini_model_failover',
          requestedModel: this.primaryModel,
          failedModel: modelId,
          nextModel,
          reason: errorClass,
          attempt,
          latencyMs,
          timestamp: new Date().toISOString(),
        });

        // Bounded jitter delay between transient retries (50ms - 150ms)
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
        }
      }
    }

    this.logEvent({
      event: 'gemini_all_models_failed',
      requestedModel: this.primaryModel,
      reason: failoverReason,
      attempt: maxAttempts,
      timestamp: new Date().toISOString(),
    });

    throw new Error(
      `GEMINI_ALL_MODELS_FAILED: Exhausted all ${maxAttempts} configured Gemini models. Last error: ${lastError?.message || 'Service Unavailable'}`
    );
  }
}
