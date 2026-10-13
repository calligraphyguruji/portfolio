import type { RetrievalResult, NLPAnalysis } from '../types.ts';
export interface LLMProvider {
    generateResponse(query: string, retrievedResults: RetrievalResult[], analysis: NLPAnalysis, history?: Array<{
        role: string;
        content: string;
    }>): Promise<string>;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
}
/**
 * Official Google Gemini Provider implementation
 */
export declare class GeminiProvider implements LLMProvider {
    private client;
    private modelName;
    private embeddingModelName;
    constructor(apiKey?: string, modelName?: string, embeddingModel?: string);
    isConfigured(): boolean;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    generateResponse(query: string, retrievedResults: RetrievalResult[], analysis: NLPAnalysis, history?: Array<{
        role: string;
        content: string;
    }>): Promise<string>;
}
/**
 * Deterministic Fallback Provider (for offline development, CI tests, and API outages)
 */
export declare class DeterministicFallbackProvider implements LLMProvider {
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    generateResponse(query: string, retrievedResults: RetrievalResult[], analysis: NLPAnalysis): Promise<string>;
}
