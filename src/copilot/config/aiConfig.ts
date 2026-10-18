/**
 * Mantri AI Engine Configuration
 * Single source of truth for dynamic provider discovery, inference, vector storage, and memory.
 * No predefined primary, secondary, fallback, or default models are required.
 * API keys alone enable their corresponding providers.
 */

export interface HardwareTier {
  ramTier: string;
  recommendedModels: string[];
  recommendedEmbeddingModel: string;
  contextWindow: number;
  description: string;
}

export const HARDWARE_TIERS: Record<string, HardwareTier> = {
  entry: {
    ramTier: '8GB RAM / Apple M1/M2/M3 base',
    recommendedModels: ['llama3.2:3b', 'phi3:mini', 'qwen2.5:3b'],
    recommendedEmbeddingModel: 'nomic-embed-text',
    contextWindow: 4096,
    description: 'Fastest inference, minimal memory footprint (~2.0GB VRAM).',
  },
  standard: {
    ramTier: '16GB RAM / Apple M-series Pro',
    recommendedModels: ['llama3.1:8b', 'mistral:7b', 'qwen2.5:7b'],
    recommendedEmbeddingModel: 'nomic-embed-text',
    contextWindow: 8192,
    description: 'Excellent reasoning and coding depth (~4.7GB VRAM).',
  },
  high: {
    ramTier: '32GB+ RAM / Dedicated GPU 16GB+',
    recommendedModels: ['llama3.1:70b-instruct-q4_K_M', 'command-r'],
    recommendedEmbeddingModel: 'nomic-embed-text',
    contextWindow: 16384,
    description: 'Enterprise quality, comprehensive multi-step reasoning (~20GB VRAM).',
  },
};

export const AI_CONFIG = {
  // Provider API Keys — Keys alone enable the corresponding provider
  geminiApiKey:
    (typeof process !== 'undefined' &&
      (process.env?.GEMINI_API_KEY || process.env?.GOOGLE_API_KEY)) ||
    '',
  groqApiKey:
    (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) || '',
  ollamaBaseUrl:
    (typeof process !== 'undefined' && process.env?.OLLAMA_BASE_URL) || 'http://localhost:11434',

  // Dynamic Discovery & Selection Architecture Settings
  discoveryTtlMs: 15 * 60 * 1000, // 15 minutes internal discovery cache
  maxAttempts: Number(
    (typeof process !== 'undefined' && process.env?.AI_MAX_ATTEMPTS) || 4
  ),
  cooldownSeconds: Number(
    (typeof process !== 'undefined' && process.env?.AI_COOLDOWN_SECONDS) || 60
  ),
  requestTimeoutMs: Number(
    (typeof process !== 'undefined' && process.env?.REQUEST_TIMEOUT_MS) || 15000
  ),

  // Non-mandatory discovery hints (optional overrides if explicitly provided)
  geminiModelHint:
    (typeof process !== 'undefined' &&
      (process.env?.GEMINI_MODEL || process.env?.GEMINI_PRIMARY_MODEL)) ||
    '',
  groqModelHint:
    (typeof process !== 'undefined' && process.env?.GROQ_MODEL) || '',

  // Backward-compatible properties for existing consumers & tests
  get geminiPrimaryModel(): string {
    return this.geminiModelHint || 'gemini-2.5-flash';
  },
  get geminiModel(): string {
    return this.geminiModelHint || 'gemini-2.5-flash';
  },
  get geminiFallbackModels(): string[] {
    return ['gemini-2.5-flash-lite', 'gemini-2.5-pro', 'gemini-2.0-flash'];
  },
  get groqModel(): string {
    return this.groqModelHint || 'llama-3.3-70b-versatile';
  },
  get groqFallbackModels(): string[] {
    return ['llama-3.1-8b-instant'];
  },
  get aiProvider(): string {
    return (typeof process !== 'undefined' && process.env?.AI_PROVIDER) || 'auto';
  },
  get ollamaModel(): string {
    return (typeof process !== 'undefined' && process.env?.OLLAMA_MODEL) || 'llama3.2:3b';
  },
  geminiMaxAttempts: 4,
  geminiCooldownSeconds: 60,
  groqMaxAttempts: 2,
  groqCooldownSeconds: 60,

  // Local Vector & Conversation Memory Persistence
  embeddingModel:
    (typeof process !== 'undefined' && process.env?.EMBEDDING_MODEL) || 'nomic-embed-text',
  vectorDbPath:
    (typeof process !== 'undefined' && process.env?.VECTOR_DB_PATH) || './data/vector_store.json',
  chatHistoryDbPath:
    (typeof process !== 'undefined' && process.env?.CHAT_HISTORY_DB_PATH) ||
    './data/conversations.sqlite',
  adminApiKey:
    (typeof process !== 'undefined' && process.env?.ADMIN_API_KEY) || '',
  backendPort: Number(
    (typeof process !== 'undefined' && process.env?.MANTRI_PORT) || 3001
  ),
  maxOutputTokens: 2048,
  temperature: 0.2,
  rateLimitMaxRequests: 30,
  rateLimitWindowMs: 5 * 60 * 1000, // 5 minutes
};
