import type { NLPAnalysis } from '../types.ts';
/**
 * Normalizes query string safely
 */
export declare function normalizeQuery(query: string): string;
/**
 * Detects prompt injection attempts
 */
export declare function detectPromptInjection(query: string): boolean;
/**
 * Deterministic NLP Analysis Layer
 */
export declare function analyzeQuery(rawQuery: string, conversationHistory?: Array<{
    role: string;
    content: string;
}>): NLPAnalysis;
