import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { AI_CONFIG } from '../config/aiConfig.ts';

export interface ModelCapabilities {
  textGeneration: boolean;
  streaming: boolean;
  toolCalling?: boolean;
  maxContextTokens?: number;
  maxOutputTokens?: number;
}

export interface DiscoveredModel {
  provider: 'gemini' | 'groq' | 'ollama' | string;
  id: string;
  displayName: string;
  capabilities: ModelCapabilities;
  discoveredAt: number;
}

export interface ProviderDiscoveryAdapter {
  providerName: string;
  isConfigured(): boolean;
  discoverModels(): Promise<DiscoveredModel[]>;
  getRecoveryModels(): DiscoveredModel[];
}

/**
 * Validates whether an API key is a genuine secret and not an unset placeholder.
 */
export function isValidApiKey(key?: string | null): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length < 10) return false;
  return !/^(your_|change_me|dummy|placeholder|none|null|undefined|<)/i.test(trimmed);
}

/**
 * Adapter for discovering models via Google's official Gemini API.
 */
export class GeminiDiscoveryAdapter implements ProviderDiscoveryAdapter {
  public readonly providerName = 'gemini';
  private apiKey: string;
  private aiClient: GoogleGenAI | null = null;

  constructor(apiKey: string = AI_CONFIG.geminiApiKey) {
    this.apiKey = (apiKey || '').trim();
    if (this.isConfigured()) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error('[GeminiDiscoveryAdapter] Failed to initialize GoogleGenAI client:', err);
        this.aiClient = null;
      }
    }
  }

  public isConfigured(): boolean {
    return isValidApiKey(this.apiKey);
  }

  public getRecoveryModels(): DiscoveredModel[] {
    const now = Date.now();
    return [
      {
        provider: 'gemini',
        id: 'gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        capabilities: {
          textGeneration: true,
          streaming: true,
          toolCalling: true,
          maxContextTokens: 1048576,
          maxOutputTokens: 8192,
        },
        discoveredAt: now,
      },
      {
        provider: 'gemini',
        id: 'gemini-2.5-flash-lite',
        displayName: 'Gemini 2.5 Flash-Lite',
        capabilities: {
          textGeneration: true,
          streaming: true,
          toolCalling: true,
          maxContextTokens: 1048576,
          maxOutputTokens: 8192,
        },
        discoveredAt: now,
      },
      {
        provider: 'gemini',
        id: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        capabilities: {
          textGeneration: true,
          streaming: true,
          toolCalling: true,
          maxContextTokens: 2097152,
          maxOutputTokens: 8192,
        },
        discoveredAt: now,
      },
      {
        provider: 'gemini',
        id: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        capabilities: {
          textGeneration: true,
          streaming: true,
          toolCalling: true,
          maxContextTokens: 1048576,
          maxOutputTokens: 8192,
        },
        discoveredAt: now,
      },
    ];
  }

  public async discoverModels(): Promise<DiscoveredModel[]> {
    if (!this.isConfigured() || !this.aiClient) {
      return [];
    }

    try {
      const discovered: DiscoveredModel[] = [];
      const now = Date.now();

      // Query official model list
      const pager = await this.aiClient.models.list();

      // Collect raw models from Pager
      const rawModels: any[] = [];
      if (Array.isArray((pager as any)?.page)) {
        rawModels.push(...(pager as any).page);
      } else if (Symbol.asyncIterator in Object(pager)) {
        for await (const m of pager) {
          rawModels.push(m);
        }
      }

      for (const raw of rawModels) {
        const rawName = String(raw.name || raw.id || '');
        const modelId = rawName.replace(/^models\//, '').trim();

        if (!modelId) continue;

        // Filter out incompatible models (embeddings, audio, computer vision generation)
        const lower = modelId.toLowerCase();
        if (
          lower.includes('embedding') ||
          lower.includes('aqa') ||
          lower.includes('imagen') ||
          lower.includes('whisper') ||
          lower.includes('tts') ||
          lower.includes('realtime')
        ) {
          continue;
        }

        // Check text generation compatibility
        const supportedMethods: string[] =
          raw.supportedGenerationMethods || raw.supportedActions || [];
        const supportsGenerate =
          supportedMethods.length === 0 ||
          supportedMethods.some((method) =>
            /generatecontent/i.test(method)
          ) ||
          lower.startsWith('gemini');

        if (!supportsGenerate) continue;

        discovered.push({
          provider: 'gemini',
          id: modelId,
          displayName: raw.displayName || `Google ${modelId}`,
          capabilities: {
            textGeneration: true,
            streaming: true,
            toolCalling: true,
            maxContextTokens: raw.inputTokenLimit || 1048576,
            maxOutputTokens: raw.outputTokenLimit || 8192,
          },
          discoveredAt: now,
        });
      }

      if (discovered.length === 0) {
        console.warn('[GeminiDiscoveryAdapter] Discovery returned 0 valid text models, engaging verified recovery list');
        return this.getRecoveryModels();
      }

      return discovered;
    } catch (err: any) {
      const msg = String(err?.message || err);
      // Check for non-retryable authentication failure
      if (
        err?.status === 401 ||
        err?.status === 403 ||
        /api_key_invalid|permission_denied|unauthorized/i.test(msg)
      ) {
        console.warn('[GeminiDiscoveryAdapter] Authentication failed during discovery:', msg.replace(/AIza[a-zA-Z0-9_\-]{10,}/g, '[REDACTED_API_KEY]'));
        return [];
      }

      console.warn('[GeminiDiscoveryAdapter] Discovery query failed, utilizing resilient recovery list:', msg.replace(/AIza[a-zA-Z0-9_\-]{10,}/g, '[REDACTED_API_KEY]'));
      return this.getRecoveryModels();
    }
  }
}

/**
 * Adapter for discovering models via Groq's official API.
 */
export class GroqDiscoveryAdapter implements ProviderDiscoveryAdapter {
  public readonly providerName = 'groq';
  private apiKey: string;
  private groqClient: Groq | null = null;

  constructor(apiKey: string = AI_CONFIG.groqApiKey) {
    this.apiKey = (apiKey || '').trim();
    if (this.isConfigured()) {
      try {
        this.groqClient = new Groq({ apiKey: this.apiKey });
      } catch (err) {
        console.error('[GroqDiscoveryAdapter] Failed to initialize Groq client:', err);
        this.groqClient = null;
      }
    }
  }

  public isConfigured(): boolean {
    return isValidApiKey(this.apiKey);
  }

  public getRecoveryModels(): DiscoveredModel[] {
    const now = Date.now();
    return [
      {
        provider: 'groq',
        id: 'llama-3.3-70b-versatile',
        displayName: 'Llama 3.3 70B Versatile',
        capabilities: {
          textGeneration: true,
          streaming: true,
          toolCalling: true,
          maxContextTokens: 131072,
          maxOutputTokens: 8192,
        },
        discoveredAt: now,
      },
      {
        provider: 'groq',
        id: 'llama-3.1-8b-instant',
        displayName: 'Llama 3.1 8B Instant',
        capabilities: {
          textGeneration: true,
          streaming: true,
          toolCalling: true,
          maxContextTokens: 131072,
          maxOutputTokens: 8192,
        },
        discoveredAt: now,
      },
    ];
  }

  public async discoverModels(): Promise<DiscoveredModel[]> {
    if (!this.isConfigured() || !this.groqClient) {
      return [];
    }

    try {
      const discovered: DiscoveredModel[] = [];
      const now = Date.now();
      const res = await this.groqClient.models.list();
      const rawList = res.data || [];

      for (const m of rawList) {
        const id = String(m.id || '').trim();
        if (!id) continue;

        // Skip inactive or non-text models
        if ((m as any).active === false) continue;
        const lower = id.toLowerCase();
        if (
          lower.includes('whisper') ||
          lower.includes('distil-whisper') ||
          lower.includes('tts') ||
          lower.includes('guard') ||
          lower.includes('embed')
        ) {
          continue;
        }

        discovered.push({
          provider: 'groq',
          id,
          displayName: `Groq ${id}`,
          capabilities: {
            textGeneration: true,
            streaming: true,
            toolCalling: true,
            maxContextTokens: (m as any).context_window || 8192,
            maxOutputTokens: 4096,
          },
          discoveredAt: now,
        });
      }

      if (discovered.length === 0) {
        return this.getRecoveryModels();
      }

      return discovered;
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (
        err?.status === 401 ||
        err?.status === 403 ||
        /invalid_api_key|unauthorized/i.test(msg)
      ) {
        console.warn('[GroqDiscoveryAdapter] Authentication failed during discovery:', msg.replace(/gsk_[a-zA-Z0-9]{10,}/g, '[REDACTED_API_KEY]'));
        return [];
      }

      console.warn('[GroqDiscoveryAdapter] Discovery query failed, utilizing resilient recovery list:', msg.replace(/gsk_[a-zA-Z0-9]{10,}/g, '[REDACTED_API_KEY]'));
      return this.getRecoveryModels();
    }
  }
}

/**
 * Adapter for discovering models via local Ollama instance (optional zero-network inference).
 */
export class OllamaDiscoveryAdapter implements ProviderDiscoveryAdapter {
  public readonly providerName = 'ollama';
  private baseUrl: string;

  constructor(baseUrl: string = AI_CONFIG.ollamaBaseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  public isConfigured(): boolean {
    // Only enabled if explicitly running in a Node environment with localhost / reachable endpoint
    return typeof process !== 'undefined' && Boolean(this.baseUrl);
  }

  public getRecoveryModels(): DiscoveredModel[] {
    const now = Date.now();
    return [
      {
        provider: 'ollama',
        id: 'llama3.2:3b',
        displayName: 'Ollama Llama 3.2 3B',
        capabilities: {
          textGeneration: true,
          streaming: true,
          maxContextTokens: 4096,
          maxOutputTokens: 2048,
        },
        discoveredAt: now,
      },
    ];
  }

  public async discoverModels(): Promise<DiscoveredModel[]> {
    if (!this.isConfigured()) return [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];

      const data = await res.json();
      const now = Date.now();
      const models = data?.models || [];
      const discovered: DiscoveredModel[] = [];

      for (const m of models) {
        const name = String(m.name || m.model || '').trim();
        if (!name || name.includes('embed')) continue;

        discovered.push({
          provider: 'ollama',
          id: name,
          displayName: `Local Ollama (${name})`,
          capabilities: {
            textGeneration: true,
            streaming: true,
            maxContextTokens: 4096,
            maxOutputTokens: 2048,
          },
          discoveredAt: now,
        });
      }

      return discovered;
    } catch {
      // Ollama daemon offline or unreachable; silently return empty
      return [];
    }
  }
}

/**
 * Centralized Model Discovery Service
 * Manages provider discovery adapters, maintains an internal TTL cache,
 * and refreshes models dynamically when outages or 404 errors occur.
 */
export class ModelDiscoveryService {
  private adapters: Map<string, ProviderDiscoveryAdapter> = new Map();
  private cache: Map<string, { models: DiscoveredModel[]; expiresAt: number }> = new Map();
  private invalidModels: Set<string> = new Set();
  private ttlMs: number;

  constructor(ttlMs: number = AI_CONFIG.discoveryTtlMs) {
    this.ttlMs = ttlMs;
    // Register default adapters
    this.registerAdapter(new GeminiDiscoveryAdapter());
    this.registerAdapter(new GroqDiscoveryAdapter());
    this.registerAdapter(new OllamaDiscoveryAdapter());
  }

  public registerAdapter(adapter: ProviderDiscoveryAdapter): void {
    this.adapters.set(adapter.providerName, adapter);
  }

  public getAdapter(providerName: string): ProviderDiscoveryAdapter | undefined {
    return this.adapters.get(providerName);
  }

  public getConfiguredProviders(): string[] {
    const list: string[] = [];
    for (const [name, adapter] of this.adapters.entries()) {
      if (adapter.isConfigured()) {
        list.push(name);
      }
    }
    return list;
  }

  /**
   * Retrieves available, compatible models for a specific provider.
   * Leverages cached discovery results when within TTL.
   */
  public async getAvailableModels(
    providerName: string,
    forceRefresh: boolean = false
  ): Promise<DiscoveredModel[]> {
    const adapter = this.adapters.get(providerName);
    if (!adapter || !adapter.isConfigured()) {
      return [];
    }

    const now = Date.now();
    const cached = this.cache.get(providerName);

    if (!forceRefresh && cached && cached.expiresAt > now) {
      return cached.models.filter(
        (m) => !this.invalidModels.has(`${providerName}:${m.id}`)
      );
    }

    try {
      const models = await adapter.discoverModels();
      const validModels = models.filter(
        (m) => !this.invalidModels.has(`${providerName}:${m.id}`)
      );

      this.cache.set(providerName, {
        models: validModels,
        expiresAt: now + this.ttlMs,
      });

      return validModels;
    } catch (err) {
      console.error(`[ModelDiscoveryService] Discovery failed for ${providerName}:`, err);
      return [];
    }
  }

  /**
   * Discovers all eligible models across all configured providers.
   */
  public async getAllAvailableModels(forceRefresh: boolean = false): Promise<DiscoveredModel[]> {
    const configured = this.getConfiguredProviders();
    const results = await Promise.all(
      configured.map((p) => this.getAvailableModels(p, forceRefresh))
    );
    return results.flat();
  }

  /**
   * Marks a model as invalid (e.g. after receiving a 404 Model Not Found error).
   * Invalidates cached discovery for that provider so subsequent requests exclude it.
   */
  public invalidateModel(provider: string, modelId: string): void {
    const key = `${provider}:${modelId}`;
    this.invalidModels.add(key);

    const cached = this.cache.get(provider);
    if (cached) {
      cached.models = cached.models.filter((m) => m.id !== modelId);
    }
    console.info(`[ModelDiscoveryService] Model ${key} invalidated and removed from eligible candidates.`);
  }

  /**
   * Clears cached discovery for a provider to force immediate re-discovery on next request.
   */
  public invalidateProvider(provider: string): void {
    this.cache.delete(provider);
  }

  /**
   * Clears all caches and invalidation sets (useful for session resets & unit testing).
   */
  public reset(): void {
    this.cache.clear();
    this.invalidModels.clear();
  }

  public getStatus(): { cachedProviders: string[]; invalidModelsCount: number } {
    return {
      cachedProviders: Array.from(this.cache.keys()),
      invalidModelsCount: this.invalidModels.size,
    };
  }
}

export const modelDiscoveryService = new ModelDiscoveryService();
