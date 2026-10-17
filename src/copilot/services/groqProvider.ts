import Groq from 'groq-sdk';
import type { RetrievalResult, NLPAnalysis } from '../types.ts';
import type { AIProvider } from './llmProvider.ts';
import { MANTRI_SYSTEM_PROMPT } from '../config/mantriIdentity.ts';
import { AI_CONFIG } from '../config/aiConfig.ts';

/**
 * Official Groq Fallback Provider
 * Uses the official `groq-sdk` to execute low-latency inference as a fallback
 * when Google Gemini is unavailable, returns HTTP 404, or exhausts its retry budget.
 */
export class GroqProvider implements AIProvider {
  public readonly name = 'groq';
  private apiKey: string | null = null;
  private modelName: string;
  private groqClient: Groq | null = null;
  private timeoutMs: number;

  constructor(
    apiKey?: string,
    modelName?: string,
    timeoutMs: number = AI_CONFIG.requestTimeoutMs
  ) {
    const rawKey =
      apiKey ||
      (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : '') ||
      '';

    const trimmed = rawKey.trim();
    const isPlaceholder =
      !trimmed ||
      trimmed.length < 10 ||
      /^(your_|change_me|dummy|placeholder|none|null|undefined|<)/i.test(trimmed);

    this.modelName =
      modelName ||
      (typeof process !== 'undefined' && process.env?.GROQ_MODEL) ||
      'llama-3.3-70b-versatile';

    this.timeoutMs = timeoutMs;

    if (!isPlaceholder) {
      this.apiKey = trimmed;
      try {
        this.groqClient = new Groq({ apiKey: this.apiKey });
      } catch (err) {
        console.error('[GroqProvider] Initialization error:', err);
        this.groqClient = null;
      }
    }
  }

  public isConfigured(): boolean {
    return this.apiKey !== null && this.groqClient !== null;
  }

  public getModelName(): string {
    return this.modelName;
  }

  public setModelName(modelName: string): void {
    this.modelName = modelName;
  }

  public setClient(client: any): void {
    this.groqClient = client;
    if (client && !this.apiKey) {
      this.apiKey = 'mock-configured-key';
    }
  }

  /**
   * Helper to format conversation history & retrieved context into Groq chat completion messages.
   */
  public formatMessages(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // 1. System prompt with Mantri identity & strict boundaries
    messages.push({
      role: 'system',
      content: MANTRI_SYSTEM_PROMPT,
    });

    // 2. Recent multi-turn conversation history (bounded to last 8 turns)
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (!msg.content || typeof msg.content !== 'string') continue;
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content.trim(),
      });
    }

    // 3. Assemble RAG context blocks
    const contextBlocks = retrievedResults.map((r, idx) => {
      return `[SOURCE ${idx + 1}: ${r.chunk.title} - ${r.chunk.section}]\n${r.chunk.content}`;
    });
    const contextText = contextBlocks.join('\n\n---\n\n');

    // 4. Construct grounded user prompt
    const promptSections: string[] = [];
    promptSections.push(
      'CRITICAL INSTRUCTION: Answer the USER QUESTION directly using the provided RETRIEVED PORTFOLIO CONTEXT. Do NOT introduce yourself, do NOT say "Aman Mishra built me" or give your assistant bio unless the user explicitly asks about who you are or who built you.'
    );

    if (contextText && retrievedResults.length > 0) {
      promptSections.push(`RETRIEVED PORTFOLIO CONTEXT:\n${contextText}`);
    }
    if (analysis.targetProject) {
      promptSections.push(`TARGET PROJECT: ${analysis.targetProject}`);
    }
    if (analysis.intent) {
      promptSections.push(`DETECTED INTENT: ${analysis.intent}`);
    }
    if (analysis.resolvedQuery && analysis.resolvedQuery !== query) {
      promptSections.push(
        `RESOLVED CONVERSATIONAL CONTEXT:\nThe user is asking a follow-up referring to the preceding conversation. Resolved interpretation: "${analysis.resolvedQuery}". Answer directly about this resolved subject using the retrieved context.`
      );
    }
    promptSections.push(`USER QUESTION:\n${query}`);

    messages.push({
      role: 'user',
      content: promptSections.join('\n\n'),
    });

    return messages;
  }

  public async generateResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    if (!this.groqClient || !this.apiKey) {
      throw new Error('GROQ_NOT_CONFIGURED: Missing valid Groq API key.');
    }

    const messages = this.formatMessages(query, retrievedResults, analysis, history);
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, this.timeoutMs);

    try {
      const completion = await this.groqClient.chat.completions.create(
        {
          model: this.modelName,
          messages,
          temperature: 0.2,
          max_tokens: 2048,
        },
        {
          signal: abortController.signal,
        }
      );

      clearTimeout(timeoutHandle);

      const candidateText = completion.choices?.[0]?.message?.content;
      if (candidateText && typeof candidateText === 'string' && candidateText.trim().length > 0) {
        return candidateText.trim();
      }

      throw new Error('GROQ_MALFORMED_OUTPUT: Empty or invalid response content from Groq.');
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      const rawMsg = String(err?.message || err);
      const sanitized = rawMsg
        .replace(/gsk_[0-9A-Za-z\-_]{20,}/g, '[REDACTED]')
        .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED]');

      if (err?.name === 'AbortError' || sanitized.includes('aborted') || sanitized.includes('timeout')) {
        throw new Error(`GROQ_TIMEOUT: Request exceeded timeout of ${this.timeoutMs}ms.`);
      }

      if (err?.status === 401 || sanitized.includes('401') || sanitized.includes('invalid_api_key')) {
        throw new Error(`GROQ_AUTH_ERROR: ${sanitized}`);
      }

      if (err?.status === 429 || sanitized.includes('429') || sanitized.includes('rate_limit')) {
        throw new Error(`GROQ_RATE_LIMIT: ${sanitized}`);
      }

      if (err?.status === 404 || sanitized.includes('404') || sanitized.includes('model_not_found')) {
        throw new Error(`GROQ_MODEL_NOT_FOUND: ${sanitized}`);
      }

      throw new Error(`GROQ_API_ERROR: ${sanitized}`);
    }
  }

  public async *streamResponse(
    query: string,
    retrievedResults: RetrievalResult[],
    analysis: NLPAnalysis,
    history: Array<{ role: string; content: string }> = []
  ): AsyncIterable<string> {
    if (!this.groqClient || !this.apiKey) {
      throw new Error('GROQ_NOT_CONFIGURED: Missing valid Groq API key.');
    }

    const messages = this.formatMessages(query, retrievedResults, analysis, history);
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, this.timeoutMs);

    try {
      const stream = await this.groqClient.chat.completions.create(
        {
          model: this.modelName,
          messages,
          temperature: 0.2,
          max_tokens: 2048,
          stream: true,
        },
        {
          signal: abortController.signal,
        }
      );

      for await (const chunk of stream) {
        clearTimeout(timeoutHandle);
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) {
          yield text;
        }
      }
    } catch (err: any) {
      const rawMsg = String(err?.message || err);
      const sanitized = rawMsg
        .replace(/gsk_[0-9A-Za-z\-_]{20,}/g, '[REDACTED]')
        .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED]');
      throw new Error(`GROQ_STREAM_ERROR: ${sanitized}`);
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map((t) => {
      const vec = new Array(64).fill(0);
      for (let i = 0; i < t.length; i++) {
        vec[i % 64] += t.charCodeAt(i) / 1000;
      }
      return vec;
    });
  }
}
