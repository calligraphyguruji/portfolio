import type { LLMProvider } from './llmProvider.ts';
import type { RetrievalResult, NLPAnalysis } from '../types.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';
import { MANTRI_SYSTEM_PROMPT } from '../config/mantriIdentity.ts';

export interface OllamaModelInfo {
  name: string;
  size: number;
  digest: string;
  modifiedAt: string;
  details?: {
    format: string;
    family: string;
    parameterSize: string;
    quantizationLevel: string;
  };
}

export interface OllamaHealthStatus {
  available: boolean;
  version?: string;
  baseUrl: string;
  configuredModel: string;
  modelInstalled: boolean;
  availableModels: string[];
  latencyMs: number;
  error?: string;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

/**
 * Production-Grade Local Inference Provider for Ollama
 * Self-hosted, private, and zero dependency on paid cloud LLMs.
 */
export class OllamaProvider implements LLMProvider {
  private baseUrl: string;
  private modelName: string;
  private embeddingModel: string;
  private activeControllers: Set<AbortController> = new Set();

  constructor(
    baseUrl = AI_CONFIG.ollamaBaseUrl,
    modelName = AI_CONFIG.ollamaModel,
    embeddingModel = AI_CONFIG.embeddingModel
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.modelName = modelName;
    this.embeddingModel = embeddingModel;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getModelName(): string {
    return this.modelName;
  }

  public setModelName(name: string): void {
    this.modelName = name;
  }

  /**
   * Health check for Ollama daemon and configured model
   */
  public async health_check(): Promise<OllamaHealthStatus> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/api/version`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        return {
          available: false,
          baseUrl: this.baseUrl,
          configuredModel: this.modelName,
          modelInstalled: false,
          availableModels: [],
          latencyMs: Date.now() - start,
          error: `Ollama returned HTTP ${res.status}`,
        };
      }

      const versionData = (await res.json()) as { version?: string };
      const models = await this.list_models();
      const modelNames = models.map((m) => m.name);
      const isInstalled = modelNames.some(
        (n) => n === this.modelName || n.startsWith(`${this.modelName}:`) || `${this.modelName}:latest` === n
      );

      return {
        available: true,
        version: versionData.version || 'unknown',
        baseUrl: this.baseUrl,
        configuredModel: this.modelName,
        modelInstalled: isInstalled,
        availableModels: modelNames,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        available: false,
        baseUrl: this.baseUrl,
        configuredModel: this.modelName,
        modelInstalled: false,
        availableModels: [],
        latencyMs: Date.now() - start,
        error: err?.message || 'Connection refused or timed out',
      };
    }
  }

  /**
   * List installed models in local Ollama daemon
   */
  public async list_models(): Promise<OllamaModelInfo[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (!res.ok) return [];
      const data = (await res.json()) as { models?: any[] };
      if (!Array.isArray(data.models)) return [];
      return data.models.map((m) => ({
        name: m.name || m.model || '',
        size: m.size || 0,
        digest: m.digest || '',
        modifiedAt: m.modified_at || '',
        details: m.details
          ? {
              format: m.details.format || '',
              family: m.details.family || '',
              parameterSize: m.details.parameter_size || '',
              quantizationLevel: m.details.quantization_level || '',
            }
          : undefined,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Get specific model details and parameter information
   */
  public async get_model_info(name = this.modelName): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Cancel ongoing generation requests
   */
  public cancel_generation(controller?: AbortController): void {
    if (controller) {
      controller.abort();
      this.activeControllers.delete(controller);
    } else {
      for (const ctrl of this.activeControllers) {
        ctrl.abort();
      }
      this.activeControllers.clear();
    }
  }

  /**
   * Generate completion with Ollama /api/chat or /api/generate
   */
  public async generate(
    prompt: string,
    systemInstruction?: string,
    options?: GenerationOptions
  ): Promise<string> {
    const controller = new AbortController();
    this.activeControllers.add(controller);

    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    const timeout = setTimeout(() => {
      controller.abort();
    }, options?.timeoutMs || AI_CONFIG.requestTimeoutMs);

    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.modelName,
          messages,
          stream: false,
          options: {
            temperature: options?.temperature ?? AI_CONFIG.temperature,
            num_predict: options?.maxTokens ?? AI_CONFIG.maxOutputTokens,
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ollama generation failed (HTTP ${res.status}): ${errorText}`);
      }

      const data = (await res.json()) as { message?: { content?: string } };
      return data.message?.content || '';
    } finally {
      clearTimeout(timeout);
      this.activeControllers.delete(controller);
    }
  }

  /**
   * Stream response tokens asynchronously via AsyncIterable
   */
  public async *stream_generate(
    prompt: string,
    systemInstruction?: string,
    options?: GenerationOptions
  ): AsyncIterable<string> {
    const controller = new AbortController();
    this.activeControllers.add(controller);

    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    const timeout = setTimeout(() => {
      controller.abort();
    }, options?.timeoutMs || AI_CONFIG.requestTimeoutMs * 2);

    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.modelName,
          messages,
          stream: true,
          options: {
            temperature: options?.temperature ?? AI_CONFIG.temperature,
            num_predict: options?.maxTokens ?? AI_CONFIG.maxOutputTokens,
          },
        }),
      });

      if (!res.ok || !res.body) {
        const errorText = await res.text();
        throw new Error(`Ollama streaming failed (HTTP ${res.status}): ${errorText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              yield parsed.message.content;
            }
          } catch {
            // Ignore non-JSON lines
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.message?.content) {
            yield parsed.message.content;
          }
        } catch {
          // Ignore
        }
      }
    } finally {
      clearTimeout(timeout);
      this.activeControllers.delete(controller);
    }
  }

  /**
   * Generate local embeddings via Ollama /api/embed or /api/embeddings
   */
  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      try {
        const res = await fetch(`${this.baseUrl}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.embeddingModel,
            prompt: text,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { embedding?: number[] };
          if (data.embedding && Array.isArray(data.embedding)) {
            embeddings.push(data.embedding);
            continue;
          }
        }
      } catch {
        // Fall back to local hash vector if embedding model fails or is offline
      }

      // Safe deterministic fallback vector (zero network dependency)
      const fallback = new Array(64).fill(0);
      for (let i = 0; i < text.length; i++) {
        fallback[i % 64] += text.charCodeAt(i) / 1000;
      }
      embeddings.push(fallback);
    }
    return embeddings;
  }

  /**
   * Integration with Mantri LLMProvider interface for RAG prompt generation
   */
  public async generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    const contextBlocks = retrievedResults.map((r, idx) => {
      return `[SOURCE ${idx + 1}: ${r.chunk.title} - ${r.chunk.section}]\n${r.chunk.content}`;
    });
    const contextText = contextBlocks.join('\n\n---\n\n');

    const systemInstruction = MANTRI_SYSTEM_PROMPT;

    const promptText = `
USER QUERY: ${query}
DETECTED INTENT: ${analysis.intent}
TARGET PROJECT: ${analysis.targetProject || 'None specified'}

RETRIEVED PORTFOLIO CONTEXT:
${contextText || 'No specific sources matched. Rely only on verified foundational portfolio data.'}

CONVERSATION HISTORY:
${history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

Provide an accurate, grounded, helpful response:
`;

    return await this.generate(promptText, systemInstruction);
  }
}
