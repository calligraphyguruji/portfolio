import type { DiscoveredModel } from './modelDiscovery.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';

export type ErrorClassification =
  | 'AUTH_OR_PERMISSION_ERROR'
  | 'AUTH_ERROR'
  | 'MODEL_NOT_FOUND'
  | 'RATE_LIMIT_OR_QUOTA'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'MALFORMED_OUTPUT'
  | 'SAFETY_BLOCKED'
  | 'UNKNOWN_ERROR';

export interface ModelHealth {
  provider: string;
  modelId: string;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  lastSuccessTimestamp?: number;
  lastFailureTimestamp?: number;
  cooldownUntil: number;
  lastErrorType?: ErrorClassification;
  lastErrorMessage?: string;
  averageLatencyMs: number;
}

/**
 * Tracks runtime health, latency, reliability metrics, and active cooldowns
 * across all provider and model pairs.
 */
export class ModelHealthTracker {
  private healthMap: Map<string, ModelHealth> = new Map();
  private disabledProviders: Map<string, { reason: string; disabledAt: number }> = new Map();
  private defaultCooldownSeconds: number;

  constructor(defaultCooldownSeconds: number = AI_CONFIG.cooldownSeconds) {
    this.defaultCooldownSeconds = defaultCooldownSeconds;
  }

  private getKey(provider: string, modelId: string): string {
    return `${provider}:${modelId}`;
  }

  public isProviderDisabled(provider: string): boolean {
    return this.disabledProviders.has(provider);
  }

  public disableProvider(provider: string, reason: string): void {
    this.disabledProviders.set(provider, {
      reason,
      disabledAt: Date.now(),
    });
    console.warn(`[ModelHealthTracker] Provider '${provider}' marked permanently disabled for this session: ${reason}`);
  }

  public enableProvider(provider: string): void {
    this.disabledProviders.delete(provider);
  }

  public getOrCreateHealth(provider: string, modelId: string): ModelHealth {
    const key = this.getKey(provider, modelId);
    let health = this.healthMap.get(key);
    if (!health) {
      health = {
        provider,
        modelId,
        successCount: 0,
        failureCount: 0,
        consecutiveFailures: 0,
        cooldownUntil: 0,
        averageLatencyMs: 0,
      };
      this.healthMap.set(key, health);
    }
    return health;
  }

  public isEligible(provider: string, modelId: string, now: number = Date.now()): boolean {
    if (this.isProviderDisabled(provider)) {
      return false;
    }
    const health = this.healthMap.get(this.getKey(provider, modelId));
    if (!health) {
      return true; // No failure history, instantly eligible
    }
    return now >= health.cooldownUntil;
  }

  public recordSuccess(provider: string, modelId: string, latencyMs: number): void {
    const health = this.getOrCreateHealth(provider, modelId);
    health.successCount += 1;
    health.consecutiveFailures = 0;
    health.lastSuccessTimestamp = Date.now();
    health.cooldownUntil = 0;

    // Moving average of latency
    if (health.averageLatencyMs === 0) {
      health.averageLatencyMs = latencyMs;
    } else {
      health.averageLatencyMs = Math.round(health.averageLatencyMs * 0.7 + latencyMs * 0.3);
    }
  }

  public recordFailure(
    provider: string,
    modelId: string,
    classification: ErrorClassification,
    retryAfterMs?: number,
    errorMessage?: string
  ): void {
    const health = this.getOrCreateHealth(provider, modelId);
    health.failureCount += 1;
    health.consecutiveFailures += 1;
    health.lastFailureTimestamp = Date.now();
    health.lastErrorType = classification;
    health.lastErrorMessage = errorMessage;

    const now = Date.now();

    switch (classification) {
      case 'AUTH_OR_PERMISSION_ERROR':
      case 'AUTH_ERROR':
        // Auth errors invalidate the entire provider with those credentials
        this.disableProvider(provider, errorMessage || 'Authentication failed');
        health.cooldownUntil = now + 24 * 60 * 60 * 1000;
        break;

      case 'MODEL_NOT_FOUND':
        // 404: cooldown model for 2 hours
        health.cooldownUntil = now + 2 * 60 * 60 * 1000;
        break;

      case 'RATE_LIMIT_OR_QUOTA':
        // 429: Respect explicit retry-after or apply exponential backoff
        if (retryAfterMs && retryAfterMs > 0) {
          health.cooldownUntil = now + retryAfterMs;
        } else {
          const duration = Math.min(
            this.defaultCooldownSeconds * Math.pow(1.5, health.consecutiveFailures - 1),
            300
          ) * 1000;
          health.cooldownUntil = now + duration;
        }
        break;

      case 'SERVER_ERROR':
      case 'TIMEOUT':
      case 'MALFORMED_OUTPUT':
        // Transient server error: backoff with jitter
        const backoffMs =
          Math.min(10 * Math.pow(2, health.consecutiveFailures - 1), 60) * 1000 +
          Math.floor(Math.random() * 2000);
        health.cooldownUntil = now + backoffMs;
        break;

      case 'SAFETY_BLOCKED':
        // Non-retryable safety violation; do not set long cooldown, but flag it
        health.cooldownUntil = 0;
        break;

      default:
        health.cooldownUntil = now + this.defaultCooldownSeconds * 1000;
        break;
    }
  }

  public getStats(provider: string, modelId: string): ModelHealth | undefined {
    return this.healthMap.get(this.getKey(provider, modelId));
  }

  public getAllStats(): Record<string, ModelHealth> {
    const result: Record<string, ModelHealth> = {};
    for (const [key, val] of this.healthMap.entries()) {
      result[key] = { ...val };
    }
    return result;
  }

  public reset(): void {
    this.healthMap.clear();
    this.disabledProviders.clear();
  }
}

/**
 * Dynamic Model Selection Engine
 * Evaluates candidate models dynamically across active providers.
 * Eliminates predefined permanent primary/secondary/fallback model hierarchies.
 */
export class DynamicModelSelector {
  private healthTracker: ModelHealthTracker;

  constructor(healthTracker: ModelHealthTracker) {
    this.healthTracker = healthTracker;
  }

  /**
   * Evaluates and ranks discovered models based on availability, reliability,
   * latency, and capabilities.
   */
  public rankCandidates(
    models: DiscoveredModel[],
    options?: {
      excludeKeys?: Set<string>;
      requiredCapability?: 'textGeneration' | 'streaming' | 'toolCalling';
      minContextTokens?: number;
    }
  ): DiscoveredModel[] {
    const now = Date.now();
    const exclude = options?.excludeKeys || new Set<string>();
    const requiredCap = options?.requiredCapability || 'textGeneration';
    const minTokens = options?.minContextTokens || 0;

    // 1. Filter eligible candidates
    const eligible = models.filter((m) => {
      const key = `${m.provider}:${m.id}`;
      if (exclude.has(key)) return false;

      // Capability checks
      if (!m.capabilities[requiredCap]) return false;
      if (minTokens > 0 && (m.capabilities.maxContextTokens || 0) < minTokens) return false;

      // Health and cooldown checks
      return this.healthTracker.isEligible(m.provider, m.id, now);
    });

    if (eligible.length === 0) {
      return [];
    }

    // 2. Score candidates dynamically
    const scored = eligible.map((m, index) => {
      const health = this.healthTracker.getOrCreateHealth(m.provider, m.id);

      // Laplace-smoothed reliability ratio
      const reliability = (health.successCount + 1) / (health.successCount + health.failureCount + 1);

      // Penalty for consecutive failures
      const penalty = health.consecutiveFailures * 0.2;

      // Latency factor (prefer lower latency, normalize ~1000ms)
      const latencyBonus = health.averageLatencyMs > 0 ? Math.max(0, 1 - health.averageLatencyMs / 5000) * 0.1 : 0.05;

      const finalScore = reliability - penalty + latencyBonus;

      return {
        model: m,
        score: finalScore,
        originalIndex: index,
      };
    });

    // 3. Sort by score descending; break ties by original discovery order
    scored.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.001) {
        return b.score - a.score;
      }
      return a.originalIndex - b.originalIndex;
    });

    return scored.map((s) => s.model);
  }
}

export const modelHealthTracker = new ModelHealthTracker();
export const dynamicModelSelector = new DynamicModelSelector(modelHealthTracker);
