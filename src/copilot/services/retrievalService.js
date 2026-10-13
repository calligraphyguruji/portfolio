/**
 * Computes BM25-inspired lexical matching score between query terms and chunk content
 */
export function calculateLexicalScore(query, chunk) {
    const queryTokens = query
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2);
    if (queryTokens.length === 0)
        return 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.title.toLowerCase();
    let score = 0;
    for (const token of queryTokens) {
        // Exact match in title receives heavy boost
        if (titleLower.includes(token)) {
            score += 3.0;
        }
        // Match in keywords
        if (chunk.keywords.includes(token)) {
            score += 1.5;
        }
        // Match in content
        const count = (contentLower.match(new RegExp(`\\b${token}\\b`, 'g')) || []).length;
        score += Math.min(count, 5) * 0.5;
    }
    // Exact project ID match boost
    if (chunk.projectId && query.toLowerCase().includes(chunk.projectId.toLowerCase())) {
        score += 4.0;
    }
    return score;
}
/**
 * Computes cosine similarity between two float vectors
 */
export function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length || vecA.length === 0)
        return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
/**
 * Reciprocal Rank Fusion (RRF)
 * Combines rankings from lexical BM25 and semantic embedding searches
 */
export function reciprocalRankFusion(lexicalRankings, semanticRankings, k = 60) {
    const scores = new Map();
    lexicalRankings.forEach((chunk, rank) => {
        const current = scores.get(chunk.chunkId) || 0;
        scores.set(chunk.chunkId, current + 1 / (k + rank + 1));
    });
    semanticRankings.forEach((chunk, rank) => {
        const current = scores.get(chunk.chunkId) || 0;
        scores.set(chunk.chunkId, current + 1 / (k + rank + 1));
    });
    return scores;
}
/**
 * Hybrid Retriever
 */
export class HybridRetriever {
    chunks = [];
    constructor(chunks = []) {
        this.chunks = chunks;
    }
    setChunks(chunks) {
        this.chunks = chunks;
    }
    retrieve(analysis, queryEmbedding, limit = 5) {
        const query = analysis.expandedTerms.join(' ');
        // 1. Lexical Retrieval
        const scoredLexical = this.chunks
            .map((chunk) => {
            let score = calculateLexicalScore(query, chunk);
            // Boost if matches targetProject detected by NLP
            if (analysis.targetProject && chunk.projectId === analysis.targetProject) {
                score *= 1.8;
            }
            return { chunk, score };
        })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score);
        const lexicalChunks = scoredLexical.map((item) => item.chunk);
        // 2. Semantic Retrieval (if embedding is available)
        let semanticChunks = [];
        if (queryEmbedding && queryEmbedding.length > 0) {
            semanticChunks = this.chunks
                .filter((c) => c.embedding && c.embedding.length > 0)
                .map((chunk) => {
                const sim = cosineSimilarity(queryEmbedding, chunk.embedding);
                return { chunk, score: sim };
            })
                .sort((a, b) => b.score - a.score)
                .map((item) => item.chunk);
        }
        // 3. Fusion & Ranking
        const rrfScores = reciprocalRankFusion(lexicalChunks, semanticChunks);
        const results = this.chunks
            .map((chunk) => {
            const rrf = rrfScores.get(chunk.chunkId) || 0;
            const lexItem = scoredLexical.find((l) => l.chunk.chunkId === chunk.chunkId);
            const lexScore = lexItem ? lexItem.score : 0;
            // Final score combines RRF with raw lexical signal
            const combinedScore = rrf * 10 + lexScore * 0.1;
            return {
                chunk,
                score: combinedScore,
                lexicalScore: lexScore,
            };
        })
            .filter((res) => res.score > 0.05)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        return results;
    }
    generateCitations(results) {
        const seen = new Set();
        const citations = [];
        for (const res of results) {
            const key = `${res.chunk.documentId}-${res.chunk.section}`;
            if (!seen.has(key)) {
                seen.add(key);
                citations.push({
                    sourceId: res.chunk.chunkId,
                    title: res.chunk.title,
                    section: res.chunk.section,
                    projectId: res.chunk.projectId,
                    url: res.chunk.url,
                    filePath: res.chunk.filePath,
                    relevanceScore: Math.round(res.score * 100) / 100,
                });
            }
        }
        return citations;
    }
}
