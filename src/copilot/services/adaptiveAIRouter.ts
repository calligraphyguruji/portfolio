import type { RetrievalResult, NLPAnalysis } from '../types.ts';
import {
  type DiscoveredModel,
  modelDiscoveryService,
  ModelDiscoveryService,
} from './modelDiscovery.ts';
import {
  type ErrorClassification,
  modelHealthTracker,
  dynamicModelSelector,
  ModelHealthTracker,
  DynamicModelSelector,
} from './dynamicModelSelector.ts';
import { GeminiProvider } from './llmProvider.ts';
import { GroqProvider } from './groqProvider.ts';
import { OllamaProvider } from './ollamaProvider.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';

export interface AdaptiveRouterDiagnostic {
  provider: string;
  modelId: string;
  statusCode?: number;
  category: ErrorClassification;
  reason: string;
  timestamp: string;
  is404?: boolean;
}

export interface AdaptiveRouterResponse {
  answer: string;
  modelUsed: string;
  provider: string;
  attempts: number;
  failoverOccurred: boolean;
  failoverReason?: string;
  diagnostics: AdaptiveRouterDiagnostic[];
  isError?: boolean;
  providerError?: string;
}

/**
 * Redacts API keys and sensitive tokens from error strings and diagnostics.
 */
export function sanitizeSecretString(str: string): string {
  if (!str) return '';
  return str
    .replace(/AIza[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_GEMINI_KEY]')
    .replace(/gsk_[a-zA-Z0-9]{20,}/g, '[REDACTED_GROQ_KEY]')
    .replace(/bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi, 'Bearer [REDACTED_TOKEN]');
}

/**
 * Standardized error classifier across any LLM provider.
 */
export function classifyProviderError(err: any): {
  category: ErrorClassification;
  statusCode?: number;
  reason: string;
  retryAfterMs?: number;
} {
  const rawMsg = String(err?.message || err);
  const sanitized = sanitizeSecretString(rawMsg);
  const lower = sanitized.toLowerCase();
  const status = err?.status || err?.statusCode || (err?.response && err.response.status);

  // 1. Safety Blocked (Prompt or Output violation)
  if (lower.includes('safety') || lower.includes('safety_blocked') || lower.includes('blocked')) {
    return {
      category: 'SAFETY_BLOCKED',
      statusCode: status || 400,
      reason: 'Content triggered safety policy and was blocked.',
    };
  }

  // 2. Authentication and Permissions
  if (
    status === 401 ||
    status === 403 ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('unauthorized') ||
    lower.includes('permission_denied') ||
    lower.includes('forbidden') ||
    lower.includes('gemini_auth_error') ||
    lower.includes('groq_auth_error') ||
    lower.includes('invalid_api_key')
  ) {
    return {
      category: 'AUTH_OR_PERMISSION_ERROR',
      statusCode: status || 401,
      reason: 'Authentication failed: Invalid or unauthorized API key.',
    };
  }

  // 3. Model Not Found (404)
  if (
    status === 404 ||
    lower.includes('not found') ||
    lower.includes('model_not_found') ||
    lower.includes('does not exist')
  ) {
    return {
      category: 'MODEL_NOT_FOUND',
      statusCode: 404,
      reason: sanitized || 'Requested model was not found on provider API.',
    };
  }

  // 4. Rate Limits & Quota Exhaustion (429)
  if (
    status === 429 ||
    lower.includes('resource_exhausted') ||
    lower.includes('rate limit') ||
    lower.includes('quota')
  ) {
    let retryAfterMs: number | undefined = undefined;
    const retryHeader = err?.headers?.get?.('retry-after') || err?.response?.headers?.['retry-after'];
    if (retryHeader) {
      const seconds = Number(retryHeader);
      if (!isNaN(seconds)) retryAfterMs = seconds * 1000;
    }
    return {
      category: 'RATE_LIMIT_OR_QUOTA',
      statusCode: 429,
      reason: sanitized || 'Provider rate limit or quota exceeded.',
      retryAfterMs,
    };
  }

  // 5. Timeouts & Connection Drops (checked before 5xx so duration strings like 15000ms are not matched as 500)
  if (
    lower.includes('timeout') ||
    lower.includes('etimedout') ||
    lower.includes('aborterror') ||
    lower.includes('aborted') ||
    lower.includes('econnrefused') ||
    lower.includes('econnreset')
  ) {
    return {
      category: 'TIMEOUT',
      statusCode: 408,
      reason: 'Request exceeded network timeout or connection reset.',
    };
  }

  // 6. Server Errors (500, 502, 503, 504)
  if (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /\b(500|502|503|504)\b/.test(lower) ||
    lower.includes('service unavailable') ||
    lower.includes('internal server error') ||
    lower.includes('internal error') ||
    lower.includes('bad gateway')
  ) {
    return {
      category: 'SERVER_ERROR',
      statusCode: status || 503,
      reason: sanitized || 'Provider upstream server error.',
    };
  }

  // 7. Malformed / Empty output
  if (lower.includes('empty') || lower.includes('malformed')) {
    return {
      category: 'MALFORMED_OUTPUT',
      statusCode: 502,
      reason: 'Model returned empty or unparseable output.',
    };
  }

  return {
    category: 'UNKNOWN_ERROR',
    statusCode: status || 500,
    reason: sanitized || 'Unknown provider error occurred.',
  };
}

/**
 * Adaptive AI Router
 * Implements provider-independent, dynamic model selection, observability,
 * and resilient multi-provider automatic failover with zero hardcoded model hierarchies.
 */
export class AdaptiveAIRouter {
  private discoveryService: ModelDiscoveryService;
  private healthTracker: ModelHealthTracker;
  private selector: DynamicModelSelector;
  private geminiProviders: Map<string, GeminiProvider> = new Map();
  private groqProviders: Map<string, GroqProvider> = new Map();
  private ollamaProvider: OllamaProvider;
  private maxAttempts: number;

  constructor(options?: {
    discoveryService?: ModelDiscoveryService;
    healthTracker?: ModelHealthTracker;
    selector?: DynamicModelSelector;
    maxAttempts?: number;
  }) {
    this.discoveryService = options?.discoveryService || modelDiscoveryService;
    this.healthTracker = options?.healthTracker || new ModelHealthTracker();
    this.selector = options?.selector || new DynamicModelSelector(this.healthTracker);
    this.maxAttempts = options?.maxAttempts || AI_CONFIG.maxAttempts;
    this.ollamaProvider = new OllamaProvider();
  }

  public customGeminiRouter: any = null;
  public customGroqProvider: any = null;

  public setCustomGeminiRouter(router: any): void {
    this.customGeminiRouter = router;
  }

  public setCustomGroqProvider(provider: any): void {
    this.customGroqProvider = provider;
  }

  /**
   * Helper to retrieve or lazily instantiate an execution provider for a specific model.
   */
  public getProviderForModel(providerName: string, modelId: string): any {
    if (providerName === 'gemini') {
      let instance = this.geminiProviders.get(modelId);
      if (instance) return instance;

      if (this.customGeminiRouter) {
        if (typeof this.customGeminiRouter.getProvider === 'function') {
          const p = this.customGeminiRouter.getProvider(modelId);
          if (p) return p;
        }
        if (this.customGeminiRouter.providers?.has(modelId)) {
          return this.customGeminiRouter.providers.get(modelId);
        }
        const routerKey = this.customGeminiRouter.getApiKey?.() || AI_CONFIG.geminiApiKey;
        instance = new GeminiProvider(routerKey, modelId);
        this.geminiProviders.set(modelId, instance);
        return instance;
      }

      instance = new GeminiProvider(AI_CONFIG.geminiApiKey, modelId);
      this.geminiProviders.set(modelId, instance);
      return instance;
    }

    if (providerName === 'groq') {
      let instance = this.groqProviders.get(modelId);
      if (instance) return instance;

      if (this.customGroqProvider) {
        // If customGroqProvider was configured with this exact model, reuse it
        if (this.customGroqProvider.getModelName?.() === modelId) {
          return this.customGroqProvider;
        }
        // If customGroqProvider has a client or apiKey, create an instance for the requested model
        const groqKey = this.customGroqProvider.getApiKey?.() || AI_CONFIG.groqApiKey;
        instance = new GroqProvider(groqKey, modelId);
        if (typeof this.customGroqProvider.getClient === 'function' && this.customGroqProvider.getClient()) {
          instance.setClient(this.customGroqProvider.getClient());
        }
        this.groqProviders.set(modelId, instance);
        return instance;
      }

      instance = new GroqProvider(AI_CONFIG.groqApiKey, modelId);
      this.groqProviders.set(modelId, instance);
      return instance;
    }

    if (providerName === 'ollama') {
      return this.ollamaProvider;
    }

    return null;
  }

  /**
   * Allows unit tests to inject custom mock providers for a specific (provider, modelId) pair.
   */
  public setProvider(providerName: string, modelId: string, providerInstance: any): void {
    if (providerName === 'gemini') {
      this.geminiProviders.set(modelId, providerInstance);
    } else if (providerName === 'groq') {
      this.groqProviders.set(modelId, providerInstance);
    }
  }

  /**
   * Checks whether at least one supported provider is configured with valid credentials.
   */
  public isConfigured(): boolean {
    if (this.customGeminiRouter && this.customGeminiRouter.isConfigured()) return true;
    if (this.customGroqProvider && this.customGroqProvider.isConfigured()) return true;
    return this.discoveryService.getConfiguredProviders().length > 0;
  }

  /**
   * Discovers candidate models across configured providers, respecting any custom router overrides
   * and merging dynamic discovery results so all eligible models are candidates for selection.
   */
  public async discoverAllModels(forceRefresh: boolean = false): Promise<DiscoveredModel[]> {
    const list: DiscoveredModel[] = [];
    const seen = new Set<string>();

    const addModel = (m: DiscoveredModel) => {
      const key = `${m.provider}:${m.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(m);
      }
    };

    // 1. Gemini candidate discovery
    if (this.customGeminiRouter && this.customGeminiRouter.isConfigured()) {
      const configured = this.customGeminiRouter.getAllConfiguredModels?.() || [
        this.customGeminiRouter.getPrimaryModel?.() || 'gemini-2.0-flash',
      ];
      for (const id of configured) {
        addModel({
          provider: 'gemini',
          id,
          displayName: `Gemini ${id}`,
          capabilities: { textGeneration: true, streaming: true, toolCalling: true },
          discoveredAt: Date.now(),
        });
      }
    }
    const geminiDiscovered = await this.discoveryService.getAvailableModels('gemini', forceRefresh);
    for (const m of geminiDiscovered) addModel(m);

    // 2. Groq candidate discovery
    if (this.customGroqProvider && this.customGroqProvider.isConfigured()) {
      const modelName = this.customGroqProvider.getModelName?.() || 'llama-3.3-70b-versatile';
      addModel({
        provider: 'groq',
        id: modelName,
        displayName: `Groq ${modelName}`,
        capabilities: { textGeneration: true, streaming: true, toolCalling: true },
        discoveredAt: Date.now(),
      });
    }
    const groqDiscovered = await this.discoveryService.getAvailableModels('groq', forceRefresh);
    for (const m of groqDiscovered) addModel(m);

    // 3. Ollama local candidates
    const ollamaModels = await this.discoveryService.getAvailableModels('ollama', forceRefresh);
    for (const m of ollamaModels) addModel(m);

    return list;
  }

  /**
   * Dynamically generates a response by discovering available models, ranking eligible
   * candidates, and executing with automatic failover across providers.
   */
  public async generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history?: Array<{ role: string; content: string }>
  ): Promise<AdaptiveRouterResponse> {
    const diagnostics: AdaptiveRouterDiagnostic[] = [];
    const attemptedKeys = new Set<string>();
    let attempts = 0;
    let failoverOccurred = false;
    let failoverReason: string | undefined = undefined;

    // 1. Discover all candidate models dynamically across configured providers
    const allModels = await this.discoverAllModels();

    if (allModels.length === 0) {
      console.warn('[AdaptiveAIRouter] No compatible AI models discovered across configured providers.');
      return {
        answer: "I am currently unable to reach my reasoning models. You can continue asking about Aman's projects, technical architecture, and engineering background.",
        modelUsed: 'unavailable',
        provider: 'none',
        attempts: 0,
        failoverOccurred: false,
        diagnostics: [],
        isError: true,
      };
    }

    // 2. Dynamic Execution & Failover Loop
    while (attempts < this.maxAttempts) {
      // Re-rank available candidates on each iteration considering active cooldowns and prior attempts
      const candidates = this.selector.rankCandidates(allModels, {
        excludeKeys: attemptedKeys,
        requiredCapability: 'textGeneration',
      });

      if (candidates.length === 0) {
        console.warn('[AdaptiveAIRouter] Exhausted all eligible candidate models without success.');
        break;
      }

      const candidate = candidates[0];
      const candidateKey = `${candidate.provider}:${candidate.id}`;
      attemptedKeys.add(candidateKey);
      attempts += 1;

      const providerInstance = this.getProviderForModel(candidate.provider, candidate.id);
      if (!providerInstance) {
        continue;
      }

      const startTs = Date.now();
      try {
        console.info(`[AdaptiveAIRouter] Attempt ${attempts}/${this.maxAttempts}: Dispatching to ${candidate.provider}:${candidate.id}`);

        const rawAnswer = await providerInstance.generateResponse(
          query,
          retrievedResults,
          analysis,
          history
        );

        const latencyMs = Date.now() - startTs;

        // Response validation: ensure non-empty output
        if (!rawAnswer || rawAnswer.trim().length === 0) {
          throw new Error('MALFORMED_OUTPUT: Model returned empty whitespace.');
        }

        // Record successful generation in health tracker
        this.healthTracker.recordSuccess(candidate.provider, candidate.id, latencyMs);

        return {
          answer: rawAnswer,
          modelUsed: `${candidate.provider}:${candidate.id}`,
          provider: candidate.provider,
          attempts,
          failoverOccurred,
          failoverReason,
          diagnostics,
        };
      } catch (err: any) {
        const errorInfo = classifyProviderError(err);
        failoverOccurred = true;
        failoverReason = `${errorInfo.category}: ${errorInfo.reason}`;

        const diag: AdaptiveRouterDiagnostic = {
          provider: candidate.provider,
          modelId: candidate.id,
          statusCode: errorInfo.statusCode,
          category: errorInfo.category,
          reason: errorInfo.reason,
          timestamp: new Date().toISOString(),
          is404: errorInfo.category === 'MODEL_NOT_FOUND',
        };
        diagnostics.push(diag);

        console.warn(`[AdaptiveAIRouter] Failure on ${candidateKey}:`, JSON.stringify(diag));

        // Invariant: Do not bypass responsible AI safety violations by switching models
        if (errorInfo.category === 'SAFETY_BLOCKED') {
          return {
            answer: "I am unable to fulfill this request as the content triggered safety and responsible AI restrictions.",
            modelUsed: `${candidate.provider}:${candidate.id}`,
            provider: candidate.provider,
            attempts,
            failoverOccurred: false,
            diagnostics,
            providerError: 'SAFETY_BLOCKED',
          };
        }

        // Handle 404: Invalidate discovered model so subsequent requests never select it
        if (errorInfo.category === 'MODEL_NOT_FOUND') {
          this.discoveryService.invalidateModel(candidate.provider, candidate.id);
        }

        // Update health tracker with error and dynamic cooldown
        this.healthTracker.recordFailure(
          candidate.provider,
          candidate.id,
          errorInfo.category,
          errorInfo.retryAfterMs,
          errorInfo.reason
        );
      }
    }

    // 3. All configured candidates failed or retry budget exhausted
    return {
      answer: "I am temporarily unable to complete an online reasoning pass. You can continue asking about Aman's verified projects, technical stack, or background.",
      modelUsed: 'unavailable',
      provider: 'none',
      attempts,
      failoverOccurred: true,
      failoverReason: failoverReason || 'EXHAUSTED_ALL_CANDIDATES',
      diagnostics,
      isError: true,
      providerError: failoverReason ? failoverReason.split(':')[0] : 'EXHAUSTED_ALL_CANDIDATES',
    };
  }

  /**
   * Dynamically streams response tokens from the highest-ranked available model,
   * switching cleanly if candidate setup fails before streaming begins.
   */
  public async *streamChat(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history?: Array<{ role: string; content: string }>
  ): AsyncIterable<string> {
    const allModels = await this.discoverAllModels();
    const attemptedKeys = new Set<string>();
    let attempts = 0;

    while (attempts < this.maxAttempts) {
      const candidates = this.selector.rankCandidates(allModels, {
        excludeKeys: attemptedKeys,
        requiredCapability: 'streaming',
      });

      if (candidates.length === 0) {
        break;
      }

      const candidate = candidates[0];
      const candidateKey = `${candidate.provider}:${candidate.id}`;
      attemptedKeys.add(candidateKey);
      attempts += 1;

      const providerInstance = this.getProviderForModel(candidate.provider, candidate.id);
      if (!providerInstance || !providerInstance.streamResponse) {
        continue;
      }

      try {
        let yieldedAny = false;
        for await (const chunk of providerInstance.streamResponse(
          query,
          retrievedResults,
          analysis,
          history
        )) {
          yieldedAny = true;
          yield chunk;
        }

        if (yieldedAny) {
          this.healthTracker.recordSuccess(candidate.provider, candidate.id, 500);
          return;
        }
      } catch (err: any) {
        const errorInfo = classifyProviderError(err);
        console.warn(`[AdaptiveAIRouter] Stream failure on ${candidateKey}:`, errorInfo.reason);
        this.healthTracker.recordFailure(
          candidate.provider,
          candidate.id,
          errorInfo.category,
          errorInfo.retryAfterMs,
          errorInfo.reason
        );
      }
    }

    // Fallback if all streams fail: yield clear error message
    yield "I am currently unable to stream an online response. You can continue asking about Aman's verified projects, technical stack, or background.";
  }

  public getDiscoveryService(): ModelDiscoveryService {
    return this.discoveryService;
  }

  public getHealthTracker(): ModelHealthTracker {
    return this.healthTracker;
  }

  public getSelector(): DynamicModelSelector {
    return this.selector;
  }
}

export const adaptiveAIRouter = new AdaptiveAIRouter({
  discoveryService: modelDiscoveryService,
  healthTracker: modelHealthTracker,
  selector: dynamicModelSelector,
});
