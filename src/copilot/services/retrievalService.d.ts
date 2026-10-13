import type { KnowledgeChunk, RetrievalResult, CitationReference, NLPAnalysis } from '../types.ts';
/**
 * Computes BM25-inspired lexical matching score between query terms and chunk content
 */
export declare function calculateLexicalScore(query: string, chunk: KnowledgeChunk): number;
/**
 * Computes cosine similarity between two float vectors
 */
export declare function cosineSimilarity(vecA: number[], vecB: number[]): number;
/**
 * Reciprocal Rank Fusion (RRF)
 * Combines rankings from lexical BM25 and semantic embedding searches
 */
export declare function reciprocalRankFusion(lexicalRankings: KnowledgeChunk[], semanticRankings: KnowledgeChunk[], k?: number): Map<string, number>;
/**
 * Hybrid Retriever
 */
export declare class HybridRetriever {
    private chunks;
    constructor(chunks?: KnowledgeChunk[]);
    setChunks(chunks: KnowledgeChunk[]): void;
    retrieve(analysis: NLPAnalysis, queryEmbedding?: number[], limit?: number): RetrievalResult[];
    generateCitations(results: RetrievalResult[]): CitationReference[];
}
