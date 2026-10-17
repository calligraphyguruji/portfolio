/**
 * Mantri Self-Hosted AI Engine Configuration
 * Single source of truth for local inference, vector storage, and memory.
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
  geminiApiKey:
    (typeof process !== 'undefined' &&
      (process.env?.GEMINI_API_KEY || process.env?.GOOGLE_API_KEY)) ||
    '',
  geminiModel:
    (typeof process !== 'undefined' && process.env?.GEMINI_MODEL) ||
    'gemini-2.0-flash',
  aiProvider:
    (typeof process !== 'undefined' && process.env?.AI_PROVIDER) ||
    'gemini',
  ollamaBaseUrl:
    (typeof process !== 'undefined' && process.env?.OLLAMA_BASE_URL) || 'http://localhost:11434',
  ollamaModel:
    (typeof process !== 'undefined' && process.env?.OLLAMA_MODEL) || 'llama3.2:3b',
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
  requestTimeoutMs: 30000,
  maxOutputTokens: 2048,
  temperature: 0.2,
  rateLimitMaxRequests: 30,
  rateLimitWindowMs: 5 * 60 * 1000, // 5 minutes
};
